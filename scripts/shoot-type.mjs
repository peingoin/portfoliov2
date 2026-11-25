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
  const mode = await page.getAttribute(".terrain", "data-mode");
  check(`${name}: mode is ${name === "desktop" ? "zoom" : "snap"}`, mode === (name === "desktop" ? "zoom" : "snap"), mode);
  // The name should fill the viewport width.
  const widths = await page.$$eval(".line", (els) => els.map((e) => e.getBoundingClientRect().width));
  check(`${name}: name fills the width`, widths.every((x) => x > w * 0.95 && x < w * 1.25), widths.map(Math.round).join(","));
  await page.screenshot({ path: `${outDir}/t-${name}-1-arrival.png` });

  if (name === "desktop") {
    await page.mouse.move(300, 400);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${outDir}/t-${name}-1b-breathe.png` });
    const H = h, unit = 0.7 * H, per = 2.6;
    // Scroll with the wheel, like a person, so GSAP's snap sees a sane velocity.
    const at = async (t) => {
      const target = Math.round(t * unit);
      let y = await page.evaluate(() => window.scrollY);
      while (Math.abs(target - y) > 2) {
        const step = Math.max(-120, Math.min(120, target - y));
        await page.mouse.wheel(0, step);
        await page.waitForTimeout(16);
        y = await page.evaluate(() => window.scrollY);
      }
    };
    await at(0.5); await page.waitForTimeout(900);
    await page.screenshot({ path: `${outDir}/t-${name}-2-dive.png` });
    await at(1.3); await page.waitForTimeout(1200);
    await page.screenshot({ path: `${outDir}/t-${name}-3-room1.png` });
    const active = await page.$$eval(".room[data-active]", (els) => els.length);
    check("one room active inside the first letter", active === 1, String(active));
    check("strip marks A", (await page.locator('.strip button[aria-current="true"]').textContent()) === "A");
    await at(per * 1 + 1.3); await page.waitForTimeout(1200);
    await page.screenshot({ path: `${outDir}/t-${name}-4-room2.png` });
    check("strip marks U", (await page.locator('.strip button[aria-current="true"]').textContent()) === "U");
    await at(per * 2 + 0.3); await page.waitForTimeout(900);
    await page.screenshot({ path: `${outDir}/t-${name}-5-between.png` });
    await at(per * 5 + 1.3); await page.waitForTimeout(1200);
    await page.screenshot({ path: `${outDir}/t-${name}-6-room6.png` });
    // Click Read the case inside the room
    const link = page.locator('.room[data-active] a:has-text("Read the case")');
    check("case link is clickable", await link.isVisible());
    await at(per * 6 + 0.9); await page.waitForTimeout(1400);
    await page.screenshot({ path: `${outDir}/t-${name}-7-contact.png` });
    const chips = await page.$$eval(".counters a, .counters span", (els) => els.filter((e) => getComputedStyle(e).visibility !== "hidden" && +getComputedStyle(e).opacity > 0.9).length);
    check("contact chips visible at the end", chips === 5, String(chips));
    // Strip click jumps to a room
    await page.locator(".strip button", { hasText: "T" }).click();
    await page.waitForTimeout(1800);
    check("strip click lands in T", (await page.locator('.strip button[aria-current="true"]').textContent()) === "T");
    await page.evaluate(() => document.querySelector("#index").scrollIntoView());
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${outDir}/t-${name}-8-index.png` });
    await page.evaluate(() => document.querySelector("#about").scrollIntoView());
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${outDir}/t-${name}-9-about.png` });
  } else {
    await page.evaluate(() => document.querySelector(".room").scrollIntoView());
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${outDir}/t-${name}-3-room1.png` });
    check("phone strip marks A", (await page.locator('.strip button[aria-current="true"]').textContent()) === "A");
    await page.screenshot({ path: `${outDir}/t-${name}-full.png`, fullPage: true });
  }
  await page.goto(base + "work/wayfinder/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/t-${name}-case.png` });
  await page.screenshot({ path: `${outDir}/t-${name}-case-full.png`, fullPage: true });
  await ctx.close();
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
check("reduced motion uses snap mode", (await page.getAttribute(".terrain", "data-mode")) === "snap");
await ctx.close();
console.log(log.join("\n"));
await browser.close();
