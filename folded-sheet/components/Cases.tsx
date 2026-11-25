"use client";

import { useCallback, useEffect } from "react";
import { DISCIPLINE, type Project } from "@/content/projects";
import { pad } from "@/lib/fold";

/**
 * Every case study as a <dialog>. The URL hash decides which one is open,
 * so links are shareable and the back button closes it.
 */
export function Cases({ projects }: { projects: Project[] }) {
  const sync = useCallback(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    document.querySelectorAll<HTMLDialogElement>("dialog.case").forEach((d) => {
      if (d.id === `case-${slug}`) {
        if (!d.open) d.showModal();
        d.querySelector(".case-scroll")?.scrollTo(0, 0);
      } else if (d.open) {
        d.close();
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("hashchange", sync);
    sync();
    return () => window.removeEventListener("hashchange", sync);
  }, [sync]);

  const closed = () => {
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  return (
    <>
      {projects.map((p, i) => {
        const next = projects[(i + 1) % projects.length];
        const titleId = `case-title-${p.slug}`;
        return (
          <dialog
            key={p.slug}
            id={`case-${p.slug}`}
            className="case"
            aria-labelledby={titleId}
            onClose={closed}
            onClick={(e) => {
              if (e.target === e.currentTarget) e.currentTarget.close();
            }}
          >
            <div className="case-scroll">
              <header className="case-head">
                <form method="dialog" className="case-close">
                  <button className="btn btn-icon" aria-label="Put the panel back">
                    ×
                  </button>
                </form>
                <p className="label">
                  Panel {pad(i + 1)} · {DISCIPLINE[p.discipline]} · {p.year}
                </p>
                <h2 id={titleId} className="riso case-title">
                  {p.title}
                </h2>
                <p className="case-claim">{p.claim}</p>
              </header>
              <div className="case-body">
                <dl className="case-meta">
                  <div>
                    <dt>Time</dt>
                    <dd>{p.weeks} weeks</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{p.role}</dd>
                  </div>
                  <div>
                    <dt>Tools</dt>
                    <dd>{p.tools.join(", ")}</dd>
                  </div>
                </dl>
                <dl className="case-numbers">
                  {p.numbers.map((n) => (
                    <div key={n.label}>
                      <dd>{n.value}</dd>
                      <dt>{n.label}</dt>
                    </div>
                  ))}
                </dl>
                <div className="prose">
                  {p.sections.map((s) => (
                    <section key={s.heading}>
                      <h3>{s.heading}</h3>
                      {s.body.map((t) => (
                        <p key={t}>{t}</p>
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
                </div>
                <div className="case-foot">
                  <form method="dialog">
                    <button className="btn">Back to the sheet</button>
                  </form>
                  <a href={`#${next.slug}`} className="btn btn-blue">
                    Next panel: {next.title} →
                  </a>
                </div>
              </div>
            </div>
          </dialog>
        );
      })}
    </>
  );
}
