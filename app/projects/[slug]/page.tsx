import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ContourRings } from "@/components/map2d/ContourRings";
import { RANGES, placePeaks } from "@/lib/layout";
import { getProject, getProjects } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.meta.title, description: project.meta.summary };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { meta, body } = project;
  const projects = getProjects();
  const peaks = placePeaks(projects);
  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];
  const range = RANGES[meta.discipline];

  const facts = [
    { label: "Elevation", value: `${meta.weeks} weeks` },
    { label: "Surveyed", value: String(meta.year) },
    { label: "Range", value: range.name },
    { label: "Role", value: meta.role },
    { label: "Tools", value: meta.tools.join(", ") },
  ];

  return (
    <main className="pb-24">
      <header className="relative overflow-hidden border-b border-line">
        <ContourRings
          peaks={peaks}
          slug={slug}
          detail="hero"
          className="pointer-events-none absolute -right-[10%] top-1/2 w-[min(820px,110vw)] -translate-y-1/2 opacity-70 md:right-[-4%]"
        />
        <div className="relative mx-auto max-w-[1240px] px-[var(--margin)] pb-12 pt-32 md:pb-16 md:pt-44">
          <p className="label flex items-center gap-2">
            <span className="text-signal">Summit {String(index + 1).padStart(2, "0")}</span>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: range.color }} aria-hidden="true" />
            {range.label}
          </p>
          <h1 className="display mt-4 text-[56px] md:text-[112px]">{meta.title}</h1>
          <p className="mt-5 max-w-[40ch] text-[20px] leading-snug">{meta.summary}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1240px] gap-12 px-[var(--margin)] pt-12 lg:grid-cols-[280px_1fr] lg:gap-20">
        <aside>
          <dl className="divide-y divide-line border-y border-line lg:sticky lg:top-24">
            {facts.map((f) => (
              <div key={f.label} className="grid grid-cols-[110px_1fr] gap-3 py-3">
                <dt className="label pt-0.5">{f.label}</dt>
                <dd className="data text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
        <article className="prose-survey">
          <MDXRemote source={body} />
        </article>
      </div>

      <nav
        aria-label="More projects"
        className="mx-auto mt-20 flex max-w-[1240px] flex-wrap items-center justify-between gap-4 border-t border-line px-[var(--margin)] pt-8"
      >
        <Link href="/" className="btn">
          ← Back to the map
        </Link>
        <Link href={`/projects/${next.slug}/`} className="btn btn-primary">
          Next summit: {next.title} →
        </Link>
      </nav>
    </main>
  );
}
