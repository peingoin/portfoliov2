"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DISCIPLINE, type Project } from "@/content/projects";
import { BOXES, CELLS, CLOSED, P, pad } from "@/lib/fold";
import { Logo } from "./Logo";
import { SaveCard } from "./SaveCard";

gsap.registerPlugin(ScrollTrigger);

type Stage = "" | "open" | "card";

interface Props {
  firstName: string;
  lastName: string;
  role: string;
  year: string;
  bio: string[];
  skills: { area: string; items: string[] }[];
  email: string;
  links: { label: string; href: string }[];
  projects: Project[];
}

/** Scroll units for the whole journey. See the timeline below. */
const END = 7.2;
const UNIT = 0.8;

export function Sheet(props: Props) {
  const { firstName, lastName, role, year, bio, skills, email, links, projects } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("");
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);

  useEffect(() => {
    const root = rootRef.current!;
    const scene = root.querySelector<HTMLElement>(".scene")!;
    const cam = root.querySelector<HTMLElement>(".cam")!;
    const cam2 = root.querySelector<HTMLElement>(".cam2")!;
    const shadow = root.querySelector<HTMLElement>(".shadow")!;
    const sheet = root.querySelector<HTMLElement>(".sheet")!;
    const partsR = Array.from(root.querySelectorAll<HTMLElement>(".part-r"));
    const partsL = Array.from(root.querySelectorAll<HTMLElement>(".part-l"));
    const rowU = root.querySelector<HTMLElement>(".row-u")!;
    const rowD = root.querySelector<HTMLElement>(".row-d")!;
    const faces = Array.from(root.querySelectorAll<HTMLElement>(".face"));
    const hinges = [...partsR, ...partsL, rowU, rowD];

    let current: Stage = "";
    const show = (s: Stage) => {
      if (s === current) return;
      current = s;
      root.dataset.stage = s;
      setStage(s);
    };

    // User pan and zoom on the open sheet.
    let ux = 0;
    let uy = 0;
    const applyUser = () => {
      gsap.to(cam2, { x: ux, y: uy, scale: zoomRef.current, duration: 0.35, ease: "power2.out", overwrite: true });
    };
    const resetUser = () => {
      ux = 0;
      uy = 0;
      zoomRef.current = 1;
      setZoom(1);
      applyUser();
    };
    let drag: { x: number; y: number; ox: number; oy: number; moved: boolean } | null = null;
    // No pointer capture: it would retarget the click that ends a press, so
    // buttons and panel links inside the scene would stop working.
    const onDown = (e: PointerEvent) => {
      if (current !== "open" || zoomRef.current <= 1 || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, ox: ux, oy: uy, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 4) drag.moved = true;
      if (!drag.moved) return;
      ux = drag.ox + dx;
      uy = drag.oy + dy;
      gsap.set(cam2, { x: ux, y: uy });
    };
    const onUp = () => {
      if (!drag) return;
      if (drag.moved) {
        // Swallow the click that follows a drag so a panel does not open.
        const stop = (ev: Event) => ev.preventDefault();
        scene.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => scene.removeEventListener("click", stop, { capture: true }), 0);
      }
      drag = null;
    };
    scene.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    const onZoom = (e: Event) => {
      const d = (e as CustomEvent<number>).detail;
      if (d === 0) return resetUser();
      zoomRef.current = Math.max(1, Math.min(2.6, zoomRef.current * d));
      if (zoomRef.current === 1) ux = uy = 0;
      setZoom(zoomRef.current);
      applyUser();
    };
    root.addEventListener("sheet:zoom", onZoom);

    function setup() {
      const mm = gsap.matchMedia();
      mm.add(
        {
          sheet: "(min-width: 760px) and (prefers-reduced-motion: no-preference)",
          stack: "(max-width: 759px), (prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const is3d = Boolean(ctx.conditions?.sheet);
          root.dataset.mode = is3d ? "sheet" : "stack";

          if (!is3d) {
            // Stack mode: panels in a column; each one tips open as it arrives.
            gsap.set([cam, cam2, sheet, shadow, ...hinges], { clearProps: "all" });
            show("");
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            const tweens = faces
              .filter((f) => !f.classList.contains("ghost"))
              .map((f) =>
                gsap.fromTo(
                  f,
                  { rotateX: -55, opacity: 0.4, transformOrigin: "50% 0%" },
                  {
                    rotateX: 0,
                    opacity: 1,
                    ease: "back.out(1.3)",
                    scrollTrigger: { trigger: f, start: "top 92%", end: "top 55%", scrub: 0.4 },
                  },
                ),
              );
            return () => tweens.forEach((t) => t.kill());
          }

          // Sheet mode: a pinned scene and one scrubbed timeline.
          const VW = scene.clientWidth;
          const VH = scene.clientHeight;
          const camFor = (box: readonly number[], max = 1, fit = 0.8) => {
            const [c0, c1, r0, r1] = box;
            const w = (c1 - c0 + 1) * P;
            const h = (r1 - r0 + 1) * P;
            const s = Math.min(max, (VW * 0.9) / w, (VH * fit) / h);
            const cx = ((c0 + c1 + 1) / 2 - 1.5) * P;
            const cy = ((r0 + r1 + 1) / 2 - 1.5) * P;
            return { x: -cx * s, y: -cy * s, scale: s };
          };
          const shadowFor = (box: readonly number[]) => {
            const [c0, c1, r0, r1] = box;
            return { x: (c0 - 1.5) * P, y: (r0 - 1.5) * P, width: (c1 - c0 + 1) * P, height: (r1 - r0 + 1) * P };
          };
          gsap.set(cam, camFor(BOXES.closed, 0.92, 0.6));
          gsap.set(cam2, { x: 0, y: 0, scale: 1 });
          gsap.set(shadow, shadowFor(BOXES.closed));
          gsap.set(sheet, { "--flip": "0deg" });
          const rest = (els: HTMLElement[], v: { a: number; z: number }) => gsap.set(els, { "--a": `${v.a}deg`, "--z": `${v.z}px` });
          rest(partsL, CLOSED.colL);
          rest(partsR, CLOSED.colR);
          rest([rowD], CLOSED.rowD);
          rest([rowU], CLOSED.rowU);

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: scene,
              start: "top top",
              end: () => `+=${END * UNIT * window.innerHeight}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              snap: {
                snapTo: "labels",
                inertia: false,
                duration: { min: 0.2, max: 0.7 },
                delay: 0.1,
                ease: "power1.inOut",
              },
              onUpdate: (self) => {
                const t = self.progress * END;
                const next: Stage = t > 3.85 && t < 5.3 ? "open" : t > 6.85 ? "card" : "";
                if (next !== "open" && current === "open") resetUser();
                show(next);
              },
            },
          });
          const open = (els: HTMLElement[], at: number, dur = 1) =>
            tl.to(els, { "--a": "0deg", "--z": "0px", ease: "back.out(1.15)", duration: dur }, at);
          const close = (els: HTMLElement[], v: { a: number; z: number }, at: number, dur: number) =>
            tl.to(els, { "--a": `${v.a}deg`, "--z": `${v.z}px`, ease: "power2.inOut", duration: dur }, at);
          const look = (box: readonly number[], at: number, dur: number, max = 1, fit = 0.8) => {
            tl.to(cam, { ...camFor(box, max, fit), ease: "power2.inOut", duration: dur }, at);
            tl.to(shadow, { ...shadowFor(box), ease: "power2.inOut", duration: dur }, at);
          };

          tl.addLabel("closed", 0);
          // Unfold: right, left, down, up.
          open(partsR, 0);
          look(BOXES.right, 0, 1);
          tl.addLabel("intro", 1);
          open(partsL, 1);
          look(BOXES.left, 1, 1);
          tl.addLabel("first", 2);
          open([rowD], 2);
          look(BOXES.down, 2, 1);
          tl.addLabel("down", 3);
          open([rowU], 3);
          look(BOXES.full, 3, 1, 1, 0.82);
          tl.addLabel("open", 4.6);
          // Fold back up, then turn the packet over: the underside is a business card.
          close([rowU], CLOSED.rowU, 5.2, 0.35);
          close([rowD], CLOSED.rowD, 5.45, 0.35);
          close(partsL, CLOSED.colL, 5.7, 0.35);
          close(partsR, CLOSED.colR, 5.95, 0.35);
          look(BOXES.closed, 5.2, 1.05, 0.92, 0.6);
          tl.to(sheet, { "--flip": "180deg", ease: "power2.inOut", duration: 0.6 }, 6.3);
          tl.to(cam, { ...camFor(BOXES.closed, 1.1, 0.62), ease: "power2.inOut", duration: 0.6 }, 6.3);
          tl.addLabel("card", 7.1);
          tl.to({}, { duration: 0.1 }, 7.1);

          return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
            gsap.set([cam, cam2, sheet, shadow, ...hinges], { clearProps: "all" });
          };
        },
      );
      return mm;
    }

    let mm = setup();
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let timer = 0;
    const onResize = () => {
      if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 140) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        lastW = window.innerWidth;
        lastH = window.innerHeight;
        mm.revert();
        mm = setup();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("resize", onResize);
      root.removeEventListener("sheet:zoom", onZoom);
      scene.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      mm.revert();
    };
  }, [projects.length]);

  const zoomBy = (d: number) => rootRef.current?.dispatchEvent(new CustomEvent("sheet:zoom", { detail: d }));

  // What is printed on each panel. Project n lives in CELLS[n]; the last cell
  // is about and contact. Order numbers set the reading order in stack mode.
  const fronts = new Map<string, React.ReactNode>();
  projects.forEach((p, i) => {
    const c = CELLS[i];
    if (c) fronts.set(`${c.col},${c.row}`, <ProjectFace key={p.slug} project={p} n={i + 1} order={10 + i} />);
  });
  const aboutCell = CELLS[Math.min(projects.length, CELLS.length - 1)];
  fronts.set(
    `${aboutCell.col},${aboutCell.row}`,
    <div className="face front" style={{ "--o": 40 } as React.CSSProperties}>
      <span className="num">About</span>
      <h3 className="riso">What I use</h3>
      <dl className="skills">
        {skills.map((s) => (
          <div key={s.area}>
            <dt>{s.area}</dt>
            <dd>{s.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
      <p className="meta">
        <a href={`mailto:${email}`}>{email}</a>
        <br />
        {links.map((l, i) => (
          <span key={l.label}>
            {i > 0 && " · "}
            <a href={l.href} rel="noreferrer">
              {l.label}
            </a>
          </span>
        ))}
      </p>
    </div>,
  );
  fronts.set(
    "1,1",
    <div className="face front intro" style={{ "--o": 1 } as React.CSSProperties}>
      <span className="num">Hello</span>
      <h3 className="riso">I&apos;m {firstName}.</h3>
      {bio.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>,
  );
  fronts.set(
    "2,1",
    <div className="face front intro" style={{ "--o": 2 } as React.CSSProperties}>
      <span className="num">{year}</span>
      <h3 className="riso">What I make</h3>
      <dl className="skills">
        {skills.map((s) => (
          <div key={s.area}>
            <dt>{s.area}</dt>
            <dd>{s.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
      <p className="meta">{projects.length} projects follow. Keep unfolding.</p>
    </div>,
  );

  // Backs: the cover on the packet's top, the card on its underside.
  const backs = new Map<string, React.ReactNode>();
  backs.set(
    "2,1",
    <div className="face back cover" style={{ "--o": 0 } as React.CSSProperties}>
      <Logo />
      <p className="cover-name">
        {firstName}
        <br />
        {lastName}
      </p>
      <p className="cover-role">
        {role} · {year}
      </p>
      <p className="cover-hint">Scroll to unfold</p>
    </div>,
  );
  backs.set(
    "2,0",
    <div className="face back card" style={{ "--o": 50 } as React.CSSProperties} aria-hidden="true">
      <Logo />
      <p className="card-name">
        {firstName} {lastName}
      </p>
      <p className="card-role">{role}</p>
      <p className="card-lines">
        {email}
        <br />
        {links.map((l) => l.label).join(" · ")}
      </p>
    </div>,
  );
  const titleAt = (col: number, row: number) => {
    if (row === 1 && col > 0) return col === 1 ? `Hello, ${firstName}` : "What I make";
    const i = CELLS.findIndex((c) => c.col === col && c.row === row);
    return i >= 0 && i < projects.length ? projects[i].title : "About";
  };

  const panel = (col: number, row: number) => {
    const key = `${col},${row}`;
    return (
      <div className="panel" data-cell={key}>
        {fronts.get(key)}
        {backs.get(key) ?? (
          <div className="face back ghost" aria-hidden="true">
            <span>{titleAt(col, row)}</span>
          </div>
        )}
      </div>
    );
  };
  const rowOf = (row: number) => (
    <>
      <div className="hinge part part-l">{panel(0, row)}</div>
      {panel(1, row)}
      <div className="hinge part part-r">{panel(2, row)}</div>
    </>
  );

  return (
    <div ref={rootRef} className="fold" data-mode="stack" data-stage="">
      <div className="scene">
        <div className="cam">
          <div className="cam2">
            <div className="shadow" aria-hidden="true" />
            <div className="sheet" aria-label="The sheet">
              <div className="hinge row row-u">{rowOf(0)}</div>
              <div className="row row-m">{rowOf(1)}</div>
              <div className="hinge row row-d">{rowOf(2)}</div>
            </div>
          </div>
        </div>

        <div className="sheet-ui">
          <p className="hint" aria-live="polite">
            {stage === "open" && "Fully open. Click a panel to lift it off the sheet."}
            {stage === "card" && "Folded into a card. Take it with you."}
          </p>
          <div className="zoomers" hidden={stage !== "open"}>
            <button type="button" className="btn btn-icon" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.4)} disabled={zoom <= 1}>
              −
            </button>
            <button type="button" className="btn btn-icon" aria-label="Zoom in" onClick={() => zoomBy(1.4)} disabled={zoom >= 2.6}>
              +
            </button>
            <button type="button" className="btn" onClick={() => zoomBy(0)} disabled={zoom <= 1}>
              Fit
            </button>
          </div>
          <div className="savers" hidden={stage !== "card"}>
            <SaveCard firstName={firstName} lastName={lastName} role={role} email={email} links={links.map((l) => l.label)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectFace({ project, n, order }: { project: Project; n: number; order: number }) {
  return (
    <div className="face front" style={{ "--o": order } as React.CSSProperties}>
      <span className="num">{pad(n)}</span>
      <h3 className="riso">{project.title}</h3>
      <p>{project.summary}</p>
      <p className="meta">
        {project.year} · {DISCIPLINE[project.discipline]} · {project.weeks} weeks
      </p>
      <a href={`#${project.slug}`} className="lift">
        <span className="sr-only">Open the case study for </span>
        <span aria-hidden="true">Lift the panel</span>
        <span className="sr-only">{project.title}</span>
      </a>
    </div>
  );
}
