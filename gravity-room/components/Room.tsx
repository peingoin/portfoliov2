"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DISCIPLINE_COLOR, type Project } from "@/content/projects";
import { createRoom, type Mode, type RoomApi } from "@/lib/room";
import { onScrollFrame } from "@/lib/scroll";

const TILE_COLOR = "c-plasma";

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
  const router = useRouter();
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
    });

    return () => {
      cancelled = true;
      offScroll?.();
      api?.destroy();
      apiRef.current = null;
    };
  }, []);

  // Case studies used to open from #slug on this page. Old links still work:
  // they go on to the project's own page.
  useEffect(() => {
    const go = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (projects.some((p) => p.slug === slug)) router.replace(`/work/${slug}/`);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [projects, router]);

  // Keyboard shortcut: T toggles tidy and mess.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "t" || e.metaKey || e.ctrlKey || e.altKey) return;
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

  // In-page links (tokens, About me, Say hi) scroll there without adding a
  // history entry the router does not know about, so Back from a case study
  // still lands in the room. A token also lights up its card for a moment.
  function onAnchor(e: React.MouseEvent) {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    const target = a && document.getElementById(a.hash.slice(1));
    if (!target) return;
    e.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: a.dataset.kind === "token" ? "center" : "start" });
    if (a.dataset.kind === "token") {
      target.dataset.flash = "";
      window.setTimeout(() => delete target.dataset.flash, 1800);
      target.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    }
  }

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
      <section ref={rootRef} id="top" className="room" data-mode="tidy" aria-label="The room" onClick={onAnchor}>
        <canvas className="dust" aria-hidden="true" />
        <h1 className="name" aria-label={`${firstName} ${lastName}`}>
          {tiles(firstName)}
          {tiles(lastName)}
        </h1>
        <p className="room-intro">{intro}</p>

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

        <ul className="tokens" aria-label="Projects">
          {projects.map((p) => (
            <li key={p.slug}>
              <a
                href={`#card-${p.slug}`}
                data-obj
                data-shape="pill"
                data-kind="token"
                data-title={p.title}
                data-order={order++}
                className={`obj pill token ${DISCIPLINE_COLOR[p.discipline]}`}
                draggable={false}
              >
                {p.title}
              </a>
            </li>
          ))}
        </ul>

        <div ref={floorRef} className="dock">
          <p className="dock-hint display" aria-live="polite">
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

      {toast && (
        <p className="toast c-aurora" role="status">
          {toast}
        </p>
      )}
    </>
  );
}
