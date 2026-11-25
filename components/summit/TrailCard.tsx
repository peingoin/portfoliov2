import Link from "next/link";
import { ContourRings } from "@/components/map2d/ContourRings";
import { RANGES } from "@/lib/layout";
import type { Peak, Project } from "@/lib/types";

/** One stop on the trail, shown in the list under the map. */
export function TrailCard({ project, peaks, index }: { project: Project; peaks: Peak[]; index: number }) {
  const range = RANGES[project.discipline];
  return (
    <li>
      <Link
        href={`/projects/${project.slug}/`}
        className="group grid h-full grid-cols-[96px_1fr] gap-5 border border-line bg-sheet-raised/60 p-5 transition-colors duration-150 hover:border-signal md:grid-cols-[120px_1fr]"
      >
        <ContourRings peaks={peaks} slug={project.slug} className="aspect-square w-full" />
        <div className="min-w-0">
          <p className="label flex items-center gap-2">
            <span className="text-signal">{String(index + 1).padStart(2, "0")}</span>
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: range.color }}
              aria-hidden="true"
            />
            {range.name} · {project.year}
          </p>
          <h3 className="heading mt-2 text-[26px] transition-colors duration-150 group-hover:text-signal">
            {project.title}
          </h3>
          <p className="mt-2 text-[15px] leading-snug text-ink-muted">{project.summary}</p>
          <p className="data mt-3 text-ink">
            {project.weeks} weeks <span className="text-ink-muted">· {project.role}</span>
          </p>
        </div>
      </Link>
    </li>
  );
}
