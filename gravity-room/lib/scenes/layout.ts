import type { Sat } from "./types";

export interface Spot {
  x: number;
  y: number;
}

/**
 * Lays one discipline out as a centred title with its pills wrapped in
 * centred rows underneath. Returns centre points.
 */
export function stack(title: HTMLElement, sats: Sat[], cx: number, top: number, maxW: number) {
  const th = title.offsetHeight;
  const titleAt: Spot = { x: cx, y: top + th / 2 };
  const gap = 10;
  const rows: Sat[][] = [[]];
  let used = 0;
  for (const s of sats) {
    const row = rows[rows.length - 1];
    if (row.length && used + gap + s.w > maxW) {
      rows.push([s]);
      used = s.w;
    } else {
      used += (row.length ? gap : 0) + s.w;
      row.push(s);
    }
  }
  const at = new Map<Sat, Spot>();
  let y = top + th + 16;
  for (const row of rows) {
    const width = row.reduce((sum, s) => sum + s.w, 0) + gap * (row.length - 1);
    let x = cx - width / 2;
    const h = Math.max(...row.map((s) => s.h));
    for (const s of row) {
      at.set(s, { x: x + s.w / 2, y: y + h / 2 });
      x += s.w + gap;
    }
    y += h + gap;
  }
  return { titleAt, at, bottom: y };
}
