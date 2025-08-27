import "dotenv/config";
import Groq from "groq-sdk";
import { coerceJSON } from "./utils/parse.js";
import { log } from "./utils/logger.js";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama3-70b-8192";

export async function llmPlan({ goal, site }) {
  const system =
    "You are a concise planning assistant for browser automation. " +
    "Output STRICT JSON {\"goal\": string, \"steps\": string[]} " +
    "Each step must be one of: 'go:URL', 'click:SELECTOR', 'type:SELECTOR|TEXT', " +
    "'select:SELECTOR|VALUE', 'check:SELECTOR', 'wait:SELECTOR_OR_MS', 'screenshot:FILENAME'. " +
    "Return JSON only. No Markdown. No code fences.";

  const user = JSON.stringify({
    site,
    goal,
    examples: [
      {
        goal: "search demo on example.com",
        steps: ["go:https://example.com", "type:#search|demo", "click:#submit", "wait:#results"]
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

/** Choose ONE best item by index using LLM. Returns { index, reason }. */
export async function llmChoose({ goal, items }) {
  const system =
    "You are a selection assistant. Given a user goal and list of items, " +
    "choose ONE best item by index. Return STRICT JSON {\"index\": number, \"reason\": string}. " +
    "Prefer items matching budget/features in the goal; ties -> lower price. JSON only.";

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
