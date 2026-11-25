import Link from "next/link";
import { CoordReadout } from "@/components/chrome/CoordReadout";
import { CopyEmail } from "@/components/chrome/CopyEmail";
import { Legend } from "@/components/chrome/Legend";
import { ContourMap } from "@/components/map2d/ContourMap";
import { MapPointer } from "@/components/map2d/MapPointer";
import { SummitMarker } from "@/components/summit/SummitMarker";
import { TrailCard } from "@/components/summit/TrailCard";
import { site } from "@/content/site";
import { worldToUV } from "@/lib/heightfield";
import { BASE_CAMP, DISCIPLINES, RANGES, placePeaks } from "@/lib/layout";
import { getProjects } from "@/lib/projects";

export default function Home() {
  const projects = getProjects();
  const peaks = placePeaks(projects);
  const totalWeeks = projects.reduce((sum, p) => sum + p.weeks, 0);
  const ranges = DISCIPLINES.filter((d) => projects.some((p) => p.discipline === d));
  const [campU, campV] = worldToUV(...BASE_CAMP);

  return (
    <main>
      <section className="stage" aria-label="Map of projects">
        {/* Title block */}
        <div className="relative z-10 px-[var(--margin)] pb-8 pt-24 md:absolute md:left-0 md:top-[88px] md:w-[440px] md:p-0 md:pl-[34px]">
          <p className="label">
            Sheet {site.sheet} · Portfolio survey · {site.edition} ed.
          </p>
          <h1 className="display mt-3 text-[52px] md:text-[84px]">{site.name}</h1>
          <p className="mt-4 max-w-[34ch] text-[18px] leading-snug">
            {site.role}. {site.tagline}
          </p>
          <dl className="data mt-5 flex gap-6 text-ink-muted">
            <div>
              <dt className="sr-only">Projects</dt>
              <dd>
                <span className="text-ink">{projects.length}</span> summits
              </dd>
            </div>
            <div>
              <dt className="sr-only">Disciplines</dt>
              <dd>
                <span className="text-ink">{ranges.length}</span> ranges
              </dd>
            </div>
            <div>
              <dt className="sr-only">Total effort</dt>
              <dd>
                <span className="text-ink">{totalWeeks}</span> weeks
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#trail" className="btn btn-primary">
              Follow the trail ↓
            </a>
            <Link href="/gazetteer/" className="btn">
              Plain list
            </Link>
          </div>
        </div>

        {/* The map */}
        <div className="map-frame">
          <div className="map-cover">
            <ContourMap peaks={peaks} />
            <MapPointer peaks={peaks} />
            <div className="map-overlay draw-in">
              {ranges.map((d) => {
                const [u, v] = worldToUV(...RANGES[d].labelAt);
                return (
                  <span
                    key={d}
                    className="map-range range-name"
                    style={
                      {
                        left: `${u * 100}%`,
                        top: `${v * 100}%`,
                        "--tilt": `${RANGES[d].labelTilt}deg`,
                      } as React.CSSProperties
                    }
                    aria-hidden="true"
                  >
                    {RANGES[d].label}
                  </span>
                );
              })}
              {projects.map((project, i) => (
                <SummitMarker key={project.slug} project={project} peak={peaks[i]} index={i} />
              ))}
              <a
                href="#base-camp"
                className="camp min-h-11 pl-4"
                style={{ left: `${campU * 100}%`, top: `${campV * 100}%`, transform: "translate(-22px, -50%)" }}
              >
                <span className="camp-mark" aria-hidden="true" />
                <span className="label text-ink">Base camp</span>
              </a>
            </div>
          </div>
        </div>
        <div className="neatline" aria-hidden="true" />

        {/* Map chrome, desktop only */}
        <div className="absolute bottom-[30px] left-[34px] z-10 hidden md:block">
          <CoordReadout />
        </div>
        <div className="absolute bottom-[30px] right-[34px] z-10 hidden md:block">
          <Legend />
        </div>
      </section>

      {/* Trail log */}
      <section id="trail" className="mx-auto max-w-[1240px] scroll-mt-20 px-[var(--margin)] py-16 md:py-24">
        <p className="label">The trail · {projects.length} stops</p>
        <h2 className="display mt-3 text-[40px] md:text-[56px]">Summits, in order</h2>
        <p className="mt-4 max-w-[52ch] text-ink-muted">
          Each ring is one week of work, so taller peaks took longer. Open any summit for the full
          case study.
        </p>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {projects.map((project, i) => (
            <TrailCard key={project.slug} project={project} peaks={peaks} index={i} />
          ))}
        </ol>
      </section>

      {/* Base camp */}
      <section id="base-camp" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-[var(--margin)] py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <p className="label flex items-center gap-3">
              <span className="camp-mark" aria-hidden="true" />
              Base camp · About and contact
            </p>
            <h2 className="display mt-4 text-[40px] md:text-[56px]">End of the trail</h2>
            <div className="mt-6 max-w-[56ch] space-y-4">
              {site.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={`mailto:${site.email}`} className="btn btn-primary">
                {site.email}
              </a>
              <CopyEmail email={site.email} />
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {site.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="link data inline-flex min-h-11 items-center" rel="noreferrer">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">Kit list · Tools I use</p>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {site.skills.map((s) => (
                <div key={s.range} className="grid grid-cols-[96px_1fr] gap-4 py-4">
                  <dt className="range-name text-[13px] text-ink-muted">{s.range}</dt>
                  <dd className="data text-ink">{s.items.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <footer className="border-t border-line">
          <p className="label mx-auto max-w-[1240px] px-[var(--margin)] py-6">
            © {site.edition} {site.name} · Surveyed and drawn in code
          </p>
        </footer>
      </section>
    </main>
  );
}
