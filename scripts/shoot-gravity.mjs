import { chromium } from "playwright";
const [,, base, outDir] = process.argv;
const browser = await chromium.launch();
const log = [];
const check = (name, ok, extra = "") => log.push(`${ok ? "PASS" : "FAIL"} ${name} ${extra}`);

for (const [name, w, h, touch] of [["desktop", 1440, 900, false], ["phone", 390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && log.push(`CONSOLE ${name}: ${m.text()}`));
  page.on("pageerror", (e) => log.push(`PAGEERROR ${name}: ${e.message}`));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForSelector(".room[data-ready]");
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${outDir}/g-${name}-1-dropping.png` });
  await page.waitForTimeout(4500);
  await page.screenshot({ path: `${outDir}/g-${name}-2-settled.png` });

  const inRoom = await page.evaluate(() => {
    const room = document.querySelector(".room").getBoundingClientRect();
    const floor = document.querySelector(".bar").getBoundingClientRect().top;
    return [...document.querySelectorAll("[data-obj]")].every((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      return cx > room.left && cx < room.right && cy > 0 && cy < floor;
    });
  });
  check(`${name}: every object landed inside the room`, inRoom);

  if (name === "desktop") {
    // Drag a card and throw it: it should move, and must not open the case study.
    const card = page.locator('[data-kind="card"]').first();
    const b = await card.boundingBox();
    const sx = b.x + b.width / 2, sy = b.y + b.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(700, 250, { steps: 12 });
    await page.waitForTimeout(250);
    const mid = await card.boundingBox();
    await page.mouse.up();
    check("drag moves the card", Math.hypot(mid.x + mid.width / 2 - sx, mid.y + mid.height / 2 - sy) > 80);
    check("drag does not open a case study", (await page.locator("dialog[open]").count()) === 0 && !page.url().includes("#"));
    await page.waitForTimeout(1500);

    // Shake
    const before = await card.boundingBox();
    await page.getByRole("button", { name: "Shake" }).click();
    await page.waitForTimeout(350);
    const after = await card.boundingBox();
    check("shake moves things", Math.abs(after.y - before.y) > 10);
    await page.waitForTimeout(2500);
  }

  // Tidy up
  await page.getByRole("button", { name: "Tidy up" }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/g-${name}-3-tidy.png` });
  const tidy = await page.evaluate(() =>
    [...document.querySelectorAll("[data-obj]")].every((el) => !el.style.transform || el.style.transform === "none"));
  check(`${name}: tidy returns every object home`, tidy);

  // Open a case study from a card (click in tidy mode), then close with Escape
  await page.locator('[data-kind="card"]').nth(3).click();
  await page.waitForTimeout(600);
  check(`${name}: card opens its case study`, (await page.locator("dialog#case-wayfinder[open]").count()) === 1);
  await page.screenshot({ path: `${outDir}/g-${name}-4-case.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check(`${name}: Escape closes it and clears the hash`, (await page.locator("dialog[open]").count()) === 0 && !page.url().includes("#"));

  // Mess it up again, then click (no drag) a card in mess mode
  await page.getByRole("button", { name: "Mess it up" }).click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${outDir}/g-${name}-5-messed.png` });
  if (name === "desktop") {
    await page.keyboard.press("t");
    await page.waitForTimeout(1200);
    check("T key tidies", (await page.locator('.room[data-mode="tidy"]').count()) === 1);
    await page.screenshot({ path: `${outDir}/g-${name}-6-full.png`, fullPage: true });
  }
  // Direct link to a case study
  await page.goto(base + "#low-tide", { waitUntil: "networkidle" });
  await page.waitForSelector(".room[data-ready]");
  await page.waitForTimeout(500);
  check(`${name}: direct link opens the case study`, (await page.locator("dialog#case-low-tide[open]").count()) === 1);
  await ctx.close();
}

// Reduced motion: starts tidy
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForSelector(".room[data-ready]");
check("reduced motion starts tidy", (await page.locator('.room[data-mode="tidy"]').count()) === 1);
await ctx.close();

console.log(log.join("\n"));
await browser.close();
