/**
 * A scene is the set piece in the middle of the page: the pinned stage that
 * holds "What I use". Every scene gets the same markup (see
 * components/Orbit.tsx) and the same ship; it decides what they do.
 *
 * To add a scene: write a factory in this folder, add it to `scenes` in
 * index.ts and to `SceneName` here, and give it a height in globals.css.
 */
export type SceneName = "orbit" | "supernova" | "planetfall";

export interface Metrics {
  vw: number;
  vh: number;
  /** Desktop-width layout. */
  wide: boolean;
}

/** Where the ship is while the stage is pinned. */
export interface Pose {
  x: number;
  y: number;
  /** Width in px. */
  w: number;
  /** In front of the stage rather than behind it. */
  near?: boolean;
  /** Heading in radians, 0 is nose up. Defaults to the direction of travel. */
  angle?: number;
  /** Extra rotation on top of the heading, for tumbling. */
  spin?: number;
  /** 0 to 1: how hot the hull glows, and how hard it shakes. */
  heat?: number;
  /** 0 to 1: overrides the flame, which otherwise follows scroll speed. */
  thrust?: number;
}

/** A tool pill. */
export interface Sat {
  el: HTMLElement;
  set: number;
  i: number;
  n: number;
  w: number;
  h: number;
}

/** The DOM every scene is handed. */
export interface Parts {
  section: HTMLElement;
  stage: HTMLElement;
  /** Full-stage canvas, already sized and scaled so drawing is in CSS px. */
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  /** One per discipline. */
  sets: HTMLElement[];
  titles: HTMLElement[];
  sats: Sat[];
  /** Colour of each discipline. */
  colors: string[];
  /** Fixed full-screen sky tint, above the stars and below the page. */
  daylight: HTMLElement;
}

export interface Frame {
  /** Progress through the pinned stretch, 0 to 1. */
  p: number;
  /** 0 to 1 as the stage scrolls up into place before it pins. */
  arrive: number;
  /** Whether any of the stage is on screen. */
  visible: boolean;
  /** Scroll speed, px per frame. */
  speed: number;
}

export interface Scene {
  /** Called on load and on every resize, after the pills have been measured. */
  measure(m: Metrics): void;
  /** Must be a pure function of `p`, so scrolling back runs it in reverse. */
  pose(p: number): Pose;
  update(f: Frame): void;
  /** Land tail first instead of turning to fly in nose first. */
  tailFirst?: boolean;
  destroy(): void;
}

export type SceneFactory = (parts: Parts) => Scene;
