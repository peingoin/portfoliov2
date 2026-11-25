import { setSky } from "@/lib/sky";
import { stack, type Spot } from "./layout";
import { clamp01, easeIn, easeOut, lerp, seeded, smooth, span, spline } from "./math";
import type { Sat, SceneFactory } from "./types";

/**
 * The beats, as progress through the pinned stretch:
 *   0    to SWELL  a star grows in the middle; the ship circles it once
 *   SWELL to BANG  it swells past the edges of the screen
 *   BANG to THROWN it detonates: a ring travels out and throws the tools with it
 *   THROWN to REST the debris turns and falls into place as three lists
 */
const SWELL = 0.25;
const BANG = 0.35;
const THROWN = 0.62;
const REST = 0.92;

const HOT = ["#fff3d6", "#ffc857", "#ffc857", "#ff7a6b", "#9b8cff"];

/**
 * A star you scroll into until it blows. The tools are the debris: they are
 * flung out with the shock ring and then settle as the lists. Every position
 * is a function of progress alone, so scrolling up un-explodes it.
 */
export const supernova: SceneFactory = ({ ctx, sets, titles, sats, colors }) => {
  const rnd = seeded(404);
  const between = (a: number, b: number) => a + rnd() * (b - a);
  let vw = 0;
  let vh = 0;
  let cx = 0;
  let cy = 0;
  let unit = 0;
  let diag = 0;
  let wide = true;

  // Sparks: thrown with the ring, never come back.
  const sparks = Array.from({ length: 170 }, () => ({
    a: between(0, Math.PI * 2),
    d: between(0.2, 1.1),
    r: between(0.6, 2.6),
    late: between(0, 0.05),
    color: HOT[Math.floor(rnd() * HOT.length)],
  }));
  // Each tool's own flight: when the ring reaches it, where it is thrown, how it tumbles, when it lands.
  const throws = new Map<Sat, { at: number; a: number; d: number; spin: number; land: number; far: Spot; rest: Spot }>();
  for (const s of sats) {
    throws.set(s, {
      at: BANG + between(0.01, 0.06),
      a: between(0, Math.PI * 2),
      d: between(0.55, 0.95),
      spin: between(-9, 9),
      land: between(REST - 0.14, REST),
      far: { x: 0, y: 0 },
      rest: { x: 0, y: 0 },
    });
  }
  let titleAt: Spot[] = [];
  let titleW: number[] = [];
  let titleH: number[] = [];

  let shipX: number[] = [];
  let shipY: number[] = [];
  const SHIP_KEYS = [SWELL - 0.01, 0.36, 0.5, 0.75, 1];

  return {
    measure(m) {
      ({ vw, vh, wide } = m);
      cx = vw / 2;
      cy = vh / 2;
      unit = Math.min(vw, vh);
      diag = Math.hypot(vw, vh);

      // At rest: three columns on a wide screen, three rows on a narrow one.
      titleAt = [];
      titleW = titles.map((t) => t.offsetWidth);
      titleH = titles.map((t) => t.offsetHeight);
      sets.forEach((_, k) => {
        const mine = sats.filter((s) => s.set === k);
        const laid = wide
          ? stack(titles[k], mine, vw * (0.2 + 0.3 * k), vh * 0.38, vw * 0.25)
          : stack(titles[k], mine, vw / 2, vh * (0.2 + 0.25 * k), vw - 32);
        titleAt[k] = laid.titleAt;
        for (const s of mine) {
          const t = throws.get(s)!;
          t.rest = laid.at.get(s)!;
          // Thrown toward the edges, but kept on screen so it can be watched coming back.
          t.far = {
            x: cx + Math.cos(t.a) * t.d * (vw / 2 - s.w / 2 - 12),
            y: cy + Math.sin(t.a) * t.d * (vh / 2 - s.h / 2 - 12),
          };
        }
      });

      // The ship: one lap of the star, back off to a corner, get knocked spinning, recover.
      const r = unit * 0.3;
      shipX = [cx - r, vw * (wide ? 0.86 : 0.82), vw * 0.95, vw * 0.9, vw * (wide ? 0.9 : 0.86)];
      shipY = [cy, vh * (wide ? 0.2 : 0.14), vh * 0.07, vh * 0.16, vh * (wide ? 0.26 : 0.14)];
    },

    pose(p) {
      const w = lerp(50, 70, p);
      if (p < SHIP_KEYS[0]) {
        const theta = Math.PI + (p / SHIP_KEYS[0]) * Math.PI * 2;
        const r = unit * 0.3;
        return { x: cx + r * Math.cos(theta), y: cy + r * 0.7 * Math.sin(theta), w, near: Math.sin(theta) > 0 };
      }
      return {
        x: spline(SHIP_KEYS, shipX, p),
        y: spline(SHIP_KEYS, shipY, p),
        w,
        // Two full turns as the shock goes past.
        spin: smooth(span(p, BANG + 0.06, THROWN + 0.04)) * Math.PI * 4,
      };
    },

    update({ p, visible }) {
      if (!visible) {
        setSky({ push: 0 });
        return;
      }
      // Stars lean in, get blown out, and drift back as things settle.
      const blast = easeOut(span(p, BANG, THROWN));
      setSky({
        x: cx,
        y: cy,
        push: -50 * smooth(p / BANG) * (1 - blast) + 700 * blast * (1 - smooth(span(p, THROWN, REST + 0.04))),
      });

      // ---- Tools and titles ----
      for (const s of sats) {
        const t = throws.get(s)!;
        const out = easeOut(span(p, t.at, THROWN));
        const home = smooth(span(p, THROWN, t.land));
        const x = lerp(lerp(cx, t.far.x, out), t.rest.x, home);
        const y = lerp(lerp(cy, t.far.y, out), t.rest.y, home);
        const rot = t.spin * out * (1 - home);
        s.el.style.transform = `translate3d(${(x - s.w / 2).toFixed(1)}px, ${(y - s.h / 2).toFixed(1)}px, 0) rotate(${rot.toFixed(
          3,
        )}rad) scale(${(0.35 + 0.65 * out).toFixed(3)})`;
        s.el.style.opacity = clamp01(out * 4).toFixed(3);
        s.el.style.zIndex = "5";
      }
      titles.forEach((el, k) => {
        const on = smooth(span(p, THROWN + 0.1, REST - 0.04));
        el.style.opacity = on.toFixed(3);
        el.style.transform = `translate3d(${(titleAt[k].x - titleW[k] / 2).toFixed(1)}px, ${(
          titleAt[k].y -
          titleH[k] / 2 +
          (1 - on) * 26
        ).toFixed(1)}px, 0) scale(${(0.86 + 0.14 * on).toFixed(3)})`;
      });

      // ---- Star, ring, sparks ----
      if (!ctx) return;
      ctx.clearRect(0, 0, vw, vh);

      // What is left behind: a soft cloud in the colours of the three disciplines.
      const after = smooth(span(p, THROWN, REST));
      if (after > 0) {
        colors.forEach((c, k) => {
          const ox = cx + Math.cos(k * 2.1 + 0.4) * unit * 0.12;
          const oy = cy + Math.sin(k * 2.1 + 0.4) * unit * 0.1;
          const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, unit * 0.42);
          g.addColorStop(0, c);
          g.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.16 * after;
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, vw, vh);
        });
      }

      // The star.
      const grow = smooth(p / SWELL);
      const swell = easeIn(span(p, SWELL, BANG));
      const gone = smooth(span(p, BANG, BANG + 0.07));
      const r = lerp(lerp(5, unit * 0.1, grow), diag * 0.7, swell) * (1 - gone);
      if (r > 0.5) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.4);
        g.addColorStop(0, "#fffdf5");
        g.addColorStop(0.3, "#fff3d6");
        g.addColorStop(0.42, "#ffc857");
        g.addColorStop(0.6, "rgb(255 122 107 / 0.45)");
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // The peak: the screen fills with light, held over a stretch of scroll rather than flashed.
      const white = clamp01(1 - Math.abs(p - BANG) / 0.045);
      if (white > 0) {
        ctx.globalAlpha = smooth(white) * 0.8;
        ctx.fillStyle = "#fff3d6";
        ctx.fillRect(0, 0, vw, vh);
      }

      // The shock ring, cooling from white through Solar to Comet as it spreads.
      const ring = span(p, BANG, THROWN + 0.06);
      if (ring > 0 && ring < 1) {
        const rr = easeOut(ring) * diag * 0.62;
        ctx.globalAlpha = 1 - smooth(ring);
        ctx.strokeStyle = ring < 0.3 ? "#fff3d6" : ring < 0.6 ? "#ffc857" : "#ff7a6b";
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 36;
        ctx.lineWidth = lerp(26, 2, ring);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Sparks.
      for (const s of sparks) {
        const t = span(p, BANG + s.late, REST);
        if (t <= 0 || t >= 1) continue;
        const d = easeOut(t) * s.d * diag * 0.6;
        const x = cx + Math.cos(s.a) * d;
        const y = cy + Math.sin(s.a) * d;
        const tail = (1 - t) * (1 - t) * 46;
        ctx.globalAlpha = (1 - t) * 0.9;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.r;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - Math.cos(s.a) * tail, y - Math.sin(s.a) * tail);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },

    destroy() {
      setSky({ push: 0 });
    },
  };
};
