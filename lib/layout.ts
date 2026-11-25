import type { Discipline, Peak, Project } from "./types";

/**
 * Where each discipline's range sits on the map, and the direction its
 * ridge runs. Projects in a range are spaced along that ridge.
 */
export const RANGES: Record<
  Discipline,
  {
    name: string;
    label: string;
    center: [number, number];
    ridge: number; // degrees, 0 = east, 90 = south
    labelAt: [number, number];
    labelTilt: number;
    color: string;
  }
> = {
  code: {
    name: "Code",
    label: "Code Range",
    center: [-4.4, 1.9],
    ridge: 16,
    labelAt: [-5.3, 3.75],
    labelTilt: 4,
    color: "#2F8F83",
  },
  design: {
    name: "Design",
    label: "Design Range",
    center: [0.3, -0.7],
    ridge: 108,
    labelAt: [0.6, 2.9],
    labelTilt: 5,
    color: "#6C78E0",
  },
  video: {
    name: "Video",
    label: "Video Range",
    center: [4.7, -0.3],
    ridge: 62,
    labelAt: [4.7, -3.1],
    labelTilt: -5,
    color: "#C08A3E",
  },
};

export const DISCIPLINES: Discipline[] = ["code", "design", "video"];

export const BASE_CAMP: [number, number] = [2.9, 3.35];

const SPACING = 2.5;

function slugHash(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function placePeaks(projects: Project[]): Peak[] {
  const peaks: Peak[] = [];
  for (const discipline of DISCIPLINES) {
    const range = RANGES[discipline];
    const group = projects
      .filter((p) => p.discipline === discipline)
      .sort((a, b) => a.order - b.order);
    const rad = (range.ridge * Math.PI) / 180;
    const ax = Math.cos(rad);
    const az = Math.sin(rad);
    group.forEach((project, i) => {
      if (project.position) {
        peaks.push({
          slug: project.slug,
          x: project.position[0],
          z: project.position[1],
          weeks: project.weeks,
        });
        return;
      }
      const along = (i - (group.length - 1) / 2) * SPACING;
      const across = (slugHash(project.slug) - 0.5) * 0.8;
      peaks.push({
        slug: project.slug,
        x: range.center[0] + ax * along - az * across,
        z: range.center[1] + az * along + ax * across,
        weeks: project.weeks,
      });
    });
  }
  // Return in trail order.
  const order = new Map(projects.map((p) => [p.slug, p.order]));
  return peaks.sort((a, b) => order.get(a.slug)! - order.get(b.slug)!);
}

/** Trail waypoints in world units: every summit in order, then base camp. */
export function trailPoints(peaks: Peak[]): [number, number][] {
  return [...peaks.map((p) => [p.x, p.z] as [number, number]), BASE_CAMP];
}

/** Catmull-Rom spline through points, as cubic Bezier segments. */
export function smoothPath(points: [number, number][], tension = 0.5): string {
  if (points.length < 2) return "";
  const f = (n: number) => n.toFixed(2);
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1[0] + ((p2[0] - p0[0]) * tension) / 3;
    const c1y = p1[1] + ((p2[1] - p0[1]) * tension) / 3;
    const c2x = p2[0] - ((p3[0] - p1[0]) * tension) / 3;
    const c2y = p2[1] - ((p3[1] - p1[1]) * tension) / 3;
    d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
