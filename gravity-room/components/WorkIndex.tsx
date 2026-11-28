"use client";

import Link from "next/link";
import { useState, ViewTransition } from "react";
import { DISCIPLINE_COLOR, DISCIPLINE_LABEL, DISCIPLINES, type Discipline, type Project } from "@/content/projects";
import { Lit } from "./Lit";

type Filter = Discipline | "all";

/**
 * Selected work: every project as an upright card you can read at a glance,
 * filtered by discipline. Each card opens its case study page and grows into
 * that page's header on the way.
 */
export function WorkIndex({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const count = (d: Filter) => (d === "all" ? projects.length : projects.filter((p) => p.discipline === d).length);
  const chips: Filter[] = ["all", ...DISCIPLINES];

  return (
    <section id="work" className="work border-t border-line" aria-label="Selected work">
      <div className="section-wrap">
        <div className="work-head">
          <div>
            <p className="eyebrow">Selected work</p>
            <Lit text="Things I made, start to finish" className="display mt-3 text-[40px] sm:text-[60px]" />
          </div>
          <div className="chips" role="group" aria-label="Filter by discipline">
            {chips.map((d) => (
              <button
                key={d}
                type="button"
                className="chip"
                aria-pressed={filter === d}
                onClick={() => setFilter(d)}
              >
                {d === "all" ? "All" : DISCIPLINE_LABEL[d]}
                <span className="chip-n">{count(d)}</span>
              </button>
            ))}
          </div>
        </div>

        <ul className="work-grid">
          {projects.map((p, i) => {
            const hidden = filter !== "all" && p.discipline !== filter;
            return (
              <li key={p.slug} id={`card-${p.slug}`} hidden={hidden}>
                <ViewTransition name={`card-${p.slug}`}>
                  <Link href={`/work/${p.slug}/`} className={`obj card work-card ${DISCIPLINE_COLOR[p.discipline]}`}>
                    <span className="card-top">
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <span>{DISCIPLINE_LABEL[p.discipline]}</span>
                    </span>
                    <span className="card-title">{p.title}</span>
                    <span className="card-sum">{p.summary}</span>
                    <span className="card-stat">
                      <span className="card-stat-v">{p.stats[0].value}</span>
                      <span className="card-stat-l">{p.stats[0].label}</span>
                    </span>
                    <span className="card-meta">
                      <span>
                        {p.weeks} weeks · {p.year}
                      </span>
                      <span aria-hidden="true">Read →</span>
                    </span>
                  </Link>
                </ViewTransition>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
