import { chromium } from "playwright";
const [,, base, outDir] = process.argv;
const browser = await chromium.launch();
const log = [];
const check = (name, ok, extra = "") => log.push(`${ok ? "PASS" : "FAIL"} ${name} ${extra}`);

for (const [name, w, h] of [["desktop", 1440, 900], ["phone", 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && log.push(`CONSOLE ${name}: ${m.text()}`));
  page.on("pageerror", (e) => log.push(`PAGEERROR ${name}: ${e.message}`));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const mode = await page.getAttribute(".fold", "data-mode");
  check(`${name}: mode is ${name === "desktop" ? "sheet" : "stack"}`, mode === (name === "desktop" ? "sheet" : "stack"), mode);
  await page.screenshot({ path: `${outDir}/s-${name}-1-closed.png` });

  if (name === "desktop") {
    const unit = 0.8 * h;
    const at = async (t) => {
      const target = Math.round(t * unit);
      let y = await page.evaluate(() => window.scrollY);
      while (Math.abs(target - y) > 2) {
        const step = Math.max(-120, Math.min(120, target - y));
        await page.mouse.wheel(0, step);
        await page.waitForTimeout(16);
        y = await page.evaluate(() => window.scrollY);
      }
      await page.waitForTimeout(1300);
    };
    await at(0.45);
    await page.screenshot({ path: `${outDir}/s-${name}-2-opening.png` });
    await at(1);
    await page.screenshot({ path: `${outDir}/s-${name}-3-intro.png` });
    await at(2);
    await page.screenshot({ path: `${outDir}/s-${name}-4-left.png` });
    await at(2.5);
    await page.screenshot({ path: `${outDir}/s-${name}-5-down-mid.png` });
    await at(3);
    await page.screenshot({ path: `${outDir}/s-${name}-6-down.png` });
    await at(4.6);
    await page.screenshot({ path: `${outDir}/s-${name}-7-open.png` });
    check("sheet reports open", (await page.getAttribute(".fold", "data-stage")) === "open");
    // Zoom in, drag, fit
    await page.getByRole("button", { name: "Zoom in" }).click();
    await page.waitForTimeout(500);
    await page.mouse.move(720, 450);
    await page.mouse.down();
    await page.mouse.move(520, 300, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${outDir}/s-${name}-8-zoomed.png` });
    check("drag did not open a dialog", (await page.locator("dialog[open]").count()) === 0);
    await page.getByRole("button", { name: "Fit" }).click();
    await page.waitForTimeout(500);
    // Click a panel
    await page.locator('.lift[href="#wayfinder"]').click();
    await page.waitForTimeout(700);
    check("clicking a panel lifts its case study", (await page.locator("dialog#case-wayfinder[open]").count()) === 1);
    await page.screenshot({ path: `${outDir}/s-${name}-9-case.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    check("Escape closes it and clears the hash", (await page.locator("dialog[open]").count()) === 0 && !page.url().includes("#"));
    await at(5.75);
    await page.screenshot({ path: `${outDir}/s-${name}-10-folding.png` });
    await at(7.1);
    await page.screenshot({ path: `${outDir}/s-${name}-11-card.png` });
    check("sheet reports card", (await page.getAttribute(".fold", "data-stage")) === "card");
    check("save button visible", await page.getByRole("button", { name: /Save the card/ }).isVisible());
    const dl = page.waitForEvent("download", { timeout: 8000 }).catch(() => null);
    await page.getByRole("button", { name: /Save the card/ }).click();
    const d = await dl;
    check("save downloads a png", Boolean(d) && d.suggestedFilename().endsWith(".png"), d ? d.suggestedFilename() : "none");
    if (d) await d.saveAs(`${outDir}/s-card-download.png`);
    await page.evaluate(() => document.querySelector("#flat").scrollIntoView());
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${outDir}/s-${name}-12-flat.png` });
  } else {
    await page.screenshot({ path: `${outDir}/s-${name}-full.png`, fullPage: true });
    await page.evaluate(() => document.querySelector('.lift[href="#tide-clock"]').scrollIntoView({ block: "center" }));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${outDir}/s-${name}-2-panel.png` });
    await page.locator('.lift[href="#tide-clock"]').click();
    await page.waitForTimeout(600);
    check("phone: panel opens case", (await page.locator("dialog#case-tide-clock[open]").count()) === 1);
    await page.screenshot({ path: `${outDir}/s-${name}-3-case.png` });
  }
  await ctx.close();
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
check("reduced motion uses stack mode", (await page.getAttribute(".fold", "data-mode")) === "stack");
await page.screenshot({ path: `${outDir}/s-reduced.png` });
await ctx.close();
console.log(log.join("\n"));
await browser.close();
