// Scroll checks for the Gravity Room:
//   node scripts/shoot-gravity-scroll.mjs <base-url> <out-dir> [scene]
// scene is orbit, supernova or planetfall; left out, the site's default runs.
import { chromium } from "playwright";
const [,, origin, outDir, sceneArg] = process.argv;
const base = sceneArg ? `${origin}?scene=${sceneArg}` : origin;
// Where each scene should be showing a discipline's tools, as progress through the pinned stretch.
// `sets` lists which disciplines must be readable there.
const PROBES = {
  orbit: [{ p: 1 / 6, sets: [0] }, { p: 3 / 6, sets: [1] }, { p: 5 / 6, sets: [2] }],
  supernova: [{ p: 0.97, sets: [0, 1, 2] }],
  planetfall: [0, 1, 2].map((k) => ({ p: 0.18 + ((0.86 - 0.18) / 3) * (k + 0.65), sets: [k] })),
};
const browser = await chromium.launch();
const log = [];
const check = (name, ok, extra = "") => log.push(`${ok ? "PASS" : "FAIL"} ${name} ${extra}`);

for (const [name, w, h] of [["desktop", 1440, 900], ["phone", 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && log.push(`CONSOLE ${name}: ${m.text()}`));
  page.on("pageerror", (e) => log.push(`PAGEERROR ${name}: ${e.message}`));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForSelector(".room[data-ready]");
  await page.waitForTimeout(5500);
  await page.mouse.move(w / 2, h / 2);

  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const ys = () => page.evaluate(() => [...document.querySelectorAll("[data-obj]")].map((e) => e.getBoundingClientRect().top + scrollY));
  const before = await ys();
  await page.mouse.wheel(0, 260);
  await page.waitForTimeout(60);
  await page.screenshot({ path: `${outDir}/s-${name}-0-shove.png` });
  const after = await ys();
  const moved = after.reduce((s, y, i) => s + (y - before[i]), 0) / after.length;
  check(`${name}: scrolling down shoves the blocks toward the deck`, moved > 4, `(mean ${moved.toFixed(1)}px)`);

  let shot = 1;
  let small = 0;
  const orbit = await page.evaluate(() => {
    const o = document.getElementById("orbit");
    return { top: o.offsetTop, len: o.offsetHeight - innerHeight };
  });
  const scene = await page.evaluate(() => document.documentElement.dataset.scene);
  const probes = PROBES[scene].map((x) => ({ ...x }));
  if (sceneArg) check(`${name}: ?scene= selects ${sceneArg}`, scene === sceneArg, `(got ${scene})`);
  let nearSeen = false, farSeen = false, lastPart = -1;
  for (let y = 260; y < max; y += 130) {
    await page.mouse.wheel(0, 130);
    await page.waitForTimeout(90);
    if (!small) small = await page.evaluate(() => (getComputedStyle(document.querySelector(".ship")).visibility === "visible" ? parseFloat(document.querySelector(".ship").style.width) : 0));
    const z = (y > orbit.top && y < orbit.top + orbit.len) ? await page.evaluate(() => document.querySelector(".ship").style.zIndex) : null;
    if (z === "2") nearSeen = true; else if (z !== null) farSeen = true;
    // At each probe: nudge to the exact spot, check the tools are readable, take a shot, nudge back.
    const probe = probes.find((x) => !x.done && y + 130 >= orbit.top + x.p * orbit.len);
    if (probe) {
      probe.done = true;
      const nudge = Math.round(orbit.top + probe.p * orbit.len - (await page.evaluate(() => scrollY)));
      await page.mouse.wheel(0, nudge);
      await page.waitForTimeout(900);
      const o = await page.evaluate((want) => {
        const stage = document.querySelector(".orbit-stage").getBoundingClientRect();
        const all = [...document.querySelectorAll("[data-set]")];
        const pills = want.flatMap((k) => [...all[k].querySelectorAll("[data-sat]")]).map((el) => ({ r: el.getBoundingClientRect(), o: +el.style.opacity }));
        const titles = want.map((k) => all[k].querySelector(".orbit-title")).map((el) => ({ r: el.getBoundingClientRect(), o: +el.style.opacity }));
        const boxes = [...pills, ...titles];
        const apart = (a, b) => a.r.right < b.r.left + 2 || b.r.right < a.r.left + 2 || a.r.bottom < b.r.top + 2 || b.r.bottom < a.r.top + 2;
        return { pinned: Math.abs(stage.top) < 1, shown: boxes.every((q) => q.o > 0.8),
          inView: boxes.every((q) => q.r.left >= 0 && q.r.right <= innerWidth && q.r.top >= 0 && q.r.bottom <= innerHeight),
          clear: boxes.every((a, i) => boxes.every((b, j) => i >= j || apart(a, b))) };
      }, probe.sets);
      check(`${name}: ${scene} at ${Math.round(probe.p * 100)}%: stage pinned, tools ${probe.sets.map((k) => k + 1).join("+")} showing, on screen, not overlapping`,
        o.pinned && o.shown && o.inView && o.clear, JSON.stringify(o));
      await page.screenshot({ path: `${outDir}/s-${name}-${scene}-${Math.round(probe.p * 100)}.png` });
      await page.mouse.wheel(0, -nudge);
      await page.waitForTimeout(150);
    }
    // A few shots of the scene in motion.
    const part = Math.floor(((y - orbit.top) / orbit.len) * 12);
    if (y > orbit.top && part < 12 && part !== lastPart) {
      lastPart = part;
      await page.screenshot({ path: `${outDir}/s-${name}-${scene}-run-${String(part).padStart(2, "0")}.png` });
    }
    if (Math.floor(y / 130) % 6 === 0) await page.screenshot({ path: `${outDir}/s-${name}-${shot++}-mid.png` });
  }
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${outDir}/s-${name}-9-end.png` });

  const end = await page.evaluate(() => {
    const units = [...document.querySelectorAll("[data-u]")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight;
    });
    const docked = units.every((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return Math.hypot(m.e, m.f) < 1.5 && Math.abs(m.b) < 0.02 && getComputedStyle(el).opacity === "1";
    });
    const el = document.querySelector(".ship");
    const ship = el.getBoundingClientRect();
    return { docked, n: units.length, w: parseFloat(el.style.width), mid: ship.left + ship.width / 2, top: ship.top, vis: getComputedStyle(el).visibility,
      flame: el.style.getPropertyValue("--thrust"), read: document.querySelector(".telemetry").textContent,
      overflow: document.documentElement.scrollWidth > innerWidth };
  });
  check(`${name}: all ${end.n} visible letters and pills are docked and at rest at the end`, end.docked);
  check(`${name}: ship has grown, landed on screen and cut its engine`, end.vis === "visible" && end.w >= 200 && end.mid > 0 && end.mid < w && end.top < h && +end.flame === 0 && end.read === "Touchdown.", JSON.stringify(end));
  check(`${name}: ship starts small`, small > 0 && small < 80, `(${small}px)`);
  if (scene === "orbit") check(`${name}: ship passes both in front of and behind the planet`, nearSeen && farSeen);
  check(`${name}: every probe ran`, probes.every((x) => x.done));
  check(`${name}: no sideways scroll`, !end.overflow);

  for (let y = max; y > -200; y -= 200) { await page.mouse.wheel(0, -200); await page.waitForTimeout(40); }
  await page.waitForTimeout(1500);
  const top = await page.evaluate(() => ({ vis: getComputedStyle(document.querySelector(".ship")).visibility, y: scrollY }));
  check(`${name}: back at the top the ship is hidden again`, top.vis === "hidden" && top.y === 0);
  await page.screenshot({ path: `${outDir}/s-${name}-10-top.png` });
  await ctx.close();
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForSelector(".room[data-ready]");
await page.evaluate(() => scrollTo(0, 99999));
await page.waitForTimeout(400);
const still = await page.evaluate(() => getComputedStyle(document.querySelector(".ship")).display === "none" && [...document.querySelectorAll("[data-u]")].every((e) => !e.style.transform));
check("reduced motion: no ship, nothing moves", still);
check("reduced motion: tools are a plain list", await page.evaluate(() => document.getElementById("orbit").offsetHeight < innerHeight && getComputedStyle(document.querySelector(".planet")).display === "none"));
await page.screenshot({ path: `${outDir}/s-reduced-end.png` });
await ctx.close();

console.log(log.join("\n"));
await browser.close();
