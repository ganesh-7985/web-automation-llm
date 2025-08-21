import { log } from "../utils/logger.js";

/**
 * Execute a simple LLM-generated plan.
 * Supported step formats:
 *   go:URL                     -> navigate to URL
 *   click:SELECTOR             -> click element matching selector
 *   type:SELECTOR|TEXT         -> fill selector with text
 */
export async function executePlan({ page, steps }) {
  for (const raw of steps || []) {
    if (typeof raw !== "string") continue;
    const [action, ...rest] = raw.split(":");
    const arg = rest.join(":").trim();
    log.step(`Executing: ${raw}`);
    try {
      if (action === "go") {
        await page.goto(arg, { waitUntil: "domcontentloaded" });
      } else if (action === "click") {
        await page.locator(arg).click();
      } else if (action === "type") {
        const [sel, value] = arg.split("|", 2);
        if (sel && value !== undefined) {
          await page.locator(sel.trim()).fill(value.trim());
        } else {
          log.warn(`Malformed type step: ${raw}`);
        }
      } else {
        log.warn(`Unknown step: ${raw}`);
      }
    } catch (err) {
      log.error(`Failed step '${raw}': ${err?.message || err}`);
      throw err;
    }
  }
}