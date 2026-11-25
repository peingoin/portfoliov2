import { CopyEmail } from "@/components/CopyEmail";
import { Terrain } from "@/components/Terrain";
import { TopBar } from "@/components/TopBar";
import { DISCIPLINE, projects } from "@/content/projects";
import { site } from "@/content/site";
import { assign, pad } from "@/lib/letters";

export default function Home() {
  const slots = assign(site.firstName, projects);
  return (
    <main>
      <TopBar />
      <Terrain
        firstName={site.firstName}
        lastName={site.lastName}
        slots={slots}
        year={site.year}
        email={site.email}
        links={site.links}
      />

      <section id="index" className="section" aria-labelledby="index-title">
        <div className="wrap">
          <p className="label">Index</p>
          <h2 id="index-title" className="display mt-3 text-[40px] sm:text-[72px]">
            Everything, on one screen.
          </h2>
          <p className="lede mt-5 max-w-[46ch]">{site.tagline}</p>
          <ol className="index-list mt-10">
            {slots.map((s, i) => (
              <li key={s.project.slug}>
                <a href={`/work/${s.project.slug}/`} className="index-row">
                  <span className="index-letter" aria-hidden="true">
                    {s.ch}
                  </span>
                  <span>
                    <span className="index-title">{s.project.title}</span>
                    <span className="index-sum">{s.project.summary}</span>
                  </span>
                  <span className="index-meta">
                    {pad(i + 1)} · {DISCIPLINE[s.project.discipline]} · {s.project.year}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="about" className="section on-black bg-black text-paper" aria-labelledby="about-title">
        <div className="wrap grid gap-12 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="label text-acid">About</p>
            <h2 id="about-title" className="display mt-3 text-[40px] sm:text-[72px]">
              {site.role}. {site.firstName} {site.lastName}.
            </h2>
            <div className="lede mt-6 max-w-[44ch] space-y-5">
              {site.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <dl className="mt-2 space-y-7 md:mt-16">
            {site.skills.map((s) => (
              <div key={s.area}>
                <dt className="label text-acid">{s.area}</dt>
                <dd className="mt-2 text-[22px] font-semibold leading-tight tracking-tight sm:text-[28px]">
                  {s.items.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="contact" className="section" aria-labelledby="contact-title">
        <div className="wrap">
          <p className="label">Contact</p>
          <h2 id="contact-title" className="display mt-3 max-w-[12ch] text-[48px] sm:text-[96px]">
            Write to me.
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={`mailto:${site.email}`} className="btn btn-acid">
              {site.email}
            </a>
            <CopyEmail email={site.email} />
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-2">
            {site.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center text-[17px] font-bold underline decoration-2 underline-offset-4 hover:bg-acid"
                >
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <footer className="rule mt-16 pt-5 text-[14px] font-medium">
            © {site.year} {site.firstName} {site.lastName}. Set in one typeface. No pictures.
          </footer>
        </div>
      </section>
    </main>
  );
}
