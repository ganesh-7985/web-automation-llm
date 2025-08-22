import fs from "fs";
import path from "path";
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
            } else if (action === "wait") {
                const ms = Number(arg);
                if (!Number.isNaN(ms)) {
                    await page.waitForTimeout(ms);
                } else if (arg) {
                    await page.waitForSelector(arg);
                } else {
                    log.warn(`Malformed wait step: ${raw}`);
                }
            } else if (action === "screenshot") {
                const file = arg || `step-${Date.now()}.png`;
                const outPath = path.resolve("screenshots", file);
                fs.mkdirSync(path.dirname(outPath), { recursive: true });
                await page.screenshot({ path: outPath });
                log.info(`Saved screenshot to ${outPath}`);
            } else {
                log.warn(`Unknown step: ${raw}`);
            }
        } catch (err) {
            log.error(`Failed step '${raw}': ${err?.message || err}`);
            throw err;
        }
    }
}