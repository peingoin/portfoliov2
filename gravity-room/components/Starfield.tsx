"use client";

import { useEffect, useRef } from "react";
import { onScrollFrame } from "@/lib/scroll";
import { skyFx } from "@/lib/sky";

const TINTS = ["#f2f0ff", "#f2f0ff", "#f2f0ff", "#9b8cff", "#5eead4", "#ffc857"];

interface Star {
  x: number;
  y: number;
  r: number;
  /** Depth: how far it slides, and streaks, per pixel scrolled. */
  z: number;
  big: boolean;
  alpha: number;
  tint: string;
  layer: number;
}

// Small seeded generator so the sky is the same on every visit.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/**
 * The night sky behind every page. Stars sit on three canvases; two of them
 * fade in and out with CSS, so twinkling costs no script time. The canvases
 * are only repainted while the page is scrolling: stars slide past by depth,
 * and stretch into streaks with scroll speed.
 */
export function Starfield() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const layers = Array.from(host.querySelectorAll("canvas"));
    const ctxs = layers.map((c) => c.getContext("2d")!);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    let timer = 0;
    let lastY = -1;
    let streaked = false;

    function draw(scroll: number, speed: number) {
      for (const ctx of ctxs) ctx.clearRect(0, 0, w, h);
      // A scene can dim the stars or blow them about (see lib/sky.ts).
      const { fade, push } = skyFx;
      if (fade <= 0.003) return;
      for (const s of stars) {
        const ctx = ctxs[s.layer];
        let x = s.x;
        let y = (((s.y - scroll * s.z) % h) + h) % h;
        if (push) {
          const dx = x - skyFx.x;
          const dy = y - skyFx.y;
          const d = Math.hypot(dx, dy) || 1;
          const by = push * (0.35 + s.z * 5);
          x += (dx / d) * by;
          y += (dy / d) * by;
        }
        const tail = Math.max(-70, Math.min(70, speed * s.z * 9));
        ctx.globalAlpha = s.alpha * fade;
        if (Math.abs(tail) > 0.6) {
          // A star in motion drags a tail behind it.
          ctx.strokeStyle = s.tint;
          ctx.lineWidth = s.r * 2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + tail);
          ctx.stroke();
          continue;
        }
        ctx.fillStyle = s.tint;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.big) {
          // A soft cross flare on the brightest stars.
          ctx.globalAlpha = 0.35 * fade;
          ctx.fillRect(x - s.r * 4, y - 0.4, s.r * 8, 0.8);
          ctx.fillRect(x - 0.4, y - s.r * 4, 0.8, s.r * 8);
        }
      }
    }

    function build() {
      const nw = host!.clientWidth;
      const nh = host!.clientHeight;
      // Mobile address bars change the height constantly; only rebuild for real changes.
      if (nw === w && nh <= h) return;
      w = nw;
      h = nh;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rnd = seeded(2026);
      const count = Math.round((w * h) / 4200);
      layers.forEach((c, i) => {
        c.width = w * dpr;
        c.height = h * dpr;
        ctxs[i].setTransform(dpr, 0, 0, dpr, 0, 0);
      });
      stars = [];
      for (let i = 0; i < count; i++) {
        const big = rnd() > 0.94;
        const r = big ? 1.3 + rnd() * 0.9 : 0.4 + rnd() * 0.8;
        stars.push({
          x: rnd() * w,
          y: rnd() * h,
          r,
          z: reduced ? 0 : big ? 0.14 + rnd() * 0.1 : 0.02 + r * 0.06,
          big,
          tint: TINTS[Math.floor(rnd() * TINTS.length)],
          alpha: big ? 0.95 : 0.35 + rnd() * 0.55,
          layer: i % layers.length,
        });
      }
      lastY = reduced ? 0 : window.scrollY;
      draw(lastY, 0);
    }

    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 150);
    };
    build();
    window.addEventListener("resize", onResize);
    const off = reduced
      ? undefined
      : onScrollFrame(({ y, v }) => {
          if (y === lastY && v === 0 && !streaked && !skyFx.dirty) return;
          skyFx.dirty = false;
          lastY = y;
          streaked = v !== 0;
          draw(y, v);
        });
    return () => {
      off?.();
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={ref} className="sky" aria-hidden="true">
      <canvas />
      <canvas className="twinkle" />
      <canvas className="twinkle slow" />
      <span className="shooting" />
    </div>
  );
}
