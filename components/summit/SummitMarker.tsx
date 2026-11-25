import Link from "next/link";
import { worldToUV } from "@/lib/heightfield";
import type { Peak, Project } from "@/lib/types";

/** A summit on the 2D map: a real link, positioned over its peak. */
export function SummitMarker({ project, peak, index }: { project: Project; peak: Peak; index: number }) {
  const [u, v] = worldToUV(peak.x, peak.z);
  return (
    <Link
      href={`/projects/${project.slug}/`}
      className="summit"
      style={{ left: `${u * 100}%`, top: `${v * 100}%` }}
    >
      <svg className="summit-mark" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 1.5l6 11H1z" />
      </svg>
      <span className="summit-num" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="summit-label">
        <span className="summit-name">{project.title}</span>
        <span className="label">
          {project.weeks} wk · {project.year}
        </span>
      </span>
      <span className="summit-card panel">
        <span className="block text-[14px] leading-snug text-ink">{project.summary}</span>
        <span className="label mt-2 block text-signal">Open summit →</span>
      </span>
    </Link>
  );
}
