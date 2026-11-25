import { create } from "zustand";

interface Cursor {
  e: string;
  n: string;
  el: number;
}

interface MapState {
  /** Map position under the pointer, or null when off the map. */
  cursor: Cursor | null;
  /** Slug of the summit being hovered or focused. */
  hovered: string | null;
  setCursor: (cursor: Cursor | null) => void;
  setHovered: (slug: string | null) => void;
}

export const useMap = create<MapState>((set) => ({
  cursor: null,
  hovered: null,
  setCursor: (cursor) => set({ cursor }),
  setHovered: (hovered) => set({ hovered }),
}));
