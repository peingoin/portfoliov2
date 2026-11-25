"use client";

import { useMemo, useRef } from "react";
import { createHeightfield, gridRef, uvToWorld } from "@/lib/heightfield";
import { useMap } from "@/lib/store";
import type { Peak } from "@/lib/types";

/** Reads the pointer position over the 2D map and publishes its grid reference and elevation. */
export function MapPointer({ peaks }: { peaks: Peak[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const sample = useMemo(() => createHeightfield(peaks), [peaks]);
  const setCursor = useMap((s) => s.setCursor);

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-[1] cursor-crosshair"
      onPointerMove={(e) => {
        const rect = ref.current!.getBoundingClientRect();
        const u = (e.clientX - rect.left) / rect.width;
        const v = (e.clientY - rect.top) / rect.height;
        const [x, z] = uvToWorld(u, v);
        setCursor({ ...gridRef(x, z), el: sample(x, z) });
      }}
      onPointerLeave={() => setCursor(null)}
    />
  );
}
