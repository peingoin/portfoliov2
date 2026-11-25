/**
 * The sheet is a 3 x 3 grid of square panels, folded like a map.
 *
 * Folding (closing) order: the left column goes behind the centre, the
 * right column folds over the front, then the bottom row and the top row
 * fold behind. Closed, the packet shows the back of the right-hand middle
 * panel (the cover), and its underside is the back of the top-right panel
 * (the business card).
 *
 * Unfolding plays that in reverse: right, left, down, up. Every step
 * exposes only printed fronts; the reverse printing shows during the turn.
 *
 * In the DOM, rows are the outer hinges and each row holds three column
 * parts. The three parts of a column turn together, so it reads as one
 * fold.
 */

/** Panel size in CSS pixels before the camera scales it. */
export const P = 360;

export type Col = 0 | 1 | 2;
export type Row = 0 | 1 | 2;

/** Which panel each project is printed on, in the order they are revealed. */
export const CELLS: { col: Col; row: Row }[] = [
  { col: 0, row: 1 }, // 1st: left column
  { col: 0, row: 2 }, // bottom row, left to right
  { col: 1, row: 2 },
  { col: 2, row: 2 },
  { col: 0, row: 0 }, // top row, left to right
  { col: 1, row: 0 },
  { col: 2, row: 0 },
];

/** Hinge rest positions when closed: angle in degrees and lift in px. */
export const CLOSED = {
  colL: { a: -180, z: -10 },
  colR: { a: -180, z: 16 },
  rowD: { a: -180, z: -24 },
  rowU: { a: 180, z: -56 },
} as const;

/** Visible bounding box of the sheet after each unfold, as [col0, col1, row0, row1]. */
export const BOXES = {
  closed: [1, 1, 1, 1],
  right: [1, 2, 1, 1],
  left: [0, 2, 1, 1],
  down: [0, 2, 1, 2],
  full: [0, 2, 0, 2],
} as const;

export const pad = (n: number) => String(n).padStart(2, "0");
