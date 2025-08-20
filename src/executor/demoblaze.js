import { demoblazeSelectors as S } from "../selectors/demoblaze.selectors.js";
import { parsePriceToNumber } from "../utils/parse.js";
import { log } from "../utils/logger.js";

const BASE = "https://demoblaze.com";

export async function runDemoblazeFlow({ page, goal, llmChooseFn, headed }) {
  // STEP 1: open site
  log.step("Opening site…");
  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  // STEP 2: click category "Laptops"
  log.step('Selecting category "Laptops"…');
  await page.locator(S.categoryLink("Laptops")).click();

  // STEP 3: collect product tiles
  log.step("Collecting visible products…");
  await page.waitForSelector(S.productTiles, { timeout: 15000 });

  const tiles = page.locator(S.productTiles);
  const count = await tiles.count();

  const items = [];
  for (let i = 0; i < count; i++) {
    const tile = tiles.nth(i);

    const name = (await tile.locator(S.productNameInTile).first().innerText().catch(() => ""))?.trim();
    const priceRaw = (await tile.locator(S.productPriceInTile).first().innerText().catch(() => ""))?.trim();
    const href =
      (await tile.locator(S.productNameInTile).first().getAttribute("href").catch(() => null)) || null;

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

  // STEP 4: LLM chooses best
  const choice = await llmChooseFn({ goal, items });
  const chosen = items[Math.max(0, Math.min(items.length - 1, choice.index))];
  log.success(`LLM chose: [${choice.index}] ${chosen?.name} — ${chosen?.priceRaw}`);
  log.info(`Reason: ${choice.reason}`);

  // STEP 5: open details & click Add to cart
  log.step("Opening chosen product page…");
  await page.goto(chosen.detailsLink, { waitUntil: "domcontentloaded" });

  const dialogPromise = page.waitForEvent("dialog", { timeout: 30000 }).catch(() => null);

  log.step('Clicking "Add to cart"…');
  await page.locator(S.addToCartButton).click();

  const dialog = await dialogPromise;
  if (dialog) {
    log.success(`Dialog: "${dialog.message()}" (accepting)`);
    await dialog.accept();
  } else {
    log.warn("No dialog appeared—button click may still have worked.");
  }

  log.success("Flow completed.");
}
