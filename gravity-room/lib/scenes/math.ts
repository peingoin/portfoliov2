export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
export const smooth = (n: number) => {
  const t = clamp01(n);
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (n: number) => 1 - Math.pow(1 - clamp01(n), 3);
export const easeIn = (n: number) => Math.pow(clamp01(n), 3);
/** Progress of `n` through the window from `a` to `b`, 0 to 1. */
export const span = (n: number, a: number, b: number) => clamp01((n - a) / (b - a));

/** Small seeded generator, so every visit sees the same scene. */
export function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** Catmull-Rom through `vals` at positions `keys`. */
export function spline(keys: number[], vals: number[], g: number) {
  let i = 0;
  while (i < keys.length - 2 && g > keys[i + 1]) i++;
  const t = clamp01((g - keys[i]) / (keys[i + 1] - keys[i]));
  const p0 = vals[Math.max(0, i - 1)];
  const p1 = vals[i];
  const p2 = vals[i + 1];
  const p3 = vals[Math.min(vals.length - 1, i + 2)];
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
  );
}

/** `amount` (0 to 1) of hex colour `a` mixed into hex colour `b`, as an rgb() string canvas can read. */
export function mix(a: string, amount: number, b: string) {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(ch(a, i) * amount + ch(b, i) * (1 - amount)));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}
