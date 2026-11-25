/**
 * Things a scene can do to the starfield. The scene writes, Starfield reads.
 */
export const skyFx = {
  /** 0 hides the stars, 1 shows them. */
  fade: 1,
  /** Stars are pushed this many px away from (x, y); negative pulls them in. Near stars move more. */
  push: 0,
  x: 0,
  y: 0,
  /** Set when any of the above changed, so the sky repaints even if the page is still. */
  dirty: false,
};

export function setSky(next: Partial<Omit<typeof skyFx, "dirty">>) {
  for (const key of Object.keys(next) as (keyof typeof next)[]) {
    const value = next[key]!;
    if (Math.abs(skyFx[key] - value) > 0.001) {
      skyFx[key] = value;
      skyFx.dirty = true;
    }
  }
}
