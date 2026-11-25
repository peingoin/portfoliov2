"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/content/projects";
import { createRoom, type Mode, type RoomApi } from "@/lib/room";
import { onScrollFrame } from "@/lib/scroll";
import { CaseDialog } from "./CaseDialog";

const TILE_COLOR = "c-plasma";
const CARD_COLOR = { code: "c-plasma", design: "c-comet", video: "c-solar" } as const;
const DISCIPLINE = { code: "Code", design: "Design", video: "Video" } as const;

interface Props {
  firstName: string;
  lastName: string;
  intro: string;
  year: string;
  projects: Project[];
}

type TiltEvent = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

export function Room({ firstName, lastName, intro, year, projects }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<RoomApi | null>(null);
  const [mode, setMode] = useState<Mode>("tidy");
  const [ready, setReady] = useState(false);
  const [floating, setFloating] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [canTilt, setCanTilt] = useState(false);
  const [tilting, setTilting] = useState(false);

  // Start the physics once fonts have settled, so measured sizes are final.
  useEffect(() => {
    let cancelled = false;
    let api: RoomApi | null = null;
    let offScroll: (() => void) | undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);

    Promise.all([import("matter-js"), fonts]).then(([mod]) => {
      if (cancelled || !rootRef.current || !floorRef.current) return;
      api = createRoom(rootRef.current, floorRef.current, mod.default ?? mod, {
        startMessy: !reduced,
        onMode: setMode,
        onFloat: setFloating,
        onTower: (title) => {
          setToast(`Tower built. ${title} has reached orbit.`);
          window.setTimeout(() => setToast(null), 5000);
        },
      });
      apiRef.current = api;
      // Scrolling pushes on the floating blocks.
      if (!reduced) offScroll = onScrollFrame(({ v }) => api?.shove(v));
      setReady(true);
      setCanTilt("DeviceOrientationEvent" in window && window.matchMedia("(pointer: coarse)").matches);
      syncHash();
    });

    return () => {
      cancelled = true;
      offScroll?.();
      api?.destroy();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The URL hash decides which case study is open, so links are shareable
  // and the back button closes the dialog.
  const syncHash = useCallback(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    let open = false;
    document.querySelectorAll<HTMLDialogElement>("dialog.case").forEach((d) => {
      if (d.id === `case-${slug}`) {
        if (!d.open) d.showModal();
        d.querySelector(".case-scroll")?.scrollTo(0, 0);
        open = true;
      } else if (d.open) {
        d.close();
      }
    });
    apiRef.current?.pause(open);
  }, []);

  useEffect(() => {
    window.addEventListener("hashchange", syncHash);
    syncHash();
    return () => window.removeEventListener("hashchange", syncHash);
  }, [syncHash]);

  // Keyboard shortcut: T toggles tidy and mess.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "t" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector("dialog[open]")) return;
      const t = e.target as HTMLElement;
      if (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName)) return;
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Tilt: gravity comes back on, pointing wherever the phone leans.
  useEffect(() => {
    if (!tilting) return;
    apiRef.current?.float(false);
    const onTilt = (e: DeviceOrientationEvent) => {
      const clamp = (n: number) => Math.max(-1, Math.min(1, n));
      apiRef.current?.setGravity(clamp((e.gamma ?? 0) / 40), clamp((e.beta ?? 45) / 45));
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      window.removeEventListener("deviceorientation", onTilt);
      apiRef.current?.float(true);
    };
  }, [tilting]);

  function toggle() {
    if (mode === "mess") apiRef.current?.tidy();
    else apiRef.current?.mess();
  }

  async function toggleTilt() {
    if (tilting) return setTilting(false);
    const Tilt = window.DeviceOrientationEvent as TiltEvent;
    if (typeof Tilt.requestPermission === "function") {
      const result = await Tilt.requestPermission().catch(() => "denied");
      if (result !== "granted") {
        setToast("Tilt needs motion access. You can allow it in your browser settings.");
        window.setTimeout(() => setToast(null), 5000);
        return;
      }
    }
    setTilting(true);
  }

  let order = 0;
  const tiles = (word: string) => (
    <span className="word">
      {word.split("").map((ch, i) => (
        <span
          key={i}
          data-obj
          data-shape="rect"
          data-order={order++}
          className={`obj tile ${TILE_COLOR}`}
          aria-hidden="true"
        >
          {ch.toUpperCase()}
        </span>
      ))}
    </span>
  );

  const hint = !ready
    ? "Running pre-flight checks."
    : mode === "tidy"
      ? "All docked. Sensible choice."
      : floating
        ? "Zero gravity. Go on, throw something."
        : "Gravity's back. Try stacking a tower.";

  return (
    <>
      <section ref={rootRef} className="room" data-mode="tidy" aria-label="Projects">
        <canvas className="dust" aria-hidden="true" />
        <div className="room-top">
          <a href="#about" className="flex min-h-11 items-center gap-2" aria-label="About me">
            <Image src="/logo.svg" alt="" width={66} height={55} priority />
          </a>
          <p className="max-w-[30ch] text-right text-[14px] leading-tight sm:max-w-none sm:text-[15px]">{intro}</p>
        </div>

        <h1 className="name" aria-label={`${firstName} ${lastName}`}>
          {tiles(firstName)}
          {tiles(lastName)}
        </h1>

        <div className="loose">
          <span data-obj data-shape="circle" data-order={order++} className="obj dot ringed c-solar" aria-hidden="true" />
          <a href="#about" data-obj data-shape="pill" data-order={order++} className="obj pill c-aurora" draggable={false}>
            About me
          </a>
          <a href="#contact" data-obj data-shape="pill" data-order={order++} className="obj pill c-aurora" draggable={false}>
            Say hi
          </a>
          <span data-obj data-shape="rect" data-order={order++} className="obj stamp c-void" aria-hidden="true">
            ’{year.slice(2)}
          </span>
          <span data-obj data-shape="circle" data-order={order++} className="obj dot sm c-comet" aria-hidden="true" />
        </div>

        <ul className="cards">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <a
                href={`#${p.slug}`}
                data-obj
                data-shape="rect"
                data-kind="card"
                data-title={p.title}
                data-order={order++}
                className={`obj card ${CARD_COLOR[p.discipline]}`}
                draggable={false}
              >
                <span className="card-top">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>{DISCIPLINE[p.discipline]}</span>
                </span>
                <span className="card-title">{p.title}</span>
                <span className="card-sum">{p.summary}</span>
                <span className="card-meta">
                  {p.weeks} weeks · {p.year}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div ref={floorRef} className="bar">
          <p className="display text-[17px] sm:text-[20px]" aria-live="polite">
            {hint}
          </p>
          <div className="flex flex-wrap gap-2">
            {mode === "mess" && (
              <button type="button" className="btn" onClick={() => apiRef.current?.shake()}>
                Boost
              </button>
            )}
            {mode === "mess" && !tilting && (
              <button
                type="button"
                role="switch"
                aria-checked={!floating}
                className="btn"
                onClick={() => apiRef.current?.float(!floating)}
              >
                Gravity
                <span className="switch-state" aria-hidden="true">
                  {floating ? "off" : "on"}
                </span>
              </button>
            )}
            {mode === "mess" && canTilt && (
              <button type="button" className="btn" aria-pressed={tilting} onClick={toggleTilt}>
                {tilting ? "Stop tilt" : "Tilt"}
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={toggle} disabled={!ready} aria-keyshortcuts="t">
              {mode === "mess" ? "Dock" : "Launch"}
            </button>
          </div>
        </div>
      </section>

      {projects.map((p, i) => (
        <CaseDialog
          key={p.slug}
          project={p}
          color={CARD_COLOR[p.discipline]}
          discipline={DISCIPLINE[p.discipline]}
          next={projects[(i + 1) % projects.length]}
          onClosed={() => {
            if (window.location.hash === `#${p.slug}`) {
              history.replaceState(null, "", window.location.pathname + window.location.search);
            }
            apiRef.current?.pause(false);
          }}
        />
      ))}

      {toast && (
        <p className="toast c-aurora" role="status">
          {toast}
        </p>
      )}
    </>
  );
}
