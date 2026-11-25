/**
 * Scroll kinematics. One requestAnimationFrame loop measures the page's scroll
 * position, velocity and change in velocity, and hands them to every
 * subscriber. Everything that reacts to scrolling reads from here, so the
 * stars, the room and the type all feel the same push.
 */
export interface Kin {
  /** Scroll position in px. */
  y: number;
  /** Smoothed velocity in px per 60fps frame. Positive is scrolling down. */
  v: number;
  /** Change in velocity since the last frame. */
  dv: number;
}

type Fn = (k: Kin) => void;

const subs = new Set<Fn>();
let raf = 0;
let lastY = 0;
let lastT = 0;
let v = 0;

function frame(now: number) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(50, Math.max(1, now - lastT));
  lastT = now;
  const y = window.scrollY;
  const raw = (y - lastY) / (dt / (1000 / 60));
  lastY = y;
  const before = v;
  v += (raw - v) * 0.3;
  if (Math.abs(v) < 0.01) v = 0;
  const k = { y, v, dv: v - before };
  subs.forEach((fn) => fn(k));
}

export function onScrollFrame(fn: Fn) {
  subs.add(fn);
  if (subs.size === 1) {
    lastY = window.scrollY;
    lastT = performance.now();
    v = 0;
    raf = requestAnimationFrame(frame);
  }
  return () => {
    subs.delete(fn);
    if (!subs.size) cancelAnimationFrame(raf);
  };
}
