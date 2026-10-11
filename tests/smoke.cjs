const { chromium } = require("playwright");
const path = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROME_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROME_EXECUTABLE }
      : {})
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`file://${path.join(__dirname, "fixture.html")}`);
  await page.waitForTimeout(100);

  assert.deepEqual(errors, [], `content script errors: ${errors.join("; ")}`);
  assert.equal(await page.locator(".tc-root").count(), 1, "navigator should mount once");
  assert.equal(await page.locator(".tc-entry").count(), 3, "three user questions should be indexed");
  assert.equal(await page.locator(".tc-trigger__count").textContent(), "3");

  await page.locator(".tc-trigger").click();
  assert.equal(await page.locator(".tc-root").getAttribute("data-open"), "true");
  await page.locator(".tc-entry").nth(1).click();
  await page.waitForTimeout(950);
  const targetTop = await page.locator("[data-testid='conversation-turn-2'] .group\\/user-message").evaluate((node) => node.getBoundingClientRect().top);
  const paneTop = await page.locator(".scroll-pane").evaluate((node) => node.getBoundingClientRect().top);
  assert.ok(Math.abs(targetTop - paneTop - 84) < 4, "clicked question should align with the reading offset");
  assert.equal(await page.locator(".tc-root").getAttribute("data-open"), "false");

  await browser.close();
  console.log("smoke test passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
