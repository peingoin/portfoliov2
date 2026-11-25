import type { Project } from "@/content/projects";

export interface Slot {
  /** The letter this project lives in, upper case. */
  ch: string;
  /** Index of that letter within the first name. */
  letter: number;
  project: Project;
}

/** Pairs each project with a letter of the name, wrapping if there are more projects than letters. */
export function assign(firstName: string, projects: Project[]): Slot[] {
  const letters = firstName.toUpperCase().split("");
  return projects.map((project, i) => ({
    ch: letters[i % letters.length],
    letter: i % letters.length,
    project,
  }));
}

export const pad = (n: number) => String(n).padStart(2, "0");
