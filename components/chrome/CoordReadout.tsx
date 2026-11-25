"use client";

import { useMap } from "@/lib/store";

/** Live grid reference and elevation under the pointer. */
export function CoordReadout() {
  const cursor = useMap((s) => s.cursor);
  return (
    <div className="data flex gap-4 text-ink-muted" aria-hidden="true">
      <span>
        E <span className="text-ink">{cursor?.e ?? "----"}</span>
      </span>
      <span>
        N <span className="text-ink">{cursor?.n ?? "----"}</span>
      </span>
      <span>
        EL{" "}
        <span className="text-signal">{cursor ? cursor.el.toFixed(1).padStart(4, "0") : "--.-"}</span> WK
      </span>
    </div>
  );
}
