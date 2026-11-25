import { clamp01, smooth } from "./math";
import type { SceneFactory } from "./types";

/** The ship joins its orbit on the far left and leaves over the top, two and a quarter laps later. */
const ORBIT_IN = Math.PI;
const ORBIT_SWEEP = Math.PI * 4.5;

/**
 * A planet with every tool in orbit on one of three rings. Scrolling spins
 * the system; each discipline in turn swings its tools round to the near side
 * while the planet takes its colour. The ship flies laps round it.
 */
export const orbit: SceneFactory = ({ section, sets, titles, sats, colors }) => {
  const planet = section.querySelector<HTMLElement>(".planet")!;
  const backs = Array.from(section.querySelectorAll<SVGEllipseElement>("[data-ring-back]"));
  const fronts = Array.from(section.querySelectorAll<SVGPathElement>("[data-ring-front]"));
  const tilts = sets.map((_, k) => [-0.18, 0.12, -0.05][k % 3]);
  let ringR: number[] = [];
  let gaps: number[] = [];
  let squash = 0.3;
  let sweep = 0.5;
  let cx = 0;
  let cy = 0;
  let sRx = 0;
  let sRy = 0;

  // A point on the ship's orbit: a tilted ellipse round the planet.
  function orb(theta: number) {
    const ex = sRx * Math.cos(theta);
    const ey = sRy * Math.sin(theta);
    return { x: cx + ex * Math.cos(-0.16) - ey * Math.sin(-0.16), y: cy + ex * Math.sin(-0.16) + ey * Math.cos(-0.16) };
  }

  return {
    measure({ vw, vh, wide }) {
      const pr = Math.min(vw, vh) * 0.19;
      cx = vw / 2;
      cy = vh * 0.56;
      squash = wide ? 0.3 : 0.92;
      sweep = wide ? 0.5 : 0.1;
      planet.style.width = planet.style.height = `${(pr * 2).toFixed(0)}px`;
      ringR = sets.map((_, k) => pr * (1.75 + 0.55 * k));
      gaps = sets.map((_, k) => {
        const mine = sats.filter((s) => s.set === k);
        const widest = Math.max(...mine.map((s) => s.w));
        // Fan the tools out as far as they need, but never past the edge of the screen.
        const edge = Math.asin(clamp01((vw / 2 - widest / 2 - 14) / ringR[k]));
        const want = wide ? Math.min(0.7, (widest + 18) / ringR[k]) : 0.8;
        return Math.min(want, edge / Math.max(0.5, (mine.length - 1) / 2) - (wide ? 0 : 0.04));
      });
      section.querySelectorAll("svg.orbit-rings").forEach((svg) => svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`));
      sets.forEach((_, k) => {
        const rx = ringR[k];
        const ry = rx * squash;
        const deg = (tilts[k] * 180) / Math.PI;
        const b = backs[k];
        b?.setAttribute("cx", String(cx));
        b?.setAttribute("cy", String(cy));
        b?.setAttribute("rx", String(rx));
        b?.setAttribute("ry", String(ry));
        b?.setAttribute("transform", `rotate(${deg} ${cx} ${cy})`);
        // The near half of the same ring, drawn again over the planet.
        fronts[k]?.setAttribute("d", `M ${cx + rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy}`);
        fronts[k]?.setAttribute("transform", `rotate(${deg} ${cx} ${cy})`);
      });
      sRx = Math.min(pr * 3.4, vw * 0.46);
      // On a phone the orbit is tall, so the near pass clears the fan of tools.
      sRy = wide ? sRx * 0.36 : vh * 0.36;
    },

    pose(p) {
      const theta = ORBIT_IN + p * ORBIT_SWEEP;
      const depth = Math.sin(theta);
      return { ...orb(theta), w: (50 + 40 * p) * (1 + 0.28 * depth), near: depth > 0 };
    },

    update({ p, arrive, visible }) {
      if (!visible) return;
      const f = p * sets.length;
      // The planet takes the colour of whichever discipline is in front.
      const j = Math.max(1, Math.min(sets.length - 1, Math.round(f)));
      const mix = smooth((f - j + 0.25) / 0.5);
      planet.style.setProperty("--c", `color-mix(in oklab, ${colors[j]} ${(mix * 100).toFixed(1)}%, ${colors[j - 1]})`);
      planet.style.setProperty("--spin", `${(-p * 900).toFixed(1)}px`);
      planet.style.transform = `translate(-50%, -50%) scale(${(0.35 + 0.65 * arrive).toFixed(3)})`;

      const on: number[] = [];
      const off: number[] = [];
      sets.forEach((_, k) => {
        let d = f - (k + 0.5);
        if ((k === 0 && d < 0) || (k === sets.length - 1 && d > 0)) d = 0;
        off[k] = d;
        on[k] = smooth(2.2 - Math.abs(d) * 4);
        // Titles turn past like a drum.
        titles[k].style.opacity = on[k].toFixed(3);
        titles[k].style.transform = `translate3d(0, ${(-d * 90).toFixed(1)}px, 0) rotateX(${(d * 75).toFixed(1)}deg)`;
        const ring = (0.14 + 0.5 * on[k]).toFixed(3);
        if (backs[k]) backs[k].style.opacity = ring;
        if (fronts[k]) fronts[k].style.opacity = ring;
      });
      for (const s of sats) {
        const k = s.set;
        const a = on[k];
        // Idle tools circle evenly; the active set swings round to the near side and fans out.
        const even = (s.i / s.n) * Math.PI * 2 + p * Math.PI * 2 * (0.7 + 0.25 * k) + k * 1.3;
        const fan = Math.PI / 2 + (s.i - (s.n - 1) / 2) * gaps[k] - off[k] * sweep;
        const theta = even + (fan - even) * a;
        const depth = Math.sin(theta);
        const ex = ringR[k] * Math.cos(theta);
        const ey = ringR[k] * squash * depth;
        const x = cx + ex * Math.cos(tilts[k]) - ey * Math.sin(tilts[k]);
        const y = cy + ex * Math.sin(tilts[k]) + ey * Math.cos(tilts[k]);
        s.el.style.transform = `translate3d(${(x - s.w / 2).toFixed(1)}px, ${(y - s.h / 2).toFixed(1)}px, 0) scale(${(
          (0.8 + 0.2 * depth) *
          (0.85 + 0.15 * a)
        ).toFixed(3)})`;
        s.el.style.opacity = ((0.3 + 0.7 * a) * (0.75 + 0.25 * depth)).toFixed(3);
        s.el.style.zIndex = depth > 0 ? "5" : "2";
      }
    },

    destroy() {
      planet.style.transform = "";
    },
  };
};
