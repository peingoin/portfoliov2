import Link from "next/link";
import { ViewTransition } from "react";
import { DISCIPLINE_COLOR, DISCIPLINE_LABEL, type Project } from "@/content/projects";

/**
 * A project's case study as its own page. The header band is the same
 * object as the project's card in Selected work, so the card grows into it.
 */
export function CaseStudy({ project, next }: { project: Project; next: Project }) {
  const color = DISCIPLINE_COLOR[project.discipline];
  const discipline = DISCIPLINE_LABEL[project.discipline];
  const meta: [string, string][] = [
    ["Discipline", discipline],
    ["Year", String(project.year)],
    ["Time", `${project.weeks} weeks`],
    ["Role", project.role],
  ];

  return (
    <main className="case-page" style={{ "--c": `var(--color-${color.slice(2)})` } as React.CSSProperties}>
      <div className="case-wrap">
        <nav aria-label="Breadcrumb" className="crumbs">
          <ol>
            <li>
              <Link href={`/#card-${project.slug}`}>← Back to the room</Link>
            </li>
            <li>
              <Link href="/#work">Work</Link>
            </li>
            <li aria-current="page">{project.title}</li>
          </ol>
        </nav>

        <ViewTransition name={`card-${project.slug}`}>
          <header className={`case-hero ${color}`}>
            <p className="case-eyebrow">
              {discipline} · {project.year}
            </p>
            <h1 className="display case-title">{project.title}</h1>
            <p className="case-summary">{project.summary}</p>
          </header>
        </ViewTransition>

        <dl className="stats">
          {project.stats.map((s) => (
            <div key={s.label} className="stat">
              <dt className="stat-label">{s.label}</dt>
              <dd className="stat-value display">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="case-grid">
          <aside className="meta-rail" aria-label="Project details">
            <dl>
              {meta.map(([label, value]) => (
                <div key={label} className="meta-row">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div className="meta-row">
                <dt>Tools</dt>
                <dd>
                  <ul className="tool-pills">
                    {project.tools.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </aside>

          <article className="case-body">
            {project.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {s.points && (
                  <ul>
                    {s.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </div>

        <footer className="case-next">
          <Link href={`/work/${next.slug}/`} className={`obj next-card ${DISCIPLINE_COLOR[next.discipline]}`}>
            <span className="next-eyebrow">Next project · {DISCIPLINE_LABEL[next.discipline]}</span>
            <span className="next-title display">{next.title} →</span>
            <span className="next-sum">{next.summary}</span>
          </Link>
          <Link href="/#work" className="all-work">
            All work
          </Link>
        </footer>
      </div>
    </main>
  );
}
