# Gravity Room: Brand Guidelines v2.0

> Last updated: 2026-11-17 · Status: Draft

Everything on the page is a physical object, and the room is in orbit. The brand is a box of bright building blocks adrift in deep space: glowing colour on a dark sky, chunky type, and a voice that invites you to play.

## Colour

| Name | Hex | Usage |
|------|-----|-------|
| Void | #070817 | Page background, text on colour blocks |
| Deep | #11132B | Panels, dialogs, quiet buttons |
| Starlight | #F2F0FF | Text on dark, neutral blocks |
| Plasma | #9B8CFF | Code projects, primary buttons |
| Comet | #FF7A6B | Design projects |
| Solar | #FFC857 | Video projects, contact button |
| Aurora | #5EEAD4 | Navigation pills, labels, focus ring |
| Line | Starlight at 20% | Dividers and quiet borders |

Bright colours always carry Void text; dark surfaces always carry Starlight text. Every pairing meets WCAG AA. Colour is never the only signal: each card also names its discipline.

The sky is Void with three soft nebula clouds (Plasma top left, Aurora lower right, Comet upper right) and a field of small stars, a few tinted Plasma, Aurora or Solar.

## Type

- **Oxanium** (800 for display, 600 to 700 for labels and buttons): name blocks, titles, buttons.
- **Space Grotesk** (400, 500): body text.

## Shape

- Objects are night glass: a Void base lit from the upper left by their own colour, with a 2px rim and a soft glow of that colour. No pictures on the blocks.
- Picking an object up brightens its glow.
- Corner radius: 14px for blocks and cards, full for pills and circles.
- Circles are planets: shaded spheres, and the large one has a ring. The planet in "What I use" is the same sphere at full size, with faint cloud bands that turn as you scroll.
- Dividers are 1px Line. No heavy outlines.
- The ship is the one character and the one light below the room: a night-glass rocket with a Plasma hull, Comet fins, an Aurora window and a Solar to Comet flame. Display type near it warms to cream and grows a slab of depth on its far side (Plasma in About, Comet in Contact); type far from it cools to a dim lilac.

## Voice

Warm, funny, direct. Second person. Short. Space words only where they are also the plain word for the thing.

| Context | Example |
|---------|---------|
| Hint, floating | "Zero gravity. Go on, throw something." |
| Hint, gravity on | "Gravity's back. Try stacking a tower." |
| Docked | "All docked. Sensible choice." |
| Buttons | "Launch", "Dock", "Boost", "Gravity" |
| Contact | "Say hi" |
| Readout | "Speed 420 · 38% to landing", "Touchdown." |
| 404 | "This page drifted out of orbit." |

## Motion

- On arrival the blocks fall in under gravity, land, and then gravity cuts out and they float.
- Floating is slow: a gentle drift and spin that never quite stops. Blocks bounce softly off the edges and each other.
- Gravity is a switch. Turning it on drops everything; turning it off lifts it again. Tilt on a phone turns gravity on and points it where the phone leans.
- Dock is a spring back to the grid, about 700ms. Launch lifts everything straight into zero gravity.
- Stars twinkle slowly and a shooting star passes now and then. Nothing else animates unless you caused it.
- Fast blocks shed a short wake of stardust, and a hard knock strikes sparks at the point of contact. Both are off with reduced motion.
- Scrolling is a force, not a trigger. Nothing below the room plays on a timer; it all reads the scroll itself.
  - Speed stretches the stars into streaks, and near stars slide past faster than far ones.
  - A change of speed shoves the floating blocks: they try to stay put on screen while the room moves, so the deck sweeps them up.
  - Letters and pills have mass. They lag behind a moving page, each by its own amount, and bob back when it stops.
  - You fly the ship. Position along the page is position along its flight path: it lifts off from behind the deck, climbs past About, plays its part in the scene, and lands beside Contact, growing as it comes closer. Scroll back and it turns round and flies home nose first.
  - Speed is the throttle. The flame lengthens and the engine sheds sparks; at rest it idles.
  - The ship has a bow wave. Letters and pills it passes are pushed aside and spring back.
  - One set piece holds the middle of the page: "What I use" pins to the screen and a scene plays through it. Which scene is one setting in `content/site.ts`; all of them end with the tools readable as three labelled groups in Plasma, Comet and Solar.
    - Supernova: a star grows as you scroll in, swells past the screen, and blows. A ring of light travels out, cooling from cream through Solar to Comet. The tools are the debris: thrown with the ring, tumbling, then falling into place as three lists. Stars are blown outward and drift back. The peak brightness is held over a stretch of scroll, never flashed.
    - Planetfall: one fall from orbit. The hull glows Comet and shakes, fire licks in from the screen edges, and the stars go out. Three decks of cloud come up, one per discipline, each tinted its colour; each parts to show its tools and is left overhead. The sky turns from Void to a deep twilight with a warm horizon and stays that way for the landing. It never gets light enough to need dark text.
    - Orbit: a planet with every tool in orbit on three rings. Each discipline takes a turn at the front while the planet takes its colour.
  - A small readout top right gives speed and distance to landing, and says "Touchdown." at the end.
  - Headings and pills arrive loose and dock as their section comes in.
- With reduced motion on, the page starts docked, the sky is still, and nothing moves until asked.

## Logo

Two tilted blocks, Plasma "A" and Comet "C", crossed by an orbit ring with a small Solar moon. Made for dark backgrounds. File: `public/logo.svg`. Favicon: `app/icon.svg`.
