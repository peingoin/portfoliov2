import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { DISCIPLINE, projects } from "@/content/projects";
import { site } from "@/content/site";
import { assign, pad } from "@/lib/letters";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.claim } : {};
}

export default async function Work({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const slots = assign(site.firstName, projects);
  const i = slots.findIndex((s) => s.project.slug === slug);
  if (i < 0) notFound();
  const { project, ch } = slots[i];
  const prev = slots[(i - 1 + slots.length) % slots.length];
  const next = slots[(i + 1) % slots.length];

  return (
    <main>
      <TopBar />
      <header className="case-hero">
        <span className="big" aria-hidden="true">
          {ch}
        </span>
        <p className="label">
          {pad(i + 1)} / {pad(slots.length)} · {DISCIPLINE[project.discipline]} · {project.year}
        </p>
        <h1 className="case-title">{project.title}</h1>
        <p className="lede max-w-[40ch]">{project.claim}</p>
      </header>

      <div className="case-body">
        <aside>
          <dl className="case-meta">
            <dt>Time</dt>
            <dd>{project.weeks} weeks</dd>
            <dt>Role</dt>
            <dd>{project.role}</dd>
            <dt>Tools</dt>
            <dd>{project.tools.join(", ")}</dd>
            <dt>Letter</dt>
            <dd>
              {ch}, the {["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"][slots[i].letter] ?? `${slots[i].letter + 1}th`}{" "}
              letter of {site.firstName}
            </dd>
          </dl>
          <dl className="numbers mt-6 !max-w-none !grid-cols-1 border-black">
            {project.numbers.map((n) => (
              <div key={n.label}>
                <dt className="!opacity-100 text-mute">{n.label}</dt>
                <dd className="!text-black">{n.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
        <article className="prose">
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

      <nav className="pager" aria-label="Other projects">
        <Link href={`/work/${prev.project.slug}/`}>
          ← {prev.ch}. {prev.project.title}
        </Link>
        <Link href="/#index">Index</Link>
        <Link href={`/work/${next.project.slug}/`}>
          {next.ch}. {next.project.title} →
        </Link>
      </nav>
    </main>
  );
}
