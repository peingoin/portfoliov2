import { chromium } from "playwright";
const [,, base, outDir, tag = ""] = process.argv;
const browser = await chromium.launch();
const errors = [];
for (const [name, w, h] of [["desktop", 1440, 900], ["phone", 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${name}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  for (const [route, slug] of [["/", "home"], ["/gazetteer/", "gazetteer"], ["/projects/wayfinder/", "project"]]) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `${outDir}/${tag}${slug}-${name}.png` });
    if (slug === "home") await page.screenshot({ path: `${outDir}/${tag}${slug}-${name}-full.png`, fullPage: true });
  }
  await ctx.close();
}
console.log(errors.length ? errors.join("\n") : "no console errors");
await browser.close();
