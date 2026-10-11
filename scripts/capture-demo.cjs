const { chromium } = require("playwright");
const sharp = require("sharp");
const path = require("node:path");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROME_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROME_EXECUTABLE }
      : {})
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 720 }, deviceScaleFactor: 1 });
  await page.goto(`file://${path.join(__dirname, "../tests/fixture.html")}`);
  await page.waitForTimeout(250);

  const frames = [await page.screenshot({ type: "png" })];
  await page.locator(".tc-trigger").click();
  await page.waitForTimeout(250);
  frames.push(await page.screenshot({ type: "png" }));
  await page.locator(".tc-search input").fill("第二");
  frames.push(await page.screenshot({ type: "png" }));
  await page.waitForTimeout(300);
  frames.push(await page.screenshot({ type: "png" }));
  await page.locator(".tc-search input").fill("");
  frames.push(await page.screenshot({ type: "png" }));
  await page.locator(".tc-entry").nth(1).click();
  await page.waitForTimeout(450);
  frames.push(await page.screenshot({ type: "png" }));
  await page.waitForTimeout(550);
  frames.push(await page.screenshot({ type: "png" }));

  const rendered = await Promise.all(frames.map((frame) =>
    sharp(frame).resize({ width: 900 }).raw().toBuffer({ resolveWithObject: true })
  ));
  const { width, height, channels } = rendered[0].info;
  await sharp(Buffer.concat(rendered.map(({ data }) => data)), {
    raw: { width, height: height * rendered.length, channels, pageHeight: height }
  }).gif({ loop: 0, delay: [900, 900, 1100, 700, 500, 800, 1200], effort: 4 }).toFile(path.join(__dirname, "../assets/demo.gif"));

  await browser.close();
  console.log("assets/demo.gif generated");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
