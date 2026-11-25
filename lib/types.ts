export type Discipline = "code" | "design" | "video";

export interface Phase {
  name: string;
  weeks: number;
}

export interface Project {
  slug: string;
  title: string;
  year: number;
  /** Total effort in weeks. This is the peak's elevation. */
  weeks: number;
  discipline: Discipline;
  role: string;
  tools: string[];
  summary: string;
  /** Position on the trail, lowest first. */
  order: number;
  phases: Phase[];
  /** Optional manual map position in world units: [x, z]. */
  position?: [number, number];
}

export interface Peak {
  slug: string;
  x: number;
  z: number;
  weeks: number;
}
