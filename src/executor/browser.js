import { chromium } from "playwright";

export async function launchBrowser({ headed = false } = {}) {
  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36"
  });
  const page = await context.newPage();
  return { browser, context, page };
}
