import { orbit } from "./orbit";
import { planetfall } from "./planetfall";
import { supernova } from "./supernova";
import type { SceneFactory, SceneName } from "./types";

/**
 * Every scene the page can run. Which one is used:
 *   1. `scene` in content/site.ts sets the default.
 *   2. `?scene=name` in the address bar overrides it for that visit, so two
 *      tabs can show two scenes side by side.
 */
export const scenes: Record<SceneName, SceneFactory> = { orbit, supernova, planetfall };

export const isScene = (name: unknown): name is SceneName => typeof name === "string" && name in scenes;

export type { SceneName };
