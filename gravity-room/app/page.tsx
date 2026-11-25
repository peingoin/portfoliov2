import { CopyEmail } from "@/components/CopyEmail";
import { Lit } from "@/components/Lit";
import { Orbit } from "@/components/Orbit";
import { Room } from "@/components/Room";
import { ScrollStage } from "@/components/ScrollStage";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export default function Home() {
  return (
    <main>
      <Room
        firstName={site.firstName}
        lastName={site.lastName}
        intro={`${site.role}. ${site.tagline}`}
        year={site.year}
        projects={projects}
      />

      <section id="about" className="about scroll-mt-0 border-t border-line">
        <div className="relative z-[1] mx-auto grid max-w-[1180px] gap-8 px-[var(--gutter)] py-16 md:grid-cols-[1.1fr_1fr] md:gap-12 md:py-24">
          <div>
            <p className="font-display text-[14px] font-semibold uppercase tracking-wide text-aurora">About me</p>
            <Lit text="The human at mission control" className="display mt-3 text-[44px] sm:text-[64px]" />
          </div>
          <div className="max-w-[54ch] space-y-4 text-[18px] md:pt-9">
            {site.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <Orbit skills={site.skills} />

      <section id="contact" className="contact border-t border-line">
        <div className="relative z-[1] mx-auto max-w-[1180px] px-[var(--gutter)] py-16 md:py-24">
          <p className="font-display text-[14px] font-semibold uppercase tracking-wide text-solar">Say hi</p>
          <Lit text="Got something to build?" className="display mt-3 max-w-[14ch] text-[52px] sm:text-[88px]" />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={`mailto:${site.email}`} className="btn btn-solar">
              {site.email}
            </a>
            <CopyEmail email={site.email} />
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
            {site.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center font-display text-[17px] font-bold underline decoration-2 underline-offset-4"
                >
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
        <footer className="relative z-[1] border-t border-line">
          <p className="mx-auto max-w-[1180px] px-[var(--gutter)] py-5 text-[14px] font-medium text-starlight/70">
            © {site.year} {site.firstName} {site.lastName}. Built in zero gravity.
          </p>
        </footer>
      </section>

      <ScrollStage />
    </main>
  );
}
