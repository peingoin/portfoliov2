import { contours } from "d3-contour";
import { geoPath } from "d3-geo";
import { createHeightfield, peakSigma } from "@/lib/heightfield";
import type { Peak } from "@/lib/types";


/**
 * One summit's own contour rings, cut out of the shared terrain. Used as the
 * thumbnail in lists and as the header of its case study.
 */
export function ContourRings({
  peaks,
  slug,
  className,
  detail = "thumb",
}: {
  peaks: Peak[];
  slug: string;
  className?: string;
  /** "hero" samples a finer grid for large display. */
  detail?: "thumb" | "hero";
}) {
  const N = detail === "hero" ? 140 : 56;
  const k = N / 56;
  const peak = peaks.find((p) => p.slug === slug);
  if (!peak) return null;
  const sample = createHeightfield(peaks);
  const half = peakSigma(peak.weeks) * 2.1;
  const values: number[] = new Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = peak.x - half + ((i + 0.5) / N) * half * 2;
      const z = peak.z - half + ((j + 0.5) / N) * half * 2;
      values[j * N + i] = sample(x, z);
    }
  }
  const thresholds = Array.from({ length: Math.ceil(peak.weeks) - 1 }, (_, i) => i + 1);
  const rings = contours().size([N, N]).thresholds(thresholds)(values);
  const path = geoPath().digits(1);

  return (
    <svg viewBox={`0 0 ${N} ${N}`} className={className} aria-hidden="true" focusable="false">
      <clipPath id={`lens-${slug}`}>
        <circle cx={N / 2} cy={N / 2} r={N / 2 - 1.5 * k} />
      </clipPath>
      <g className="contours" clipPath={`url(#lens-${slug})`}>
        {rings.map((ring) => (
          <path
            key={ring.value}
            className={ring.value % 5 === 0 ? "idx" : undefined}
            d={path(ring) ?? ""}
          />
        ))}
      </g>
      {detail === "thumb" ? (
        <path d={`M${N / 2} ${N / 2 - 1.6}l1.7 3h-3.4z`} fill="var(--color-signal)" />
      ) : (
        <path d={`M${N / 2} ${N / 2 - 1.3}l1.4 2.5h-2.8z`} fill="var(--color-signal)" />
      )}
    </svg>
  );
}
