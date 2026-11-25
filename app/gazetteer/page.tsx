import type { Metadata } from "next";
import Link from "next/link";
import { Gazetteer } from "@/components/summit/Gazetteer";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Gazetteer",
  description: "A plain, sortable list of every project.",
};

export default function GazetteerPage() {
  const projects = getProjects();
  return (
    <main className="mx-auto max-w-[1240px] px-[var(--margin)] pb-24 pt-28 md:pt-36">
      <p className="label">Gazetteer · Index of summits</p>
      <h1 className="display mt-3 text-[48px] md:text-[72px]">All projects</h1>
      <p className="mt-4 max-w-[54ch] text-ink-muted">
        The plain list. Elevation is the number of weeks I worked on each project. Select a column
        heading to sort.
      </p>
      <div className="mt-10">
        <Gazetteer projects={projects} />
      </div>
      <p className="mt-10">
        <Link href="/" className="btn">
          ← Back to the map
        </Link>
      </p>
    </main>
  );
}
