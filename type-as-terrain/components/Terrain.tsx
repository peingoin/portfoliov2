"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DISCIPLINE } from "@/content/projects";
import { pad, type Slot } from "@/lib/letters";

gsap.registerPlugin(ScrollTrigger);

type Mode = "zoom" | "snap";

/** Scroll units per project: dive in, hold, surface. */
const PER = 2.6;
/** Pixels of scroll per unit, as a fraction of the viewport height. */
const UNIT = 0.7;

interface Props {
  firstName: string;
  lastName: string;
  slots: Slot[];
  year: string;
  email: string;
  links: { label: string; href: string }[];
}

interface Geo {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

export function Terrain({ firstName, lastName, slots, year, email, links }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const scrollTo = useRef<(i: number) => void>(() => {});
  const [mode, setMode] = useState<Mode>("snap");
  const [active, setActive] = useState(-1);

  const first = firstName.toUpperCase().split("");
  const last = lastName.toUpperCase().split("");
  const contact = [{ label: email, href: `mailto:${email}` }, ...links, { label: `© ${year}`, href: "" }];

  useEffect(() => {
    const root = rootRef.current!;
    const stage = stageRef.current!;
    const name = nameRef.current!;
    const lines = Array.from(name.querySelectorAll<HTMLElement>(".line"));
    const glyphs = Array.from(name.querySelectorAll<HTMLElement>(".glyph"));
    const firstGlyphs = glyphs.filter((g) => g.dataset.line === "0");
    const lastGlyphs = glyphs.filter((g) => g.dataset.line === "1");
    const rooms = Array.from(root.querySelectorAll<HTMLElement>(".room"));
    const counters = stage.querySelector<HTMLElement>(".counters")!;
    const chips = Array.from(counters.children) as HTMLElement[];
    const veil = stage.querySelector<HTMLElement>(".veil")!;
    const arrive = root.querySelector<HTMLElement>(".arrive")!;

    // Size each line of the name so it runs edge to edge, slightly cropped.
    function fit() {
      gsap.set(name, { clearProps: "transform" });
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      // Portrait screens crop the name harder, so it still fills the screen.
      const fill = H > W * 1.2 ? 1.18 : 1.03;
      const sizes = lines.map((l) => {
        l.style.setProperty("--fs", "100px");
        return (100 * W * fill) / l.getBoundingClientRect().width;
      });
      const total = sizes.reduce((a, fs) => a + fs * 0.82, 0);
      const k = Math.min(1, (H * 0.88) / total);
      lines.forEach((l, i) => l.style.setProperty("--fs", `${sizes[i] * k}px`));
    }

    function measure(els: HTMLElement[], rel: HTMLElement): Geo[] {
      const b = rel.getBoundingClientRect();
      return els.map((g) => {
        const r = g.getBoundingClientRect();
        return { cx: r.left - b.left + r.width / 2, cy: r.top - b.top + r.height / 2, w: r.width, h: r.height };
      });
    }

    // Cursor: letters near the pointer grow wider and darker.
    let raf = 0;
    let still = false;
    const onMove = (e: PointerEvent) => {
      if (still || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const reach = stage.clientWidth * 0.3;
        for (const g of glyphs) {
          const r = g.getBoundingClientRect();
          const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
          const k = Math.max(0, 1 - d / reach);
          g.style.setProperty("--wdth", (100 + 22 * k).toFixed(1));
          g.style.setProperty("--grad", (90 * k).toFixed(0));
        }
      });
    };
    const rest = () => {
      for (const g of glyphs) {
        g.style.removeProperty("--wdth");
        g.style.removeProperty("--grad");
      }
    };
    const setStill = (v: boolean) => {
      if (still === v) return;
      still = v;
      if (v) {
        name.setAttribute("data-still", "");
        rest();
      } else {
        name.removeAttribute("data-still");
      }
    };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", rest);

    let current = -1;
    const show = (i: number) => {
      if (i === current) return;
      current = i;
      rooms.forEach((r, j) => (j === i ? r.setAttribute("data-active", "") : r.removeAttribute("data-active")));
      setActive(i);
    };

    function setup() {
      const mm = gsap.matchMedia();
      mm.add(
        {
          zoom: "(min-width: 720px) and (prefers-reduced-motion: no-preference)",
          snap: "(max-width: 719px), (prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const zoom = Boolean(ctx.conditions?.zoom);
          root.dataset.mode = zoom ? "zoom" : "snap";
          setMode(zoom ? "zoom" : "snap");
          fit();

          if (!zoom) {
            // Snap mode: rooms are ordinary sections; track the one in view.
            gsap.set([rooms, counters, chips, veil, arrive], { clearProps: "all" });
            const triggers = rooms.map((room, i) =>
              ScrollTrigger.create({
                trigger: room,
                start: "top 50%",
                end: "bottom 50%",
                onToggle: (self) => self.isActive && show(i),
                onLeave: () => current === i && show(-1),
                onLeaveBack: () => current === i && show(-1),
              }),
            );
            scrollTo.current = (i) => rooms[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
            return () => triggers.forEach((t) => t.kill());
          }

          // Zoom mode: one pinned stage, one scrubbed timeline.
          const W = stage.clientWidth;
          const H = stage.clientHeight;
          const geo = measure(firstGlyphs, name);
          const spots = measure(lastGlyphs, stage);
          chips.forEach((chip, i) => {
            const s = spots[i % spots.length];
            chip.style.left = `${s.cx}px`;
            chip.style.top = `${s.cy + (i >= spots.length ? 40 : 0)}px`;
          });

          const end = slots.length * PER;
          const total = end + 1;
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: () => `+=${total * UNIT * window.innerHeight}`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              snap: {
                snapTo: (p) => {
                  // Settle inside a letter when close to one.
                  const t = p * total;
                  const i = Math.floor(t / PER);
                  if (i >= slots.length) return p;
                  const hold = i * PER + 1.3;
                  return Math.abs(t - hold) < 0.6 ? hold / total : p;
                },
                inertia: false,
                duration: { min: 0.15, max: 0.5 },
                delay: 0.05,
                ease: "power1.inOut",
              },
              onUpdate: (self) => {
                const t = self.progress * total;
                const i = Math.floor(t / PER);
                const u = t - i * PER;
                show(i < slots.length && u > 0.7 && u < 1.9 ? i : -1);
                setStill(t > 0.02 && t < end + 0.1);
              },
            },
          });

          tl.to(arrive, { autoAlpha: 0, duration: 0.25 }, 0);
          slots.forEach((slot, i) => {
            const g = geo[slot.letter];
            const Z = Math.min(16, 1.35 * Math.max(W / g.w, H / g.h));
            const origin = `${g.cx}px ${g.cy}px`;
            const b = i * PER;
            tl.fromTo(name, { scale: 1, transformOrigin: origin }, { scale: Z, transformOrigin: origin, ease: "power2.in", duration: 1 }, b);
            tl.to(veil, { opacity: 1, duration: 0.45 }, b + 0.55);
            tl.fromTo(rooms[i], { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.4 }, b + 0.75);
            tl.addLabel(`room${i}`, b + 1.3);
            tl.to(rooms[i], { autoAlpha: 0, y: -32, ease: "power2.in", duration: 0.25 }, b + 1.6);
            tl.to(veil, { opacity: 0, duration: 0.3 }, b + 1.7);
            tl.to(name, { scale: 1, ease: "power2.out", duration: 1 }, b + 1.6);
          });
          // The end: the name again, with contact details set in the letters.
          tl.fromTo(counters, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, end + 0.2);
          tl.fromTo(
            chips,
            { autoAlpha: 0, scale: 0.5, xPercent: -50, yPercent: -50 },
            { autoAlpha: 1, scale: 1, xPercent: -50, yPercent: -50, stagger: 0.08, duration: 0.35, ease: "back.out(2)" },
            end + 0.25,
          );

          scrollTo.current = (i) => {
            const st = tl.scrollTrigger!;
            const top = st.start + ((i * PER + 1.3) / total) * (st.end - st.start);
            window.scrollTo({ top, behavior: "smooth" });
          };
          return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
            gsap.set([name, rooms, counters, chips, veil, arrive], { clearProps: "all" });
          };
        },
      );
      return mm;
    }

    let mm = setup();
    // The bottom bar belongs to the journey; hide it once the page moves on.
    // Refreshed after the pin, so its end includes the pin spacer.
    const hudTrigger = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom 70%",
      refreshPriority: -1,
      onToggle: (self) => (root.dataset.hud = self.isActive ? "on" : "off"),
    });
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let timer = 0;
    const onResize = () => {
      // Phone browsers resize on scroll as the address bar hides; ignore that.
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
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", rest);
      cancelAnimationFrame(raf);
      hudTrigger.kill();
      mm.revert();
    };
    // Rebuilding on every render of `slots` would restart the scroll scene;
    // only the count matters for the timeline shape.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots.length]);

  let glyphIndex = 0;
  const renderLine = (word: string[], line: number) => (
    <span className="line" style={{ "--n": word.length } as React.CSSProperties} aria-hidden="true">
      {word.map((ch, i) => (
        <span key={i} className="glyph" data-line={line} style={{ "--i": glyphIndex++ } as React.CSSProperties}>
          {ch}
        </span>
      ))}
    </span>
  );

  return (
    <div ref={rootRef} className="terrain" data-mode="snap">
      <header ref={stageRef} className="stage">
        <h1 className="sr-only">
          {firstName} {lastName}
        </h1>
        <div ref={nameRef} className="name">
          {renderLine(first, 0)}
          {renderLine(last, 1)}
        </div>
        <div className="veil" aria-hidden="true" />
        <div className="counters" aria-hidden={mode === "zoom" ? undefined : true}>
          {contact.map((c) =>
            c.href ? (
              <a key={c.label} href={c.href} rel={c.href.startsWith("http") ? "noreferrer" : undefined}>
                {c.label}
              </a>
            ) : (
              <span key={c.label}>{c.label}</span>
            ),
          )}
        </div>
      </header>

      <div className="rooms">
        {slots.map((slot, i) => (
          <section key={slot.project.slug} className="room" aria-labelledby={`room-title-${slot.project.slug}`}>
            <span className="ghost" aria-hidden="true">
              {slot.ch}
            </span>
            <div className="room-head">
              <span className="room-letter" aria-hidden="true">
                {slot.ch}
              </span>
              <span className="label">
                {pad(i + 1)} / {pad(slots.length)} · {DISCIPLINE[slot.project.discipline]} · {slot.project.year}
              </span>
            </div>
            <h2 id={`room-title-${slot.project.slug}`} className="room-title">
              {slot.project.title}
            </h2>
            <p className="room-claim">{slot.project.claim}</p>
            <dl className="numbers">
              {slot.project.numbers.map((n) => (
                <div key={n.label}>
                  <dt>{n.label}</dt>
                  <dd>{n.value}</dd>
                </div>
              ))}
            </dl>
            <div className="room-foot on-black">
              <a href={`/work/${slot.project.slug}/`} className="btn">
                Read the case →
              </a>
              {i < slots.length - 1 && (
                <button type="button" className="btn" onClick={() => scrollTo.current(i + 1)}>
                  Next letter: {slots[i + 1].ch}
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="hud" aria-label="Letters">
        <div className="strip" role="group">
          {first.map((ch, li) => {
            const idx = slots.findIndex((s) => s.letter === li);
            return (
              <button
                key={li}
                type="button"
                disabled={idx < 0}
                aria-current={active >= 0 && slots[active]?.letter === li ? "true" : undefined}
                aria-label={idx >= 0 ? `${ch}: ${slots[idx].project.title}` : ch}
                onClick={() => idx >= 0 && scrollTo.current(idx)}
              >
                {ch}
              </button>
            );
          })}
        </div>
        <p className="arrive">
          <strong>
            {first.length} letters, {slots.length} projects.
          </strong>{" "}
          Scroll to go inside the first letter, or skip to the <a href="#index">index</a>.
        </p>
        <span className="count" aria-live="polite">
          {active >= 0 ? `${pad(active + 1)} / ${pad(slots.length)}` : `— / ${pad(slots.length)}`}
        </span>
      </div>
    </div>
  );
}
