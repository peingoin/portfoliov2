"use client";

import type { Project } from "@/content/projects";

const ACCENT: Record<string, string> = {
  "c-plasma": "var(--color-plasma)",
  "c-comet": "var(--color-comet)",
  "c-solar": "var(--color-solar)",
};

/** A project's full case study, opened in place from its card. */
export function CaseDialog({
  project,
  color,
  discipline,
  next,
  onClosed,
}: {
  project: Project;
  color: string;
  discipline: string;
  next: Project;
  onClosed: () => void;
}) {
  const titleId = `case-title-${project.slug}`;
  return (
    <dialog
      id={`case-${project.slug}`}
      className="case"
      aria-labelledby={titleId}
      style={{ "--accent": ACCENT[color] } as React.CSSProperties}
      onClose={onClosed}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="case-scroll">
        <header className={`${color} relative border-b border-void/20 px-6 pb-7 pt-6 sm:px-10 sm:pb-9 sm:pt-8`}>
          <form method="dialog" className="absolute right-3 top-3 sm:right-5 sm:top-5">
            <button className="btn h-12 w-12 !px-0" aria-label="Close case study">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </form>
          <p className="font-display text-[14px] font-semibold uppercase tracking-wide">
            {discipline} · {project.year}
          </p>
          <h2 id={titleId} className="display mt-2 pr-14 text-[44px] sm:text-[68px]">
            {project.title}
          </h2>
          <p className="mt-3 max-w-[38ch] text-[18px] leading-snug sm:text-[20px]">{project.summary}</p>
        </header>

        <div className="px-6 pb-8 pt-6 sm:px-10">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-line pb-6 sm:grid-cols-3">
            {[
              ["Time", `${project.weeks} weeks`],
              ["Role", project.role],
              ["Tools", project.tools.join(", ")],
            ].map(([label, value]) => (
              <div key={label} className={label === "Tools" ? "col-span-2 sm:col-span-1" : undefined}>
                <dt className="font-display text-[12px] font-semibold uppercase tracking-wide opacity-70">{label}</dt>
                <dd className="mt-0.5 font-display text-[17px] font-bold leading-tight">{value}</dd>
              </div>
            ))}
          </dl>

          {project.sections.map((s) => (
            <section key={s.heading}>
              <h3>{s.heading}</h3>
              {s.body.map((p) => (
                <p key={p} className="max-w-[62ch]">
                  {p}
                </p>
              ))}
              {s.points && (
                <ul className="mt-3 max-w-[62ch]">
                  {s.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <form method="dialog">
              <button className="btn">Back to the room</button>
            </form>
            <a href={`#${next.slug}`} className="btn btn-light">
              Next: {next.title} →
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
