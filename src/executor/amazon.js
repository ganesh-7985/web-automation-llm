import { amazonSelectors as S } from "../selectors/amazon.selectors.js";
import { parsePriceToNumber } from "../utils/parse.js";
import { log } from "../utils/logger.js";

const BASE = "https://www.amazon.com";

export async function runAmazonFlow({ page, goal, llmChooseFn }) {
  // STEP 1: open site
  log.step("Opening Amazon…");
  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  // STEP 2: search for the goal text
  log.step(`Searching for "${goal}"…`);
  await page.locator(S.searchInput).fill(goal);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.locator(S.searchSubmit).click()
  ]);

  // STEP 3: collect product tiles
  log.step("Collecting visible products…");
  await page.waitForSelector(S.searchResults, { timeout: 15000 });
  const tiles = page.locator(S.searchResults);
  const count = await tiles.count();

  const items = [];
  for (let i = 0; i < Math.min(count, 10); i++) {
    const tile = tiles.nth(i);
    const name = (await tile
      .locator(S.productTitleInResult)
      .first()
      .innerText()
      .catch(() => ""))?.trim();
    const priceRaw = (await tile
      .locator(S.productPriceInResult)
      .first()
      .innerText()
      .catch(() => ""))?.trim();
    const href = await tile
      .locator("h2 a")
      .first()
      .getAttribute("href")
      .catch(() => null);

    const detailsLink = href ? new URL(href, BASE).toString() : null;
    const priceNumber = parsePriceToNumber(priceRaw);

    if (name && detailsLink) {
      items.push({ name, priceRaw, priceNumber, detailsLink });
    }
  }

  if (!items.length) {
    throw new Error("No products found. The site layout may have changed.");
  }

  log.info("Found products:");
  items.forEach((it, i) => log.info(`  [${i}] ${it.name} — ${it.priceRaw}`));

  // STEP 4: let LLM choose best
  const choice = await llmChooseFn({ goal, items });
  const chosen = items[Math.max(0, Math.min(items.length - 1, choice.index))];
  log.success(`LLM chose: [${choice.index}] ${chosen.name} — ${chosen.priceRaw}`);
  log.info(`Reason: ${choice.reason}`);

  // STEP 5: open details & add to cart
  log.step("Opening chosen product page…");
  await page.goto(chosen.detailsLink, { waitUntil: "domcontentloaded" });

  log.step('Clicking "Add to cart"…');
  await page.locator(S.addToCartButton).click();

  log.success("Flow completed.");
}