import "dotenv/config";
import Groq from "groq-sdk";
import { coerceJSON } from "./utils/parse.js";
import { log } from "./utils/logger.js";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

export async function llmPlan({ goal, site = "demoblaze" }) {
  const system =
    "You are a concise planning assistant for browser automation. " +
    "Output STRICT JSON with shape: {\"goal\": string, \"steps\": string[]} " +
    "Return JSON only. No Markdown. No code fences.";

  const user = JSON.stringify({
    site,
    goal,
    examples: [
      {
        goal: "find laptop under $800 with 8GB RAM and add to cart",
        steps: [
          "go:https://demoblaze.com",
          "click:category Laptops",
          "collect:list products {name, price, detailsLink}",
          "choose:best by budget<=800 and prefer '8GB' in name/specs",
          "go:best.detailsLink",
          "click:Add to cart"
        ]
      }
    ]
  });

  const res = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });

  const content = res?.choices?.[0]?.message?.content ?? "{}";
  const json = coerceJSON(content, { goal, steps: [] });
  if (!Array.isArray(json.steps)) json.steps = [];
  log.info("LLM plan:", JSON.stringify(json, null, 2));
  return json;
}

/**
 * Ask Groq to choose ONE best item by index.
 * Returns { index, reason }.
 */
export async function llmChoose({ goal, items }) {
  const system =
    "You are a selection assistant. Given a user goal and list of items, " +
    "choose ONE best item by index. Return STRICT JSON {\"index\": number, \"reason\": string}. " +
    "Prefer items matching budget/features in the goal; ties -> lower price. " +
    "JSON only. No Markdown.";

  const user = JSON.stringify({ goal, items }, null, 2);

  const res = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });

  const content = res?.choices?.[0]?.message?.content ?? "{}";
  const json = coerceJSON(content, { index: 0, reason: "fallback to first" });
  if (typeof json.index !== "number") json.index = 0;
  if (typeof json.reason !== "string") json.reason = "fallback to first";
  return json;
}
