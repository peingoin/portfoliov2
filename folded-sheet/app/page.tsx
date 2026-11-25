import Link from "next/link";
import { Cases } from "@/components/Cases";
import { CopyEmail } from "@/components/CopyEmail";
import { Logo } from "@/components/Logo";
import { Sheet } from "@/components/Sheet";
import { DISCIPLINE, projects } from "@/content/projects";
import { site } from "@/content/site";
import { pad } from "@/lib/fold";

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <Link href="/" className="brand" aria-label={`${site.firstName} ${site.lastName}, home`}>
          <Logo size={22} />
          <span>
            {site.firstName} {site.lastName}
          </span>
        </Link>
        <nav aria-label="Site">
          <a href="#flat">Plain version</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <h1 className="sr-only">
        {site.firstName} {site.lastName}: a folded sheet
      </h1>

      <Sheet
        firstName={site.firstName}
        lastName={site.lastName}
        role={site.role}
        year={site.year}
        bio={site.bio}
        skills={site.skills}
        email={site.email}
        links={site.links}
        projects={projects}
      />

      <section id="flat" className="flat" aria-labelledby="flat-title">
        <div className="wrap">
          <p className="label">The sheet, flat</p>
          <h2 id="flat-title" className="riso h2">
            Everything on the sheet, as a list.
          </h2>
          <p className="lede">{site.tagline}</p>
          <ol className="list">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <a href={`#${p.slug}`} className="entry">
                  <span className="entry-n">{pad(i + 1)}</span>
                  <span className="entry-main">
                    <span className="entry-title">{p.title}</span>
                    <span className="entry-sum">{p.summary}</span>
                  </span>
                  <span className="entry-meta">
                    {DISCIPLINE[p.discipline]} · {p.year}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="contact" className="contact" aria-labelledby="contact-title">
        <div className="wrap grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="label">Contact</p>
            <h2 id="contact-title" className="riso h2">
              Write to me.
            </h2>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href={`mailto:${site.email}`} className="btn btn-blue">
                {site.email}
              </a>
              <CopyEmail email={site.email} />
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-1">
              {site.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} rel="noreferrer" className="link">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="about">
            <p className="label">About</p>
            {site.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <footer className="wrap foot">
          <Logo size={18} />
          <span>
            © {site.year} {site.firstName} {site.lastName}. Printed on one sheet.
          </span>
        </footer>
      </section>

      <Cases projects={projects} />
    </main>
  );
}
