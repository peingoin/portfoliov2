import { contours } from "d3-contour";
import { geoPath } from "d3-geo";
import { createHeightfield, uvToWorld, worldToUV, WORLD_W } from "@/lib/heightfield";
import { RANGES, DISCIPLINES, smoothPath, trailPoints } from "@/lib/layout";
import type { Peak } from "@/lib/types";

const NX = 176;
const NY = 110;
const UNIT = NX / WORLD_W; // grid cells per world unit

/**
 * The whole terrain as an SVG contour map, generated at build time from the
 * shared heightfield. One ring is one week; every fifth ring is heavier.
 */
export function ContourMap({ peaks, drawIn = true }: { peaks: Peak[]; drawIn?: boolean }) {
  const sample = createHeightfield(peaks);
  // Sample one extra cell on every side. The viewBox crops it away, which
  // hides the straight edges d3-contour adds where rings leave the grid.
  const GX = NX + 2;
  const GY = NY + 2;
  const values: number[] = new Array(GX * GY);
  let max = 0;
  for (let j = 0; j < GY; j++) {
    for (let i = 0; i < GX; i++) {
      const [x, z] = uvToWorld((i - 0.5) / NX, (j - 0.5) / NY);
      const h = sample(x, z);
      values[j * GX + i] = h;
      if (h > max) max = h;
    }
  }
  const thresholds = Array.from({ length: Math.floor(max) }, (_, i) => i + 1);
  const rings = contours().size([GX, GY]).thresholds(thresholds)(values);
  const path = geoPath().digits(1);

  const toGrid = ([x, z]: [number, number]): [number, number] => {
    const [u, v] = worldToUV(x, z);
    return [u * NX + 1, v * NY + 1];
  };
  const trail = smoothPath(trailPoints(peaks).map(toGrid));

  const meridians = Array.from({ length: WORLD_W / 2 - 1 }, (_, i) => (i + 1) * 2 * UNIT + 1);
  const parallels = Array.from({ length: NY / (2 * UNIT) - 1 }, (_, i) => (i + 1) * 2 * UNIT + 1);

  return (
    <svg
      viewBox={`1 1 ${NX} ${NY}`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {DISCIPLINES.map((d) => (
          <radialGradient key={d} id={`wash-${d}`}>
            <stop offset="0" stopColor={RANGES[d].color} stopOpacity="0.2" />
            <stop offset="1" stopColor={RANGES[d].color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      <g className="graticule">
        {meridians.map((x) => (
          <line key={`m${x}`} x1={x} x2={x} y1={0} y2={GY} />
        ))}
        {parallels.map((y) => (
          <line key={`p${y}`} x1={0} x2={GX} y1={y} y2={y} />
        ))}
      </g>

      {DISCIPLINES.map((d) => {
        const [cx, cy] = toGrid(RANGES[d].center);
        return <circle key={d} cx={cx} cy={cy} r={3.6 * UNIT} fill={`url(#wash-${d})`} />;
      })}

      <g className={`contours ${drawIn ? "draw-in" : ""}`}>
        {rings.map((ring, i) => {
          const d = path(ring) ?? "";
          const isIndex = ring.value % 5 === 0;
          return (
            <g key={ring.value} className="line" style={{ "--i": i } as React.CSSProperties}>
              <path className="shade" d={d} />
              {isIndex && <path className="glow" d={d} />}
              <path className={isIndex ? "idx" : undefined} d={d} />
            </g>
          );
        })}
      </g>

      <path className={`trail-glow ${drawIn ? "draw-in" : ""}`} d={trail} />
      <path className={`trail-line ${drawIn ? "draw-in" : ""}`} d={trail} />
    </svg>
  );
}
