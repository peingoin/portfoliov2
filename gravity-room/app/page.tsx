import Link from "next/link";
import { CopyEmail } from "@/components/CopyEmail";
import { Lit } from "@/components/Lit";
import { Orbit } from "@/components/Orbit";
import { Room } from "@/components/Room";
import { ScrollStage } from "@/components/ScrollStage";
import { WorkIndex } from "@/components/WorkIndex";
import { DISCIPLINE_LABEL, DISCIPLINES, projects } from "@/content/projects";
import { site } from "@/content/site";

export default function Home() {
  const since = Math.min(...projects.map((p) => p.year));
  const facts: [string, string][] = [
    ["Now", site.role],
    ["Makes", DISCIPLINES.map((d) => DISCIPLINE_LABEL[d]).join(" · ")],
    ["Shipped", `${projects.length} projects since ${since}`],
  ];

  return (
    <main>
      <Room
        firstName={site.firstName}
        lastName={site.lastName}
        intro={`${site.role}. ${site.tagline}`}
        year={site.year}
        projects={projects}
      />

      <WorkIndex projects={projects} />

      <section id="about" className="about border-t border-line" aria-label="About me">
        <div className="section-wrap about-grid">
          <div>
            <p className="eyebrow">About me</p>
            <Lit text="The human at mission control" className="display mt-3 text-[44px] sm:text-[64px]" />
          </div>
          <div className="about-copy">
            <p className="about-lead">{site.tagline}</p>
            {site.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <dl className="facts">
              {facts.map(([label, value]) => (
                <div key={label} className="fact">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Orbit skills={site.skills} />

      <section id="contact" className="contact border-t border-line" aria-label="Contact">
        <div className="section-wrap relative z-[1]">
          <p className="eyebrow">Say hi</p>
          <p className="contact-lead display">Got something to build?</p>
          <a href={`mailto:${site.email}`} className="contact-email" aria-label={`Email ${site.email}`}>
            <Lit as="span" text={site.email} className="display" />
          </a>
          <div className="mt-6">
            <CopyEmail email={site.email} />
          </div>
          <ul className="contact-links">
            {site.links.map((l) => (
              <li key={l.label}>
                <a href={l.href} rel="noreferrer">
                  <span>{l.label}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <footer className="relative z-[1] border-t border-line">
          <div className="section-wrap footer-row">
            <p>
              © {site.year} {site.firstName} {site.lastName}. Built in zero gravity.
            </p>
            <Link href="/#top">Back to the room ↑</Link>
          </div>
        </footer>
      </section>

      <ScrollStage />
    </main>
  );
}
