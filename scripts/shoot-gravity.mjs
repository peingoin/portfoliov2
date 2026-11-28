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
    const floor = document.querySelector(".dock").getBoundingClientRect().top;
    return [...document.querySelectorAll("[data-obj]")].every((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      return cx > room.left && cx < room.right && cy > room.top && cy < floor;
    });
  });
  check(`${name}: every object landed inside the room`, inRoom);
  check(`${name}: the intro line is visible`, await page.locator(".room-intro").isVisible());

  if (name === "desktop") {
    // Drag a token and throw it: it should move, and must not navigate.
    const token = page.locator('[data-kind="token"]').first();
    const b = await token.boundingBox();
    const sx = b.x + b.width / 2, sy = b.y + b.height / 2;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(700, 250, { steps: 12 });
    await page.waitForTimeout(250);
    const mid = await token.boundingBox();
    await page.mouse.up();
    check("drag moves the token", Math.hypot(mid.x + mid.width / 2 - sx, mid.y + mid.height / 2 - sy) > 80);
    check("drag does not navigate", !page.url().includes("#"));
    await page.waitForTimeout(1500);

    const before = await token.boundingBox();
    await page.getByRole("button", { name: "Boost" }).click();
    await page.waitForTimeout(350);
    const after = await token.boundingBox();
    check("boost moves things", Math.hypot(after.x - before.x, after.y - before.y) > 10);
    await page.waitForTimeout(2500);
  }

  // Dock
  await page.getByRole("button", { name: "Dock" }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/g-${name}-3-docked.png` });
  const docked = await page.evaluate(() =>
    [...document.querySelectorAll("[data-obj]")].every((el) => !el.style.transform || el.style.transform === "none"));
  check(`${name}: dock returns every object home`, docked);

  // A token click jumps to its card in Selected work.
  await page.locator('[data-kind="token"]', { hasText: "Wayfinder" }).click();
  await page.waitForTimeout(1200);
  const inView = await page.evaluate(() => {
    const r = document.getElementById("card-wayfinder").getBoundingClientRect();
    return r.top >= 0 && r.bottom <= innerHeight;
  });
  check(`${name}: token jumps to its card without a raw hash entry`, inView && !page.url().includes("#"));
  await page.screenshot({ path: `${outDir}/g-${name}-4-work.png` });

  // Filter
  await page.getByRole("button", { name: /^Design/ }).click();
  check(`${name}: filter shows only design`, (await page.locator(".work-grid li:not([hidden])").count()) === 2);
  await page.getByRole("button", { name: /^All/ }).click();
  check(`${name}: All shows six`, (await page.locator(".work-grid li:not([hidden])").count()) === 6);

  // A card opens its case study page; Back returns to the room.
  await page.locator("#card-wayfinder a").click();
  await page.waitForURL("**/work/wayfinder/");
  await page.waitForTimeout(800);
  check(`${name}: card opens its case study page`, (await page.locator("h1", { hasText: "Wayfinder" }).count()) === 1);
  check(`${name}: case page shows stats and tools`, (await page.locator(".stat").count()) >= 2 && (await page.locator(".tool-pills li").count()) >= 2);
  await page.screenshot({ path: `${outDir}/g-${name}-5-case.png` });
  await page.screenshot({ path: `${outDir}/g-${name}-5-case-full.png`, fullPage: true });
  await page.goBack();
  await page.waitForSelector(".room[data-ready]");
  check(`${name}: Back returns to the room`, new URL(page.url()).pathname === "/");

  // Launch again, then T docks
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  if (name === "desktop") {
    await page.waitForTimeout(2000);
    const was = await page.locator(".room").getAttribute("data-mode");
    await page.keyboard.press("t");
    await page.waitForTimeout(1200);
    check("T key toggles the room", (await page.locator(".room").getAttribute("data-mode")) !== was);
    if (was === "tidy") await page.keyboard.press("t");
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${outDir}/g-${name}-6-full.png`, fullPage: true });
  }

  // Old #slug links go on to the case page.
  await page.goto(base + "#low-tide");
  await page.waitForURL("**/work/low-tide/", { timeout: 8000 }).catch(() => {});
  check(`${name}: old #slug link redirects`, page.url().includes("/work/low-tide/"));
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
