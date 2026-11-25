import { setSky } from "@/lib/sky";
import { stack, type Spot } from "./layout";
import { clamp01, easeIn, easeOut, lerp, mix, seeded, smooth, span } from "./math";
import type { Sat, SceneFactory } from "./types";

/**
 * The beats, as progress through the pinned stretch:
 *   0     to ENTRY  re-entry: the hull glows, flames lick in from the screen edges, the stars go out
 *   ENTRY to DECKS  three cloud decks, one per discipline; each parts to show its tools, then is left above
 *   DECKS to 1      final approach: clear air, the ship turns tail down and burns for the ground
 */
const ENTRY = 0.18;
const DECKS = 0.86;

/**
 * One long fall from orbit to dawn. The sky is the scene: it goes from black
 * to a deep twilight with a warm horizon, and stays that way for the landing
 * in Contact. It never gets light enough to need dark text.
 */
export const planetfall: SceneFactory = ({ ctx, sets, titles, sats, colors, daylight }) => {
  const rnd = seeded(905);
  const between = (a: number, b: number) => a + rnd() * (b - a);
  let vw = 0;
  let vh = 0;
  let wide = true;

  // Embers that streak up past you during re-entry.
  const embers = Array.from({ length: 80 }, () => ({
    x: rnd(),
    y: rnd(),
    fast: between(2.5, 7),
    len: between(30, 120),
    w: between(0.8, 2.4),
    color: rnd() > 0.5 ? "#ffc857" : "#ff7a6b",
  }));
  // Each deck is a bank of soft puffs, half of which slide left and half right when it parts.
  const decks = sets.map(() =>
    Array.from({ length: 18 }, (_, i) => ({
      side: i % 2 ? 1 : -1,
      x: between(0, 1),
      y: between(-1, 1),
      r: between(0.14, 0.3),
      shade: between(0.55, 1),
    })),
  );
  const rest = new Map<Sat, Spot>();
  let titleAt: Spot[] = [];
  let titleW: number[] = [];
  let titleH: number[] = [];

  /** Where deck `k` is in its own pass, 0 to 1. */
  const pass = (p: number, k: number) => (p - ENTRY) / ((DECKS - ENTRY) / sets.length) - k;

  return {
    tailFirst: true,

    measure(m) {
      ({ vw, vh, wide } = m);
      titleW = titles.map((t) => t.offsetWidth);
      titleH = titles.map((t) => t.offsetHeight);
      titleAt = [];
      sets.forEach((_, k) => {
        const mine = sats.filter((s) => s.set === k);
        const laid = stack(titles[k], mine, vw / 2, vh * (wide ? 0.3 : 0.24), Math.min(vw - 32, 720));
        titleAt[k] = laid.titleAt;
        for (const s of mine) rest.set(s, laid.at.get(s)!);
      });
    },

    pose(p) {
      // Dead centre for re-entry, then down below the tools, between the walls of cloud.
      const aside = smooth(span(p, ENTRY - 0.02, ENTRY + 0.08));
      const down = smooth(span(p, DECKS, 1));
      const sideX = vw * 0.5;
      const sideY = wide ? vh * 0.76 : vh * 0.86;
      const x = lerp(lerp(vw * 0.5, sideX, aside), wide ? vw * 0.8 : vw * 0.5, down) + Math.sin(p * 46) * vw * 0.008;
      const y = lerp(lerp(vh * 0.45, sideY, aside), wide ? vh * 0.4 : vh * 0.66, down);
      return {
        x,
        y,
        w: lerp(lerp(60, 92, smooth(p / ENTRY)), wide ? 124 : 104, p),
        // Nose down all the way, swinging tail down for the burn.
        angle: Math.PI * (1 - down),
        heat: smooth(p / 0.04) * (1 - smooth(span(p, ENTRY - 0.04, ENTRY + 0.05))),
        thrust: Math.max(0.25, down),
      };
    },

    update({ p, arrive, visible }) {
      // The sky applies to the whole page from here down, so it is set even when the stage is off screen.
      const day =
        0.1 * arrive + 0.25 * smooth(p / ENTRY) + 0.45 * span(p, ENTRY, DECKS) + 0.2 * smooth(span(p, DECKS, 1));
      daylight.style.opacity = (day * 0.92).toFixed(3);
      setSky({ fade: 1 - smooth(p / 0.3), push: 0 });

      if (!visible) return;

      // ---- Tools and titles: each discipline shows while its deck is parted ----
      sets.forEach((_, k) => {
        const t = pass(p, k);
        const last = k === sets.length - 1;
        const inn = smooth(span(t, 0.3, 0.46));
        const out = smooth(span(t, 0.84, 1));
        // The last set is not left above; it clears with the cloud as the ship turns to land.
        const show = inn * (1 - (last ? smooth(span(p, DECKS, DECKS + 0.06)) : out));
        const lift = (1 - inn) * 46 - (last ? 0 : out) * vh * 0.4;
        titles[k].style.opacity = show.toFixed(3);
        titles[k].style.transform = `translate3d(${(titleAt[k].x - titleW[k] / 2).toFixed(1)}px, ${(
          titleAt[k].y -
          titleH[k] / 2 +
          lift
        ).toFixed(1)}px, 0)`;
        for (const s of sats) {
          if (s.set !== k) continue;
          const at = rest.get(s)!;
          const late = smooth(span(t, 0.34 + s.i * 0.02, 0.5 + s.i * 0.02));
          s.el.style.opacity = Math.min(show, late).toFixed(3);
          s.el.style.transform = `translate3d(${(at.x - s.w / 2).toFixed(1)}px, ${(at.y - s.h / 2 + lift + (1 - late) * 30).toFixed(
            1,
          )}px, 0)`;
          s.el.style.zIndex = "5";
        }
      });

      if (!ctx) return;
      ctx.clearRect(0, 0, vw, vh);

      // ---- Cloud decks ----
      const reach = Math.max(vw, vh * 0.7);
      decks.forEach((puffs, k) => {
        const t = pass(p, k);
        if (t < -0.1 || t > 1.15) return;
        // Up from below, hold while parted, then away over your head.
        const bandY = t < 0.28 ? lerp(vh * 1.6, vh * 0.5, easeOut(t / 0.28)) : lerp(vh * 0.5, -vh * 0.9, easeIn(span(t, 0.8, 1.1)));
        const part = smooth(span(t, 0.26, 0.46));
        // Inside the cloud for a moment before it opens.
        const fog = clamp01(1 - Math.abs(t - 0.27) / 0.12);
        if (fog > 0) {
          ctx.globalAlpha = smooth(fog) * 0.5;
          ctx.fillStyle = mix(colors[k], 0.3, "#cfc8ee");
          ctx.fillRect(0, 0, vw, vh);
        }
        for (const puff of puffs) {
          const r = puff.r * reach;
          // Parted, the deck stays as a wall of cloud down each side of the screen.
          const x = vw * (0.5 + puff.side * (0.04 + puff.x * 0.44)) + puff.side * part * (vw * 0.24 + r * 0.35);
          const y = bandY + puff.y * vh * 0.36;
          if (y < -r || y > vh + r) continue;
          const g = ctx.createRadialGradient(x, y - r * 0.2, 0, x, y, r);
          g.addColorStop(0, mix(colors[k], 0.22, "#f2f0ff"));
          g.addColorStop(0.55, mix(colors[k], 0.4, "#6f6aa8"));
          g.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.72 * puff.shade;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ---- Re-entry: fire at the edges of the screen, embers streaming up ----
      const heat = smooth(Math.max(arrive * 2 - 1.4, p / 0.04)) * (1 - smooth(span(p, ENTRY - 0.03, ENTRY + 0.06)));
      if (heat > 0.01) {
        const edge = (x0: number, y0: number, x1: number, y1: number, color: string, alpha: number) => {
          const g = ctx.createLinearGradient(x0, y0, x1, y1);
          g.addColorStop(0, color);
          g.addColorStop(1, "transparent");
          ctx.globalAlpha = heat * alpha;
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, vw, vh);
        };
        const flick = 0.85 + 0.15 * Math.sin(p * 900);
        edge(0, 0, vw * 0.24, 0, "#ff7a6b", 0.6 * flick);
        edge(vw, 0, vw * 0.76, 0, "#ff7a6b", 0.6 * flick);
        edge(0, vh, 0, vh * 0.62, "#ffc857", 0.7 * flick);
        for (const e of embers) {
          const y = vh - ((((e.y + p * e.fast) % 1) + 1) % 1) * (vh + e.len);
          ctx.globalAlpha = heat * 0.85;
          ctx.strokeStyle = e.color;
          ctx.lineWidth = e.w;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(e.x * vw, y);
          ctx.lineTo(e.x * vw, y + e.len * heat);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    },

    destroy() {
      daylight.style.opacity = "";
      setSky({ fade: 1 });
    },
  };
};
