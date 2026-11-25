"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RANGES } from "@/lib/layout";
import type { Project } from "@/lib/types";

type Key = "order" | "title" | "discipline" | "weeks" | "year";

const COLUMNS: { key: Key; label: string; numeric?: boolean; hideOnPhone?: boolean }[] = [
  { key: "order", label: "No." },
  { key: "title", label: "Summit" },
  { key: "discipline", label: "Range" },
  { key: "weeks", label: "Elevation", numeric: true },
  { key: "year", label: "Year", numeric: true, hideOnPhone: true },
];

/** The plain, sortable list of every project. */
export function Gazetteer({ projects }: { projects: Project[] }) {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "order", dir: 1 });
  const max = Math.max(...projects.map((p) => p.weeks));

  const rows = useMemo(() => {
    return [...projects].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return cmp * sort.dir;
    });
  }, [projects, sort]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">All projects. Column headers sort the table.</caption>
        <thead>
          <tr className="border-y border-line">
            {COLUMNS.map((col) => {
              const active = sort.key === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                  className={`p-0 ${col.hideOnPhone ? "hidden sm:table-cell" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSort((s) => ({ key: col.key, dir: s.key === col.key && s.dir === 1 ? -1 : 1 }))
                    }
                    className={`label flex min-h-11 w-full items-center gap-1.5 px-3 hover:text-signal ${
                      active ? "text-ink" : ""
                    }`}
                  >
                    {col.label}
                    <span aria-hidden="true" className={active ? "text-signal" : "opacity-0"}>
                      {sort.dir === 1 ? "↑" : "↓"}
                    </span>
                  </button>
                </th>
              );
            })}
            <th scope="col" className="label hidden px-3 lg:table-cell">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.slug} className="group border-b border-line transition-colors duration-150 hover:bg-sheet-raised">
              <td className="data w-14 px-3 py-4 text-signal">{String(p.order).padStart(2, "0")}</td>
              <th scope="row" className="px-3 py-4 font-normal">
                <Link href={`/projects/${p.slug}/`} className="block">
                  <span className="heading text-[22px] transition-colors duration-150 group-hover:text-signal">
                    {p.title}
                  </span>
                  <span className="mt-1 block max-w-[46ch] text-[14px] leading-snug text-ink-muted">
                    {p.summary}
                  </span>
                </Link>
              </th>
              <td className="px-3 py-4">
                <span className="data flex items-center gap-2 whitespace-nowrap">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: RANGES[p.discipline].color }}
                    aria-hidden="true"
                  />
                  {RANGES[p.discipline].name}
                </span>
              </td>
              <td className="px-3 py-4">
                <span className="data flex items-center gap-3 whitespace-nowrap">
                  <span className="w-12">{p.weeks} wk</span>
                  <span className="hidden h-1.5 w-24 bg-line sm:block" aria-hidden="true">
                    <span className="block h-full bg-contour-index" style={{ width: `${(p.weeks / max) * 100}%` }} />
                  </span>
                </span>
              </td>
              <td className="data hidden px-3 py-4 sm:table-cell">{p.year}</td>
              <td className="hidden px-3 py-4 text-[14px] text-ink-muted lg:table-cell">{p.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
