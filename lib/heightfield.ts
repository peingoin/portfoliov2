import type { Peak } from "./types";

/**
 * The one terrain function. Both the 3D scene and the 2D SVG map sample it,
 * so they always show the same landscape.
 *
 * Units: x runs west to east across WORLD_W, z runs north to south across
 * WORLD_D, and the returned height is in weeks. A summit sits at exactly its
 * project's week count, so one contour ring is one week of work.
 */
export const WORLD_W = 16;
export const WORLD_D = 10;
export const SEED = 7;

function hash(ix: number, iy: number, seed: number): number {
  let h =
    Math.imul(ix, 374761393) ^
    Math.imul(iy, 668265263) ^
    Math.imul(seed, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function valueNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, seed);
  const b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed);
  const d = hash(ix + 1, iy + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Fractal noise in the range 0..1, centred near 0.5. */
export function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq, seed + i * 17);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

export function peakSigma(weeks: number): number {
  return 0.55 + 0.06 * weeks;
}

const WARP = 0.9;
function warpX(x: number, z: number) {
  return WARP * (fbm(x * 0.3 + 31.4, z * 0.3 + 7.1, SEED + 1) - 0.5);
}
function warpZ(x: number, z: number) {
  return WARP * (fbm(x * 0.3 - 12.7, z * 0.3 + 19.3, SEED + 2) - 0.5);
}

export type Heightfield = (x: number, z: number) => number;

export function createHeightfield(peaks: Peak[]): Heightfield {
  // Warp offsets at each summit, so the warped field still peaks exactly
  // at the project's map position.
  const prepared = peaks.map((p) => ({
    ...p,
    sigma2: 2 * peakSigma(p.weeks) ** 2,
    wx0: warpX(p.x, p.z),
    wz0: warpZ(p.x, p.z),
  }));

  return (x, z) => {
    const wx = warpX(x, z);
    const wz = warpZ(x, z);
    const base = 0.3 + 2.4 * fbm(x * 0.21 + 3.3, z * 0.21 + 8.8, SEED);

    let p4 = 0;
    let g4 = 0;
    for (const p of prepared) {
      const dx = x + wx - p.wx0 - p.x;
      const dz = z + wz - p.wz0 - p.z;
      const g = Math.exp(-(dx * dx + dz * dz) / p.sigma2);
      p4 += (p.weeks * g) ** 4;
      g4 += g ** 4;
    }
    const peak = p4 ** 0.25;
    const cover = Math.min(1, g4 ** 0.25);
    const detail =
      0.9 * (fbm(x * 0.8 + 5.1, z * 0.8 + 2.2, SEED + 3) - 0.5) * (1 - cover * cover);

    return base * (1 - cover) + peak + detail;
  };
}

/** World position to a 0..1 map position (u across, v down). */
export function worldToUV(x: number, z: number): [number, number] {
  return [(x + WORLD_W / 2) / WORLD_W, (z + WORLD_D / 2) / WORLD_D];
}

export function uvToWorld(u: number, v: number): [number, number] {
  return [u * WORLD_W - WORLD_W / 2, v * WORLD_D - WORLD_D / 2];
}

/** Map-grid reference shown in the coordinate readout. */
export function gridRef(x: number, z: number): { e: string; n: string } {
  const [u, v] = worldToUV(x, z);
  const e = Math.round(u * 1600);
  const n = Math.round((1 - v) * 1000);
  return {
    e: String(Math.max(0, e)).padStart(4, "0"),
    n: String(Math.max(0, n)).padStart(4, "0"),
  };
}
