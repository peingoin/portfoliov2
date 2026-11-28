import type Matter from "matter-js";

type M = typeof Matter;
export type Mode = "tidy" | "mess";

export interface RoomApi {
  mess(): void;
  tidy(): void;
  shake(): void;
  /** Zero gravity on or off. */
  float(on: boolean): void;
  /** Direction of gravity, used by tilt. Ignored while floating. */
  setGravity(x: number, y: number): void;
  pause(paused: boolean): void;
  /**
   * The page is scrolling at `v` px per frame. Floating blocks have inertia,
   * so they try to stay where they are on screen while the room moves around
   * them, and get their own speed back when the page stops.
   */
  shove(v: number): void;
  destroy(): void;
}

interface Options {
  startMessy: boolean;
  onMode(mode: Mode): void;
  onFloat(floating: boolean): void;
  onTower(title: string): void;
}

interface Item {
  el: HTMLElement;
  body: Matter.Body;
  x0: number;
  y0: number;
  w: number;
  h: number;
  order: number;
  isToken: boolean;
  phase: number;
  color: string;
}

/** A speck of stardust shed by a moving block or struck off in a collision. */
interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  color: string;
  flare: boolean;
}

const MAX_MOTES = 260;

const STEP = 1000 / 60;
const WALL = 400;
const SPRING = "cubic-bezier(0.3, 1.45, 0.5, 1)";
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Turns every [data-obj] element inside `root` into a physics body.
 *
 * The elements stay in normal page flow (that is the tidy layout). Physics
 * only ever writes a CSS transform, so text stays real, selectable and
 * readable by assistive tech, and "Tidy up" is just removing the transform.
 */
export function createRoom(root: HTMLElement, floorEl: HTMLElement, M: M, opts: Options): RoomApi {
  const engine = M.Engine.create({ enableSleeping: true });
  const world = engine.world;
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-obj]"));

  let items: Item[] = [];
  let mode: Mode = "tidy";
  let paused = false;
  let width = 0;
  let floorY = 0;
  let raf = 0;
  let last = performance.now();
  let acc = 0;
  let tidyTimer = 0;
  let destroyed = false;

  // Zero gravity. After a drop the blocks land, then gravity cuts out.
  let floating = false;
  let dropping = false;
  let dropAt = 0;
  let landedAt = 0;
  let clock = 0;
  let ceiling: Matter.Body | null = null;

  // Stardust. Skipped entirely when the visitor prefers reduced motion.
  const canvas = root.querySelector<HTMLCanvasElement>("canvas.dust");
  const ctx = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? null : (canvas?.getContext("2d") ?? null);
  const byBody = new Map<number, Item>();
  let motes: Mote[] = [];
  let dustDirty = false;
  let dustAt = performance.now();

  let drag: { item: Item; constraint: Matter.Constraint; id: number; sx: number; sy: number; moved: number } | null =
    null;
  let suppressClick = false;
  let watch: { item: Item; frames: number } | null = null;
  let towerDone = false;
  let shoved = 0;

  const setStatic = (body: Matter.Body, value: boolean) => {
    if (body.isStatic !== value) M.Body.setStatic(body, value);
  };

  function build() {
    M.Composite.clear(world, false);
    width = root.clientWidth;
    floorY = floorEl.offsetTop;

    items = els.map((el, i) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x0 = el.offsetLeft + w / 2;
      const y0 = el.offsetTop + h / 2;
      const shape = el.dataset.shape;
      const common = { restitution: 0.22, friction: 0.7, frictionAir: 0.012, density: 0.0018 };
      const body =
        shape === "circle"
          ? M.Bodies.circle(x0, y0, w / 2, common)
          : M.Bodies.rectangle(x0, y0, w, h, {
              ...common,
              chamfer: { radius: shape === "pill" ? Math.max(2, h / 2 - 1) : Math.min(14, h / 4) },
            });
      M.Body.setStatic(body, true);
      el.style.transform = "";
      return {
        el,
        body,
        x0,
        y0,
        w,
        h,
        order: Number(el.dataset.order ?? i),
        isToken: el.dataset.kind === "token",
        phase: rand(0, Math.PI * 2),
        color: getComputedStyle(el).getPropertyValue("--c").trim() || "#f2f0ff",
      };
    });

    byBody.clear();
    for (const it of items) byBody.set(it.body.id, it);
    motes = [];
    if (canvas && ctx) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = width * dpr;
      canvas.height = root.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const wall = { isStatic: true, friction: 0.8 };
    // Parked far above during a drop, lowered to the top of the room for floating.
    ceiling = M.Bodies.rectangle(width / 2, -5000, width + WALL * 2, WALL, wall);
    M.Composite.add(world, [
      ...items.map((it) => it.body),
      M.Bodies.rectangle(width / 2, floorY + WALL / 2, width + WALL * 2, WALL, wall),
      M.Bodies.rectangle(-WALL / 2, floorY - 3000, WALL, 8000, wall),
      M.Bodies.rectangle(width + WALL / 2, floorY - 3000, WALL, 8000, wall),
      ceiling,
    ]);
  }

  function write(it: Item) {
    const { position, angle } = it.body;
    it.el.style.transform = `translate3d(${(position.x - it.x0).toFixed(1)}px, ${(position.y - it.y0).toFixed(
      1,
    )}px, 0) rotate(${angle.toFixed(3)}rad)`;
  }

  function emit(x: number, y: number, vx: number, vy: number, color: string, life: number, flare = false) {
    if (!ctx || motes.length >= MAX_MOTES) return;
    motes.push({ x, y, vx, vy, life, max: life, r: flare ? rand(1.3, 2) : rand(0.5, 1.3), color, flare });
  }

  // Fast blocks leave a wake of stars behind them.
  function shed(it: Item) {
    const b = it.body;
    if (b.speed < 5 || Math.random() > Math.min(0.7, b.speed / 26)) return;
    const reach = Math.min(it.w, it.h) * 0.35;
    emit(
      b.position.x + rand(-reach, reach),
      b.position.y + rand(-reach, reach),
      -b.velocity.x * 0.06 + rand(-0.25, 0.25),
      -b.velocity.y * 0.06 + rand(-0.25, 0.25),
      Math.random() < 0.3 ? "#f2f0ff" : it.color,
      rand(450, 1100),
      Math.random() < 0.12,
    );
  }

  // A hard knock strikes sparks off both blocks at the point of contact.
  function onCollide(e: Matter.IEventCollision<Matter.Engine>) {
    if (!ctx || mode !== "mess") return;
    for (const pair of e.pairs) {
      const a = pair.bodyA;
      const b = pair.bodyB;
      const hit = Math.hypot(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y);
      const at = pair.collision.supports[0];
      if (hit < 3.2 || !at) continue;
      const ia = byBody.get(a.id);
      const ib = byBody.get(b.id);
      const n = Math.min(10, Math.round(hit * 0.7));
      for (let i = 0; i < n; i++) {
        const it = (i % 2 ? ia : ib) ?? ia ?? ib;
        const angle = rand(0, Math.PI * 2);
        const speed = rand(0.4, 1 + hit * 0.22);
        emit(at.x, at.y, Math.cos(angle) * speed, Math.sin(angle) * speed, it?.color ?? "#f2f0ff", rand(350, 900), i === 0);
      }
    }
  }
  M.Events.on(engine, "collisionStart", onCollide);

  function drawDust(now: number) {
    const dt = Math.min(50, now - dustAt);
    dustAt = now;
    if (!ctx || (!motes.length && !dustDirty)) return;
    ctx.clearRect(0, 0, width, root.clientHeight);
    dustDirty = motes.length > 0;
    const k = dt / STEP;
    motes = motes.filter((m) => (m.life -= dt) > 0);
    for (const m of motes) {
      m.x += m.vx * k;
      m.y += m.vy * k;
      m.vx *= 0.97;
      m.vy *= 0.97;
      const a = m.life / m.max;
      ctx.globalAlpha = a;
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r * (0.5 + a * 0.5), 0, Math.PI * 2);
      ctx.fill();
      if (m.flare) {
        // The same cross flare as the bright stars in the sky.
        ctx.globalAlpha = a * 0.5;
        ctx.fillRect(m.x - m.r * 4, m.y - 0.4, m.r * 8, 0.8);
        ctx.fillRect(m.x - 0.4, m.y - m.r * 4, 0.8, m.r * 8);
      }
    }
    ctx.globalAlpha = 1;
  }

  function setMode(next: Mode) {
    mode = next;
    root.dataset.mode = next;
    opts.onMode(next);
  }

  function setFloat(on: boolean, kick = 1) {
    dropping = false;
    floating = on;
    engine.enableSleeping = !on;
    engine.gravity.x = 0;
    engine.gravity.y = on ? 0 : 1;
    if (ceiling) M.Body.setPosition(ceiling, { x: width / 2, y: -WALL / 2 });
    for (const it of items) {
      const b = it.body;
      M.Sleeping.set(b, false);
      b.frictionAir = on ? 0.004 : 0.012;
      b.restitution = on ? 0.7 : 0.22;
      // Anything still above the room comes inside before the ceiling closes.
      if (b.bounds.min.y < 4) M.Body.setPosition(b, { x: b.position.x, y: b.position.y + 4 - b.bounds.min.y });
      if (on) {
        M.Body.setVelocity(b, { x: rand(-1.2, 1.2) * kick, y: rand(-2.6, -0.9) * kick });
        M.Body.setAngularVelocity(b, rand(-0.02, 0.02) * kick);
      }
    }
    root.dataset.float = String(on);
    opts.onFloat(on);
  }

  // A slow wandering push so floating blocks never come to a dead stop.
  function drift() {
    const t = clock / 1000;
    for (const it of items) {
      const b = it.body;
      b.force.x += b.mass * 6e-6 * Math.sin(t * 0.21 + it.phase);
      b.force.y += b.mass * 6e-6 * Math.cos(t * 0.17 + it.phase * 1.7);
      b.torque += b.inertia * 4e-8 * Math.sin(t * 0.13 + it.phase * 2.3);
    }
  }

  function mess(drop = false) {
    window.clearTimeout(tidyTimer);
    if (drop) {
      // Fall in under gravity first; frame() switches to floating once everything has landed.
      floating = false;
      dropping = true;
      dropAt = performance.now();
      landedAt = 0;
      engine.enableSleeping = true;
      engine.gravity.x = 0;
      engine.gravity.y = 1;
      if (ceiling) M.Body.setPosition(ceiling, { x: width / 2, y: -5000 });
      root.dataset.float = "false";
    }
    for (const it of items) {
      it.el.style.transition = "";
      setStatic(it.body, false);
      M.Sleeping.set(it.body, false);
      if (drop) {
        it.body.frictionAir = 0.012;
        it.body.restitution = 0.22;
        const x = Math.min(width - it.w / 2 - 8, Math.max(it.w / 2 + 8, it.x0 + rand(-24, 24)));
        M.Body.setPosition(it.body, { x, y: -it.h - 60 - it.order * 70 - rand(0, 50) });
        M.Body.setAngle(it.body, rand(-0.45, 0.45));
        M.Body.setVelocity(it.body, { x: 0, y: 0 });
        M.Body.setAngularVelocity(it.body, rand(-0.03, 0.03));
        write(it);
      }
    }
    // Launched from the dock: straight into zero gravity with a lift-off kick.
    if (!drop) setFloat(true, 2.6);
    last = performance.now();
    acc = 0;
    setMode("mess");
  }

  function tidy(animate = true) {
    endDrag();
    watch = null;
    dropping = false;
    window.clearTimeout(tidyTimer);
    for (const it of items) {
      if (animate) {
        // Bring the angle into one turn so the spring home never spins more than half way round.
        const turn = Math.PI * 2;
        const a = ((((it.body.angle + Math.PI) % turn) + turn) % turn) - Math.PI;
        it.el.style.transition = "none";
        it.el.style.transform = `translate3d(${it.body.position.x - it.x0}px, ${
          it.body.position.y - it.y0
        }px, 0) rotate(${a}rad)`;
      }
      setStatic(it.body, true);
      M.Body.setPosition(it.body, { x: it.x0, y: it.y0 });
      M.Body.setAngle(it.body, 0);
    }
    if (animate) {
      void root.offsetWidth; // commit the start transforms before transitioning
      items.forEach((it, i) => {
        it.el.style.transition = `transform 720ms ${SPRING} ${i * 14}ms`;
        it.el.style.transform = "";
      });
      tidyTimer = window.setTimeout(() => {
        for (const it of items) it.el.style.transition = "";
      }, 1200);
    } else {
      for (const it of items) {
        it.el.style.transition = "";
        it.el.style.transform = "";
      }
    }
    setMode("tidy");
  }

  function shake() {
    if (mode !== "mess") return;
    for (const it of items) {
      M.Sleeping.set(it.body, false);
      M.Body.setVelocity(
        it.body,
        floating ? { x: rand(-9, 9), y: rand(-9, 9) } : { x: rand(-11, 11), y: rand(-24, -11) },
      );
      M.Body.setAngularVelocity(it.body, floating ? rand(-0.12, 0.12) : rand(-0.25, 0.25));
    }
  }

  function checkTower() {
    if (!watch || towerDone || drag || floating) return;
    const { item } = watch;
    const b = item.body;
    if (b.speed > 0.25 && !b.isSleeping) {
      watch.frames = 0;
      return;
    }
    if (++watch.frames < 45) return;
    const high = b.bounds.max.y < floorY - item.h * 2;
    const highest = items.every((o) => o === item || o.body.bounds.min.y > b.bounds.min.y);
    if (high && highest) {
      towerDone = true;
      opts.onTower(item.el.dataset.title ?? "");
    }
    watch = null;
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (paused || mode !== "mess") {
      last = now;
      // Dust already in the air keeps fading after a dock.
      if (!paused) drawDust(now);
      else dustAt = now;
      return;
    }
    acc += Math.min(50, now - last);
    last = now;
    while (acc >= STEP) {
      if (floating) drift();
      M.Engine.update(engine, STEP);
      clock += STEP;
      acc -= STEP;
    }
    if (dropping) {
      // Everything is inside the room: give it a beat to land, then cut gravity.
      // The timeout covers a pile that never fully clears the top edge.
      if (!landedAt && items.every((it) => it.body.bounds.min.y > 0)) landedAt = now;
      if ((landedAt && now - landedAt > 750) || now - dropAt > 6500) setFloat(true);
    }
    for (const it of items) {
      const p = it.body.position;
      // Anything that escapes the room is brought back in.
      if (p.y > floorY + 300 || p.y < -6000 || p.x < -200 || p.x > width + 200) {
        M.Body.setPosition(it.body, { x: width / 2 + rand(-80, 80), y: dropping ? -it.h : floorY / 2 });
        M.Body.setVelocity(it.body, { x: 0, y: 0 });
      }
      if (!it.body.isSleeping) {
        write(it);
        shed(it);
      }
    }
    drawDust(now);
    checkTower();
  }

  // ---- Pointer: grab, drag, throw ----

  const local = (e: PointerEvent) => {
    const r = root.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  function onDown(e: PointerEvent) {
    if (mode !== "mess" || paused || e.button !== 0 || drag) return;
    const el = (e.target as Element).closest<HTMLElement>("[data-obj]");
    const item = el && items.find((it) => it.el === el);
    if (!item) return;
    const p = local(e);
    const constraint = M.Constraint.create({
      pointA: p,
      bodyB: item.body,
      pointB: { x: p.x - item.body.position.x, y: p.y - item.body.position.y },
      stiffness: 0.12,
      damping: 0.15,
      length: 0,
    });
    M.Composite.add(world, constraint);
    M.Sleeping.set(item.body, false);
    item.el.classList.add("grabbed");
    try {
      item.el.setPointerCapture(e.pointerId);
    } catch {}
    drag = { item, constraint, id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: 0 };
  }

  function onMove(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.id) return;
    drag.constraint.pointA = local(e);
    drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy));
    M.Sleeping.set(drag.item.body, false);
  }

  function endDrag() {
    if (!drag) return;
    M.Composite.remove(world, drag.constraint);
    drag.item.el.classList.remove("grabbed");
    if (drag.moved > 6) {
      suppressClick = true;
      window.setTimeout(() => (suppressClick = false), 60);
      if (drag.item.isToken) watch = { item: drag.item, frames: 0 };
    }
    drag = null;
  }

  function onUp(e: PointerEvent) {
    if (drag && e.pointerId === drag.id) endDrag();
  }

  function onClick(e: MouseEvent) {
    if (!suppressClick) return;
    suppressClick = false;
    e.preventDefault();
    e.stopPropagation();
  }

  const onDragStart = (e: Event) => e.preventDefault();

  root.addEventListener("pointerdown", onDown);
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerup", onUp);
  root.addEventListener("pointercancel", onUp);
  root.addEventListener("click", onClick, true);
  root.addEventListener("dragstart", onDragStart);

  // ---- Resize: re-measure the tidy layout and rebuild ----

  let resizeTimer = 0;
  let lastWidth = root.clientWidth;
  let lastFloor = floorEl.offsetTop;
  const observer = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (destroyed) return;
      // offsetTop/clientWidth ignore transforms, so this only fires on real layout changes.
      if (root.clientWidth === lastWidth && floorEl.offsetTop === lastFloor) return;
      lastWidth = root.clientWidth;
      lastFloor = floorEl.offsetTop;
      const wasMess = mode === "mess";
      endDrag();
      build();
      if (wasMess) mess(true);
    }, 200);
  });
  observer.observe(root);

  // ---- Start ----

  build();
  if (opts.startMessy) mess(true);
  else setMode("tidy");
  root.dataset.ready = "true";
  raf = requestAnimationFrame(frame);

  return {
    mess: () => mode === "tidy" && mess(false),
    tidy: () => mode === "mess" && tidy(true),
    shake,
    float: (on) => mode === "mess" && (dropping || on !== floating) && setFloat(on),
    setGravity(x, y) {
      if (floating || dropping || mode !== "mess") return;
      engine.gravity.x = x;
      engine.gravity.y = y;
      for (const it of items) M.Sleeping.set(it.body, false);
    },
    pause(value) {
      paused = value;
      if (value) endDrag();
    },
    shove(v) {
      if (mode !== "mess" || paused || !floating || dropping) {
        shoved = 0;
        return;
      }
      // Track a capped share of the page's speed, so the pushes always sum to zero.
      const target = Math.max(-16, Math.min(16, v * 0.55));
      const push = target - shoved;
      if (Math.abs(push) < 0.02) return;
      shoved = target;
      for (const it of items) {
        if (drag?.item === it) continue;
        // Each block carries the push a little differently, so they spread out.
        const share = 0.75 + 0.25 * (Math.sin(it.phase) + 1);
        M.Body.setVelocity(it.body, { x: it.body.velocity.x, y: it.body.velocity.y + push * share });
      }
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(tidyTimer);
      window.clearTimeout(resizeTimer);
      observer.disconnect();
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("click", onClick, true);
      root.removeEventListener("dragstart", onDragStart);
      for (const el of els) {
        el.style.transform = "";
        el.style.transition = "";
      }
      M.Events.off(engine, "collisionStart", onCollide);
      ctx?.clearRect(0, 0, width, root.clientHeight);
      M.Engine.clear(engine);
    },
  };
}
