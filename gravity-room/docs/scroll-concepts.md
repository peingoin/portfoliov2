# Gravity Room: scroll concepts

> Written 2026-11-16 · Updated 2026-11-17 · Status: 1 (Supernova) and 5 (Planetfall) are built; 2, 3 and 4 are plans

Five candidate centrepieces for the scroll below the room. Each one takes over the whole screen.

## Switching scenes

Three scenes exist: `supernova`, `planetfall`, and the earlier `orbit` (planet with tools in orbit).

- **To change the default:** edit one word, `scene`, at the top of `content/site.ts`.
- **To compare without editing:** add `?scene=planetfall` (or `supernova`, `orbit`) to the address. Two tabs can show two scenes.
- **To test one:** `node scripts/shoot-gravity-scroll.mjs <base-url> <out-dir> <scene>` from the repo root.

How it is put together:

| File | Role |
|------|------|
| `lib/scenes/types.ts` | The contract a scene fulfils: `measure`, `pose` (where the ship is), `update` (what the stage looks like). |
| `lib/scenes/index.ts` | The list of scenes. |
| `lib/scenes/supernova.ts`, `planetfall.ts`, `orbit.ts` | One file per scene. Timings are named constants at the top of each. |
| `components/Orbit.tsx` | The stage markup all scenes share: heading, three titles, the pills, a canvas. |
| `components/ScrollStage.tsx` | Everything shared: ship, sparks, readout, letters. It asks the scene where the ship is while the stage is pinned. |
| `lib/sky.ts` | How a scene dims or pushes the stars. |
| `app/globals.css` | `html[data-scene="..."] .orbit { height }` sets how long each scene holds the screen. |

To add a scene: write a factory in `lib/scenes`, add it to `scenes` in `index.ts` and to `SceneName` in `types.ts`, and give it a height in `globals.css`.

## What changed from the plan when building

- **Supernova** is as planned. The tools are the debris; small sparks are extra. The reassembly lands as three columns on a wide screen and three rows on a phone.
- **Planetfall** was scoped to avoid a light palette. The sky goes from black to a deep twilight with a warm horizon and never gets bright, so text stays Starlight throughout. There is no drawn ground or landing legs: the dawn sky carries through Contact and the ship lands tail first there. The footer gets a dark backing so its text keeps contrast over the horizon glow.

The rest of this file is the original plan.

## What is already there

Every concept builds on the same pieces, so none of them starts from zero.

| Piece | File | What it gives us |
|-------|------|------------------|
| Scroll kinematics | `lib/scroll.ts` | One loop that hands out scroll position, speed and change of speed to anything that subscribes. |
| Pinned stage | `components/Orbit.tsx`, `.orbit` in `app/globals.css` | A tall section with a screen-high sticky stage inside it. Progress through the section drives the scene. |
| Ship | `components/ScrollStage.tsx` (`flight()`) | A function from scroll position to ship position, size and depth. Heading, flame and sparks follow from it. |
| Type with mass | `components/Lit.tsx`, units in `ScrollStage.tsx` | Per-letter springs, docking, a bow wave, and lighting from a point. |
| Starfield | `components/Starfield.tsx` | Stars held as data and redrawn on scroll, with depth and streaks. |
| Room physics | `lib/room.ts` (`shove`) | The floating blocks take a push from scroll. |
| Fallback | `html.motion` class | Everything is plain HTML first. Motion only switches on when reduced motion is off. |
| Checks | `scripts/shoot-gravity-scroll.mjs` | Playwright scroll run with screenshots and assertions, desktop and phone. |

Ground rules that apply to whichever is built:

- Scrubbed by scroll, both directions. Nothing plays on a timer.
- Content is real text in the page. The scene moves it; it does not replace it.
- Reduced motion gets a plain, complete version.
- Works at 390px wide.
- The new scene replaces the planet scene (`#orbit`) as the home of "What I use", unless noted.

## At a glance

| # | Concept | Biggest moment | Effort | Main risk |
|---|---------|----------------|--------|-----------|
| 1 | Supernova | A shockwave throws the whole page | Medium, 2 to 3 sessions | Making debris reassemble cleanly |
| 2 | Wormhole | The page scrolls inward, not down | Medium to large, 3 sessions | Readable text on tunnel walls |
| 3 | Black hole, mirror universe | Coming out the far side inverted | Large, 3 to 4 sessions | Two colour schemes to keep accessible |
| 4 | The page shatters | The ship breaks the screen | Large, 3 to 4 sessions | Showing live content on shards |
| 5 | Planetfall | One descent from orbit to dawn | Largest, 4 to 5 sessions | It restructures the whole page |

A session here means one working sitting like the ones that built the ship and the planet.

---

## 1. Supernova

**The idea.** You scroll toward a star until it fills the screen. It detonates. A ring of light travels outward and physically throws everything it reaches. The next section forms out of the debris. Scroll up and it all runs backwards into the star.

**Scroll timeline** (one pinned stage, about 400vh):

| Progress | What happens |
|----------|--------------|
| 0 to 25% | A small star in the centre grows. Letters on screen lean toward it. Stars drift inward. The ship circles once and backs off. |
| 25 to 35% | The star swells past the screen edges. The screen whites out for a moment at the peak. |
| 35 to 60% | Detonation. A shock ring expands from the centre. Each letter, pill and star is flung outward as the ring passes it, tumbling. Colour goes from white to Solar to Comet as the ring cools. |
| 60 to 90% | The debris slows, turns, and falls into place as the skills: three clusters for Code, Design and Video. |
| 90 to 100% | Everything is at rest and readable. A faint remnant glows where the star was. The stage unpins. |

**How it is built.**

- The star and ring are one canvas on the stage. The ring is a radius that is a function of progress.
- Debris is the existing unit system. Each unit gets a blast vector (direction from centre, distance by seeded random) and a time offset equal to when the ring reaches it. Position is a pure function of progress, so reversing is free.
- The skills pills start as the debris: their "thrown" position is the far end, their rest position is the list.
- `Starfield` gets one new input: a radial push from a point, scaled by progress.
- `room.shove` is not used here; the room is off screen by then.
- The ship's `flight()` gets a segment that circles, retreats to a corner during the blast, and rides the ring outward.

**Phone.** Same scene, fewer debris pieces, ring thicker relative to the screen. The three clusters stack vertically.

**Reduced motion.** The skills as three lists with a still, glowing star behind the heading.

**Risks.** The white-out must stay short and soft: no hard flash, peak brightness held for a scroll distance rather than a frame, to stay safe for photosensitive visitors. The reassembly has to read as order emerging, which needs care with easing and stagger.

**Why pick it.** The biggest single moment for the least new machinery, and scrubbing an explosion with the wheel is the most shareable trick of the five.

---

## 2. Wormhole

**The idea.** The page stops scrolling down and starts scrolling in. The stars wrap into a tunnel whose walls are rings of your skills and project names rushing past. The ship rides the centre. You burst out the far end into Contact.

**Scroll timeline** (pinned stage, about 500vh):

| Progress | What happens |
|----------|--------------|
| 0 to 10% | The starfield bends: stars slide toward a ring around the centre. A dark mouth opens. |
| 10 to 85% | Flight through the tunnel. Rings of text approach from the centre, grow, and pass the edges. Three stretches, one per discipline, each with its own colour: Plasma, Comet, Solar. Each ring is one word, repeated round the circle. |
| 85 to 95% | Light at the end grows. Rings thin out. |
| 95 to 100% | Exit flash, soft. The tunnel opens flat into the Contact section. |

**How it is built.**

- One canvas draws the tunnel. Each ring has a depth; scroll progress moves depth toward the viewer; radius on screen is `k / depth`. That one formula is the whole perspective.
- Text on rings is drawn with canvas text along a circle. Around 20 rings on screen at a time.
- Because canvas text is not readable by assistive tech, the real lists stay in the DOM, visually hidden, and one large readable label per stretch ("Code: TypeScript, React, Python, SQL") sits in normal HTML at the bottom of the stage.
- `Starfield` gets a mode that draws radial streaks from the centre instead of vertical ones.
- The ship sits centre screen, sways with scroll speed, and scales up slightly through the tunnel.

**Phone.** Works well as is: a tunnel suits a tall screen. Fewer rings, larger text.

**Reduced motion.** Three lists. No tunnel.

**Risks.** Text that flies past is hard to read, which is why each stretch needs the steady HTML label. Tunnel effects can cause motion discomfort, so speed is capped and the rings are thin lines of text rather than solid walls.

**Why pick it.** The strongest change of feeling: the page stops behaving like a page.

---

## 3. Black hole, mirror universe

**The idea.** Everything spirals into a black hole and stretches as it falls. Then the screen inverts. You come out in a negative version of the site: light sky, dark type, gravity upside down. Contact lives there.

**Scroll timeline** (pinned stage, about 450vh, then the rest of the page inverted):

| Progress | What happens |
|----------|--------------|
| 0 to 20% | A dark disc with a bright rim appears. Stars near it smear into arcs. |
| 20 to 65% | The skills orbit inward on a spiral. Each one is readable on its slow outer laps, then stretches toward the centre and is gone. The ship slingshots round once. |
| 65 to 75% | The disc grows to cover the screen. Full black. |
| 75 to 85% | A point of light opens from the centre and wipes outward. Behind it the palette is inverted. |
| 85 to 100% | Mirror side. The disc is now a white star shrinking behind you. The skills fall back out, upright, and settle as lists. |

**How it is built.**

- The disc and lensing are a canvas. Star lensing is a position remap in `Starfield`: push each star outward from the disc centre by an amount that falls off with distance.
- The spiral is the planet scene's orbit maths with a shrinking radius. Stretch is a scale along the line to the centre.
- The inversion is a second set of colour tokens under a `data-universe="mirror"` attribute on `<html>`, switched by the wipe. The wipe itself is a circular `clip-path` on a full-screen layer.
- On the mirror side the room's physics is not affected (it is far up the page), but the Contact section's letters hang from the top with their springs reversed.

**Phone.** Same. Spiral radius shrinks to fit.

**Reduced motion.** Lists, then a plain Contact section in the normal palette.

**Risks.** A second palette doubles the contrast checking. The light palette must be worked out properly, not just flipped. The black screen moment must not look like the page broke: the rim stays visible throughout.

**Why pick it.** It is the only one with a twist the visitor does not see coming.

---

## 4. The page shatters

**The idea.** About is a pane of glass. The ship flies straight at the screen, hits it, and the page cracks into shards that tumble away under real physics, each still showing its piece of the content. The next scene is already running behind the glass.

**Scroll timeline** (pinned stage, about 350vh):

| Progress | What happens |
|----------|--------------|
| 0 to 30% | About sits normally. The ship turns to face the viewer and grows, coming straight on. |
| 30 to 35% | Impact. Cracks spread from the hit point. |
| 35 to 80% | The pane breaks into about 30 shards. They rotate in 3D and fall away, revealing the skills scene behind. |
| 80 to 100% | The last shards leave. The scene behind is fully clear. |

**How it is built.**

- Shards are a Voronoi split of the screen, generated once from seeded points, denser near the impact.
- Each shard is a clone of the About content, clipped with `clip-path: polygon(...)` to its cell and transformed in 3D. Thirty clones of a small section is affordable; the clones are `aria-hidden` and the original stays for assistive tech.
- Motion is a function of progress, not live physics: each shard has a seeded fall path and spin. That keeps it reversible. `matter-js` is not needed here.
- Cracks are an SVG of the Voronoi edges, drawn outward from the impact by stroke length.
- The ship needs a front-on drawing for the approach, which is a second SVG.

**Phone.** About 14 shards. Same idea.

**Reduced motion.** About, then skills, no glass.

**Risks.** Thirty clipped 3D layers is the heaviest thing on the page; it needs testing on a real phone. Cloned content must never be reachable by keyboard or screen reader.

**Why pick it.** It breaks the fourth wall. Nothing else here makes the visitor flinch.

---

## 5. Planetfall

**The idea.** The whole page is one descent. You start in orbit, come down through re-entry with the ship glowing and the screen edges burning, punch through cloud layers that each carry a section, and land at dawn in Contact. The background goes from black space to full morning colour over the length of the page.

**Scroll timeline** (the whole page below the room):

| Stretch | Section | What happens |
|---------|---------|--------------|
| Orbit | About | As now. Black sky. A planet's curved edge rises at the bottom of the screen. |
| Re-entry | Short pinned beat | Sky goes deep blue to violet. Flames lick in from the screen edges. The ship glows Comet and shakes with scroll speed. Stars fade out. |
| Cloud deck 1 to 3 | Code, Design, Video | Three bands of cloud at different depths. Each parts as you pass to show that discipline's tools, then closes above you. Sky lightens each time. |
| Final approach | Short beat | Ground appears. Landing legs drop. The flame points down and kicks up dust. |
| Touchdown | Contact | Dawn. The sun clears the horizon behind the heading. |

**How it is built.**

- Sky colour is a set of CSS custom properties interpolated by overall page progress, so every section inherits it.
- Clouds are layered translucent shapes on a fixed canvas, moved by scroll at different rates.
- Re-entry flames are a canvas overlay on the screen edges, driven by scroll speed.
- `Starfield` fades its opacity with progress.
- The ship's `flight()` becomes mostly vertical, nose down, with a flip to tail down for landing.
- The brand's "dark sky only" rule has to change: text and tokens need a light-sky set for the bottom third of the page.

**Phone.** Suits a tall screen. Fewer cloud layers.

**Reduced motion.** Sections in order on a static gradient from night to dawn.

**Risks.** It is a redesign of the page, not an added scene, and it rewrites the colour rules in `brand-guidelines.md`. Text over a changing sky needs contrast checked at every stage.

**Why pick it.** The only one that makes the whole page a single story with a beginning and an end.

---

## Recommendation

Build **Supernova** first.

- It delivers the largest moment for the least new machinery: the letter and pill physics, the pinned stage and the starfield hooks already exist.
- It is fully reversible by construction, which is where scroll scenes usually go wrong.
- It does not touch the palette or the page structure, so it can be swapped in for the planet scene and swapped out again.

If the goal is the whole page as one story, build **Planetfall** instead and accept that it is roughly twice the work and changes the brand rules.

Two that combine well: **Supernova into Wormhole**. The blast opens the tunnel, and the tunnel carries you to Contact.

## Build order for whichever is chosen

1. Add the stage markup as plain HTML with its reduced-motion layout. Check it reads correctly with motion off.
2. Add the pinned stage and drive one value from progress. Confirm pin and unpin on desktop and phone.
3. Build the centre object (star, tunnel, disc, pane, sky).
4. Tie the content to it, as a pure function of progress.
5. Fit the ship's `flight()` to the scene.
6. Extend `scripts/shoot-gravity-scroll.mjs` with checks at the key progress points, then tune from screenshots.
7. Update `docs/brand-guidelines.md`.

## Decisions needed

- Which concept, or which pair.
- Whether the planet scene is replaced or kept alongside the new one.
- For Planetfall or the mirror universe only: whether a light palette is acceptable.
