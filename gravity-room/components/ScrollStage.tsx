"use client";

import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { isScene, scenes } from "@/lib/scenes";
import { clamp01, seeded, smooth, spline } from "@/lib/scenes/math";
import type { Parts, Pose, Sat, Scene } from "@/lib/scenes/types";
import { onScrollFrame, type Kin } from "@/lib/scroll";
import { ORBIT_COLORS } from "./Orbit";

/** One letter, pill or label that docks, sways, gets buffeted and catches the light. */
interface Unit {
  el: HTMLElement;
  group: Group;
  /** Rest centre in page coordinates. */
  cx: number;
  cy: number;
  h: number;
  /** Stagger position inside its group, 0 to 1. */
  t: number;
  /** Where it drifts before it docks. */
  dx: number;
  dy: number;
  rot: number;
  /** Its own spring: how far it lags, how stiff, how damped, how much it tips. */
  lag: number;
  k: number;
  c: number;
  sway: number;
  o: number;
  ov: number;
  /** Displacement from the ship's bow wave. */
  px: number;
  py: number;
  pvx: number;
  pvy: number;
}

interface Group {
  el: HTMLElement;
  top: number;
  start: number;
  end: number;
}

/** A spark of exhaust. */
interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  color: string;
}

const EXHAUST = ["#ffc857", "#ffc857", "#ff7a6b", "#f2f0ff"];
const MAX_MOTES = 240;

function pagePos(el: HTMLElement) {
  let x = 0;
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y };
}

// The shortest way round from one angle to another.
function turn(from: number, to: number, amount: number) {
  const d = ((((to - from + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;
  return from + d * amount;
}

const K3 = [0, 0.5, 1];

/**
 * Everything below the room that answers to scrolling. You are flying a ship.
 *
 * Scroll position is where the ship is on its flight path: it lifts off from
 * behind the deck, climbs past About, plays its part in the scene, and comes
 * in to land beside Contact, growing as it gets closer.
 *
 * The scene is the pinned set piece in the middle (lib/scenes). This file
 * owns everything the scenes share: the ship, its sparks, the readout, and
 * the letters. A scene only says where the ship is while its stage is pinned
 * and what the stage looks like. Scroll speed is its throttle: the
 * flame lengthens and it sheds sparks. Scroll back and it turns round and
 * flies home nose first.
 *
 * The ship is also the only light and the only weather. Every letter is lit
 * by how close it is and extruded directly away from it, and anything the
 * ship passes is shoved aside by its bow wave and springs back.
 *
 * Letters and pills have mass too, so they lag when the page moves and bob
 * back when it stops. On the way in they drift loose and dock as their
 * section arrives.
 */
export function ScrollStage() {
  const shipRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef<HTMLCanvasElement>(null);
  const readRef = useRef<HTMLParagraphElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ship = shipRef.current;
    const wake = wakeRef.current;
    const read = readRef.current;
    const about = document.getElementById("about");
    const contact = document.getElementById("contact");
    const orbit = document.getElementById("orbit");
    const stage = orbit?.querySelector<HTMLElement>(".orbit-stage");
    const canvas = orbit?.querySelector<HTMLCanvasElement>(".scene-canvas");
    const daylight = dayRef.current;
    if (!ship || !wake || !read || !about || !contact || !orbit || !stage || !canvas || !daylight) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = wake.getContext("2d");

    const rnd = seeded(77);
    const between = (a: number, b: number) => a + rnd() * (b - a);
    const groups: Group[] = [];
    const units: Unit[] = [];

    document.querySelectorAll<HTMLElement>("[data-dock]").forEach((el) => {
      const group: Group = { el, top: 0, start: 0, end: 0 };
      groups.push(group);
      const list = Array.from(el.querySelectorAll<HTMLElement>("[data-u]"));
      list.forEach((u, i) => {
        units.push({
          el: u,
          group,
          cx: 0,
          cy: 0,
          h: 0,
          t: list.length > 1 ? i / (list.length - 1) : 0,
          dx: between(-1, 1),
          dy: between(-0.5, 1.5),
          rot: between(-0.8, 0.8),
          lag: between(0.35, 1.25),
          k: between(0.07, 0.15),
          c: between(0.13, 0.24),
          sway: between(-0.006, 0.006),
          o: 0,
          ov: 0,
          px: 0,
          py: 0,
          pvx: 0,
          pvy: 0,
        });
      });
    });

    // The scene: named on <html> by the layout, from content/site.ts or ?scene=.
    const sets = Array.from(orbit.querySelectorAll<HTMLElement>("[data-set]"));
    const sats: Sat[] = [];
    sets.forEach((el, set) => {
      const list = Array.from(el.querySelectorAll<HTMLElement>("[data-sat]"));
      list.forEach((sat, i) => sats.push({ el: sat, set, i, n: list.length, w: 0, h: 0 }));
    });
    const parts: Parts = {
      section: orbit,
      stage,
      canvas,
      ctx: canvas.getContext("2d"),
      sets,
      titles: sets.map((el) => el.querySelector<HTMLElement>(".orbit-title")!),
      sats,
      colors: sets.map((_, k) => ORBIT_COLORS[k % ORBIT_COLORS.length]),
      daylight,
    };
    const named = document.documentElement.dataset.scene;
    const scene: Scene = scenes[isScene(named) ? named : site.scene](parts);
    let join: Pose = { x: 0, y: 0, w: 50 };
    let leave: Pose = { x: 0, y: 0, w: 65 };

    let vw = 0;
    let vh = 0;
    let max = 1;
    let startY = 0;
    let oTop = 0;
    let oEnd = 0;
    let final = 0;
    let ax: number[] = [];
    let ay: number[] = [];
    let outX: number[] = [];
    let outY: number[] = [];
    let landing = 0;
    let sx = 0;
    let sy = 0;
    let sw = 0;
    let angle = 0;
    let dir = 1;
    let lastY = -1;
    let energy = 0;
    let fresh = true;
    let motes: Mote[] = [];
    let wakeDirty = false;
    let readout = "";

    // Where the ship should be, and how, for any scroll position: up to the
    // scene, through it, and away to land.
    function flight(y: number): Pose {
      if (y < oTop) {
        const a = clamp01((y - startY) / Math.max(1, oTop - startY));
        return { x: spline(K3, ax, a), y: spline(K3, ay, a), w: 22 + (join.w - 22) * smooth(a) };
      }
      if (y <= oEnd) return scene.pose((y - oTop) / Math.max(1, oEnd - oTop));
      const c = clamp01((y - oEnd) / Math.max(1, max - oEnd));
      return { x: spline(K3, outX, c), y: spline(K3, outY, c), w: leave.w + (final - leave.w) * smooth(c) };
    }

    function measure() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      max = Math.max(1, document.documentElement.scrollHeight - vh);
      startY = Math.max(0, about!.offsetTop - vh);
      oTop = orbit!.offsetTop;
      oEnd = Math.max(oTop + 1, oTop + orbit!.offsetHeight - vh);

      const wide = vw >= 720;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = vw * dpr;
      canvas!.height = vh * dpr;
      parts.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const s of sats) {
        s.w = s.el.offsetWidth;
        s.h = s.el.offsetHeight;
      }
      scene.measure({ vw, vh, wide });

      // The flight path either side of the scene: up from behind the deck to
      // where the scene picks the ship up, and from where it lets go round to
      // land. Wide screens land in the open space beside the contact heading;
      // narrow ones bring the ship up over the bottom edge, nose to the sky.
      join = scene.pose(0);
      leave = scene.pose(1);
      final = wide ? Math.min(280, vw * 0.2) : 240;
      ax = [0.06 * vw, 0.2 * vw, join.x];
      ay = [1.12 * vh, (1.12 * vh + join.y) / 2, join.y];
      outX = [leave.x, (wide ? 0.92 : 0.86) * vw, (wide ? 0.76 : 0.5) * vw];
      outY = [leave.y, (wide ? 0.3 : 0.45) * vh, wide ? 0.6 * vh : vh + 52];
      landing = scene.tailFirst || !wide ? 0 : -0.3;

      wake!.width = vw * dpr;
      wake!.height = vh * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (const g of groups) {
        g.top = pagePos(g.el).y;
        const atEnd = g.top - max;
        g.start = vh * 0.98;
        // Docked within the first two thirds of whatever travel the page allows.
        g.end = Math.max(vh * 0.5, atEnd + (g.start - atEnd) * 0.35);
      }
      for (const u of units) {
        const p = pagePos(u.el);
        u.h = u.el.offsetHeight;
        u.cx = p.x + u.el.offsetWidth / 2;
        u.cy = p.y + u.h / 2;
      }
      fresh = true;
    }

    function drawWake() {
      if (!ctx || (!motes.length && !wakeDirty)) return;
      ctx.clearRect(0, 0, vw, vh);
      wakeDirty = motes.length > 0;
      motes = motes.filter((m) => (m.life -= 16.7) > 0);
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        m.vx *= 0.96;
        m.vy *= 0.96;
        const a = m.life / m.max;
        ctx.globalAlpha = a;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * (0.4 + a * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function tick({ y, v }: Kin) {
      if (!fresh && y === lastY && v === 0 && energy < 0.02 && !motes.length && !wakeDirty) return;
      lastY = y;
      if (v > 0.2) dir = 1;
      else if (v < -0.2) dir = -1;

      // ---- The ship ----
      const g = clamp01((y - startY) / Math.max(1, max - startY));
      const now = flight(y);
      const tx = now.x;
      const ty = now.y;
      const tw = now.w;

      // It points along the path, whichever way you are flying it, and
      // straightens up for the landing.
      const ahead = flight(y + 10);
      const behind = flight(y - 10);
      const settle = smooth(clamp01(((y - oEnd) / Math.max(1, max - oEnd) - 0.55) / 0.45));
      const pinned = y >= oTop && y <= oEnd;
      const along = Math.atan2((ahead.y - behind.y) * dir, (ahead.x - behind.x) * dir) + Math.PI / 2;
      const heading =
        (pinned && now.angle !== undefined
          ? now.angle
          : y > oEnd && scene.tailFirst
            ? landing
            : turn(along, landing, settle)) + (now.spin ?? 0);

      const follow = fresh ? 1 : 0.2;
      sx += (tx - sx) * follow;
      sy += (ty - sy) * follow;
      sw += (tw - sw) * follow;
      const before = angle;
      angle = turn(angle, heading, fresh ? 1 : 0.14);
      energy = Math.abs(tx - sx) + Math.abs(ty - sy) + Math.abs(tw - sw) + Math.abs(angle - before) * 40;

      const sh = sw * 1.2;
      const speed = Math.abs(v);
      const heat = now.heat ?? 0;
      const idle = y > oEnd && scene.tailFirst ? 0.6 * (1 - settle) : 0;
      const thrust = g >= 1 && speed < 0.5 ? 0 : Math.max(now.thrust ?? idle, Math.min(1, 0.1 + speed / 26));
      // A hot hull shakes.
      const shakeX = heat * Math.sin(y * 0.83) * 2.6;
      const shakeY = heat * Math.cos(y * 1.31) * 2.6;
      ship!.style.visibility = g > 0 ? "visible" : "hidden";
      // In front of the planet on the near side of its orbit, behind it on the far side.
      ship!.style.zIndex = now.near ? "2" : "0";
      ship!.style.width = `${sw.toFixed(1)}px`;
      ship!.style.transform = `translate3d(${(sx - sw / 2 + shakeX).toFixed(1)}px, ${(sy - sh / 2 + shakeY).toFixed(
        1,
      )}px, 0) rotate(${angle.toFixed(4)}rad)`;
      ship!.style.setProperty("--thrust", thrust.toFixed(3));
      ship!.style.setProperty("--heat", heat.toFixed(3));
      contact!.style.setProperty("--dawn", (settle * 0.6).toFixed(3));

      // ---- The scene ----
      scene.update({
        p: clamp01((y - oTop) / (oEnd - oTop)),
        arrive: smooth(clamp01((y - (oTop - vh)) / vh)),
        visible: y > oTop - vh * 1.2 && y < oEnd + vh * 1.2,
        speed,
      });

      // Sparks leave the nozzle, straight out the back.
      const backX = -Math.sin(angle);
      const backY = Math.cos(angle);
      if (ctx && g > 0 && speed > 0.6) {
        const n = Math.min(4, Math.ceil(speed / 9));
        for (let j = 0; j < n && motes.length < MAX_MOTES; j++) {
          const life = 380 + Math.random() * 620;
          const kick = 1 + Math.random() * 2.4 + speed * 0.05;
          motes.push({
            x: sx + backX * sw * 0.5 + (Math.random() - 0.5) * sw * 0.14,
            y: sy + backY * sw * 0.5 + (Math.random() - 0.5) * sw * 0.14,
            vx: backX * kick + (Math.random() - 0.5) * 0.9,
            vy: backY * kick + (Math.random() - 0.5) * 0.9,
            life,
            max: life,
            r: Math.max(0.8, Math.min(3.6, sw * 0.028)) * (0.6 + Math.random() * 0.7),
            color: EXHAUST[Math.floor(Math.random() * EXHAUST.length)],
          });
        }
      }
      drawWake();

      const text =
        // Stays out of the way until the room's top row has scrolled off.
        g <= 0 || y < 96 ? "" : g >= 0.995 ? "Touchdown." : `Speed ${Math.round(speed * 60)} · ${Math.round((1 - g) * 100)}% to landing`;
      if (text !== readout) {
        readout = text;
        read!.textContent = text;
        read!.style.visibility = text ? "visible" : "hidden";
      }

      // ---- Letters, labels and pills ----
      const reach = Math.hypot(vw, vh) * 0.7;
      const waveR = sw * 0.7 + 70;
      const waveForce = Math.min(40, 14 + sw * 0.2) * (1 - settle) * (g > 0 ? 1 : 0);
      for (const u of units) {
        const uy = u.cy - y;
        const lx = u.cx - sx;
        const ly = uy - sy;
        const dist = Math.hypot(lx, ly) || 1;

        const target = Math.max(-26, Math.min(26, v * u.lag));
        u.ov += (target - u.o) * u.k - u.ov * u.c;
        u.o += u.ov;

        // The bow wave: anything close to the ship is pushed straight away from it.
        const near = dist < waveR ? Math.pow(1 - dist / waveR, 2) * waveForce : 0;
        const wx = (lx / dist) * near;
        const wy = (ly / dist) * near;
        u.pvx += (wx - u.px) * 0.12 - u.pvx * 0.2;
        u.pvy += (wy - u.py) * 0.12 - u.pvy * 0.2;
        u.px += u.pvx;
        u.py += u.pvy;
        energy +=
          Math.abs(u.ov) + Math.abs(target - u.o) + Math.abs(u.pvx) + Math.abs(u.pvy) + Math.abs(wx - u.px) + Math.abs(wy - u.py);

        if (uy < -320 || uy > vh + 320) continue;

        const grp = u.group;
        const raw = grp.start > grp.end ? clamp01((grp.start - (grp.top - y)) / (grp.start - grp.end)) : 1;
        const e = smooth(clamp01(raw * 1.6 - 0.6 * u.t));
        const loose = 1 - e;
        const size = Math.max(44, u.h);
        u.el.style.transform = `translate3d(${(u.dx * size * loose + u.px).toFixed(1)}px, ${(
          u.dy * size * loose +
          u.o +
          u.py
        ).toFixed(1)}px, 0) rotate(${(u.rot * loose + u.o * u.sway + u.px * 0.012).toFixed(4)}rad)`;
        u.el.style.opacity = e < 1 ? e.toFixed(3) : "";

        // Light falls off with distance; the extrusion points straight away from the ship.
        const lit = g > 0 ? Math.pow(clamp01(1 - Math.max(0, dist - sw * 0.5) / reach), 1.7) : 0;
        const step = u.h * 0.017 * (0.35 + 0.65 * lit);
        u.el.style.setProperty("--lit", lit.toFixed(3));
        u.el.style.setProperty("--ex", `${((lx / dist) * step).toFixed(2)}px`);
        u.el.style.setProperty("--ey", `${((ly / dist) * step).toFixed(2)}px`);
      }
      fresh = false;
    }

    measure();
    let timer = 0;
    const remeasure = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    window.addEventListener("resize", remeasure);
    document.fonts.ready.then(remeasure);
    const off = onScrollFrame(tick);

    return () => {
      off();
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", remeasure);
      ship.style.visibility = "";
      ship.style.zIndex = "";
      scene.destroy();
      parts.ctx?.clearRect(0, 0, vw, vh);
      for (const t of parts.titles) t.style.transform = t.style.opacity = "";
      for (const s of sats) s.el.style.transform = s.el.style.opacity = s.el.style.zIndex = "";
      read.style.visibility = "";
      ctx?.clearRect(0, 0, vw, vh);
      contact.style.removeProperty("--dawn");
      for (const u of units) {
        u.el.style.transform = "";
        u.el.style.opacity = "";
        u.el.style.removeProperty("--lit");
        u.el.style.removeProperty("--ex");
        u.el.style.removeProperty("--ey");
      }
    };
  }, []);

  return (
    <>
      <div ref={dayRef} className="daylight" aria-hidden="true" />
      <canvas ref={wakeRef} className="wake" aria-hidden="true" />
      <div ref={shipRef} className="ship" aria-hidden="true">
        {/* Drawn nose up. The box is the hull; the flame hangs out below it. */}
        <svg viewBox="0 0 100 120">
          <defs>
            <linearGradient id="ship-hull" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3a3470" />
              <stop offset="0.55" stopColor="#12122b" />
              <stop offset="1" stopColor="#03060d" />
            </linearGradient>
            <radialGradient id="ship-glass" cx="0.35" cy="0.3" r="0.9">
              <stop offset="0" stopColor="#d6fff7" />
              <stop offset="0.5" stopColor="#5eead4" />
              <stop offset="1" stopColor="#0d4a43" />
            </radialGradient>
            <linearGradient id="ship-flame" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff3d6" />
              <stop offset="0.3" stopColor="#ffc857" />
              <stop offset="0.75" stopColor="#ff7a6b" stopOpacity="0.7" />
              <stop offset="1" stopColor="#ff7a6b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="ship-flame" d="M41 108 Q50 104 59 108 Q57 150 50 190 Q43 150 41 108 Z" fill="url(#ship-flame)" />
          <g strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
            <path d="M33 66 L9 106 L34 97 Z" fill="#3a1512" stroke="#ff7a6b" vectorEffect="non-scaling-stroke" />
            <path d="M67 66 L91 106 L66 97 Z" fill="#3a1512" stroke="#ff7a6b" vectorEffect="non-scaling-stroke" />
            <path
              d="M50 5 C71 27 73 68 66 100 L34 100 C27 68 29 27 50 5 Z"
              fill="url(#ship-hull)"
              stroke="#9b8cff"
              vectorEffect="non-scaling-stroke"
            />
            <path d="M32.5 80 L67.5 80" stroke="#9b8cff" opacity="0.6" vectorEffect="non-scaling-stroke" />
            <circle cx="50" cy="44" r="10.5" fill="url(#ship-glass)" stroke="#d6fff7" vectorEffect="non-scaling-stroke" />
            <path d="M39 100 L61 100 L58 109 L42 109 Z" fill="#11132b" stroke="#f2f0ff" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      </div>
      <p ref={readRef} className="telemetry" aria-hidden="true" />
    </>
  );
}
