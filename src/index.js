#!/usr/bin/env node
import "dotenv/config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { launchBrowser } from "./executor/browser.js";
import { llmPlan, llmChoose } from "./planner.js";
import { executePlan } from "./executor/plan.js";
import { runDemoblazeFlow } from "./executor/demoblaze.js";
import { runAmazonFlow } from "./executor/amazon.js";
import { log } from "./utils/logger.js";

const argv = yargs(hideBin(process.argv))
  .usage("$0 <goal> [options]")
  .positional("goal", {
    describe: "Natural-language goal, e.g., 'laptop under $800 with 8GB RAM'",
    type: "string"
  })
  .option("site", {
    type: "string",
    default: "generic",
    describe: "Target site adapter (generic|demoblaze|amazon)"
  })
  .option("headed", {
    type: "boolean",
    default: false,
    describe: "Run with a visible browser window"
  })
  .demandCommand(1)
  .help()
  .parse();

const goal = argv._.join(" ").trim();
const headed = Boolean(argv.headed);
const site = argv.site;

async function main() {
  if (!process.env.GROQ_API_KEY) {
    log.error("Missing GROQ_API_KEY in .env");
    process.exit(1);
  }

  log.info("Goal:", goal);
  log.info("Site:", site);
  log.info("Headed:", headed);

  const { browser, page } = await launchBrowser({ headed });
  try {
    let plan;
    if (site === "generic") {
      plan = await llmPlan({ goal, site });
    }

    if (site === "demoblaze") {
      await runDemoblazeFlow({
        page,
        goal,
        llmChooseFn: llmChoose,
        headed
      });
    }else if (site === "amazon") {
        await runAmazonFlow({
          page,
          goal,
          llmChooseFn: llmChoose
        });
    } else {
        await executePlan({ page, steps: plan?.steps });
    }

    log.success("Done.");
  } catch (err) {
    log.error(err?.message || String(err));
    process.exitCode = 1;
  } finally {
    await page.context().browser()?.close();
  }
}

main();
