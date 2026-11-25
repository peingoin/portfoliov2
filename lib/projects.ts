import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Project } from "./types";

const DIR = path.join(process.cwd(), "content", "projects");

function read(file: string): { meta: Project; body: string } {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = file.replace(/\.mdx$/, "");
  return { meta: { ...(data as Omit<Project, "slug">), slug }, body: content };
}

/** Every project, in trail order. */
export function getProjects(): Project[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => read(f).meta)
    .sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): { meta: Project; body: string } | null {
  const file = `${slug}.mdx`;
  if (!fs.existsSync(path.join(DIR, file))) return null;
  return read(file);
}
