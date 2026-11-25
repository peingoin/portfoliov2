import { DISCIPLINES, RANGES } from "@/lib/layout";

/** Explains every symbol on the map in plain words. */
export function Legend() {
  return (
    <details className="panel group w-[264px]" open>
      <summary className="label flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-ink">
        Legend
        <span className="text-ink-muted group-open:hidden">Show</span>
        <span className="hidden text-ink-muted group-open:inline">Hide</span>
      </summary>
      <ul className="space-y-2.5 border-t border-line px-4 py-3 text-[13px] leading-snug">
        <li className="flex items-center gap-3">
          <svg width="28" height="14" aria-hidden="true">
            <path d="M14 2l6 10H8z" fill="var(--color-signal)" />
          </svg>
          Summit: one project
        </li>
        <li className="flex items-center gap-3">
          <svg width="28" height="14" aria-hidden="true">
            <ellipse cx="14" cy="7" rx="12" ry="5.5" fill="none" stroke="var(--color-contour)" />
            <ellipse cx="14" cy="7" rx="6" ry="2.5" fill="none" stroke="var(--color-contour)" />
          </svg>
          One ring: one week of work
        </li>
        <li className="flex items-center gap-3">
          <svg width="28" height="14" aria-hidden="true">
            <path d="M1 7h26" stroke="var(--color-contour-index)" strokeWidth="1.75" />
          </svg>
          Heavy ring: every 5 weeks
        </li>
        <li className="flex items-center gap-3">
          <svg width="28" height="14" aria-hidden="true">
            <path d="M1 7h26" stroke="var(--color-signal)" strokeWidth="1.75" strokeDasharray="5 4" />
          </svg>
          Trail: suggested order
        </li>
        <li className="flex items-center gap-4 border-t border-line pt-2.5">
          {DISCIPLINES.map((d) => (
            <span key={d} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: RANGES[d].color }}
                aria-hidden="true"
              />
              {RANGES[d].name}
            </span>
          ))}
        </li>
      </ul>
    </details>
  );
}
