# Portfolio Concepts

Draft directions for the portfolio site. Status: awaiting a pick.

Shortlisted: **2, 4, 10, 7** (expanded below).

## Contents

- [All 10 ideas](#all-10-ideas)
- [Expanded: 2. Living Topography](#2-living-topography)
- [Expanded: 4. Type as Terrain](#4-type-as-terrain)
- [Expanded: 10. Gravity Room](#10-gravity-room)
- [Expanded: 7. The Folded Sheet](#7-the-folded-sheet)
- [How the shortlist compares](#how-the-shortlist-compares)
- [Recommendation and combinations](#recommendation-and-combinations)
- [Open questions](#open-questions)

---

## All 10 ideas

| # | Name | Concept | Look | Main cost |
|---|------|---------|------|-----------|
| 1 | **The Darkroom** | The page starts as blank photo paper. Your cursor or scroll "develops" content, and projects emerge like prints in a chemical bath, hung on a line to dry. | Red safelight on near-black, warm paper whites, grainy serif | Needs strong project imagery |
| 2 | **Living Topography** | Your career is a 3D terrain map. Projects are peaks whose height reflects effort, and you fly between them along contour lines that morph into each case study. | Cartographic ink lines on bone, one signal orange, monospace labels | WebGL build, needs a simple fallback for phones |
| 3 | **The Specimen Cabinet** | A natural-history museum drawer. Each project is a pinned, labelled specimen that you pull out and examine under a magnifier, with handwritten field notes. | Cream, oxblood, brass; engraved serif with typewriter captions | Heavy on custom illustration |
| 4 | **Type as Terrain** | No images at all. Your name fills the viewport as giant variable type, and you zoom into the letters, where each letterform holds a project. | Black and white with one acid colour, a single variable font | Projects are shown through words and motion only |
| 5 | **The Night Train** | A horizontal journey seen through a train window. Projects are stations, and the landscape parallaxes and shifts from dusk to dawn as you travel. | Deep indigo to peach gradients, soft lamplight, rounded grotesque | Horizontal scroll needs careful handling on mobile |
| 6 | **Signal / Noise** | The site opens as static. Tuning a dial (scroll or drag) locks onto "frequencies" where each project resolves out of noise, with optional sound. | CRT phosphor green and amber on charcoal, shader distortion | Novelty can slow down a recruiter in a hurry |
| 7 | **The Folded Sheet** | The whole site is one sheet of paper that unfolds like origami. Each crease opens a new panel, and it folds back into a business card at the end. | Paper texture, real shadows, one riso-print spot colour | Hardest animation to make feel physically right |
| 8 | **Live Studio** | The site shows what you are doing now: current time and weather where you are, latest commit, current track. Its palette follows your local daylight. | Calm editorial grid, colours shift from morning to night | Needs live data sources and looks thin if they go stale |
| 9 | **The Index** | An editorial "book of you": a table of contents, numbered plates, footnotes and marginalia that react to hover, with page-turn transitions. | Swiss grid, off-white, black, vermilion; oversized numerals | Least flashy, relies on typographic polish |
| 10 | **Gravity Room** | Everything on the page is a physical object. Project cards, your name and the nav can be thrown, stacked and collided, then snap into a clean layout on request. | Bright flat colour blocks, chunky geometric sans, playful | Reads as playful, which may not suit a formal audience |

---

## 2. Living Topography

### Journey

1. **Arrival:** a blank bone-coloured sheet. Contour lines draw themselves in until a terrain appears, and your name is set like a map title in the corner with coordinates and a scale bar.
2. **Overview:** the camera sits high above a 3D landscape. Each peak is a project, labelled like a summit (name, year, "elevation"). Height encodes something real, such as duration or scale, and a legend explains it.
3. **Travel:** scrolling flies the camera along a marked trail from peak to peak. Clicking any summit jumps straight there.
4. **Case study:** on arrival, the contour lines of that peak flatten and reflow into the layout of the case study page, so the map becomes the page.
5. **About and contact:** a "base camp" at the foot of the range, with contact details set as a map legend.

### Brand

- **Voice:** precise, expedition-log tone ("Surveyed 2024. 14 weeks. Team of 3.")
- **Palette:** bone `#EDE8DC`, ink `#1B1F1D`, contour grey-green `#8A9A8E`, signal orange `#FF5B1F`
- **Type:** a narrow grotesque for titles, IBM Plex Mono for labels and coordinates
- **Logo:** your initials drawn as a contour ring

### Build

Three.js with a shader-drawn contour terrain generated from your project data, plus scroll-driven camera paths. Phones and reduced-motion users get a flat 2D contour map with the same content.

### Risk

The heaviest build of the four, and the one where performance tuning matters most. With fewer than about five projects the range looks sparse.

---

## 4. Type as Terrain

### Journey

1. **Arrival:** your name fills the whole viewport in black letters, cropped by the screen edges. The letters breathe slightly, with weight and width shifting as the cursor moves.
2. **Dive:** scrolling zooms into the first letter until its edge becomes a horizon and its interior a room. Inside is one project, told entirely in type: a huge title, a one-line claim, and key numbers.
3. **Between letters:** zooming out of one letter and into the next is the navigation. A small letter-strip at the bottom shows where you are in your name.
4. **Detail:** each project opens into a long-form typographic page. Images are allowed here, but appear only when requested, masked inside letter shapes.
5. **End:** the last letter zooms out to your full name again, now with contact details set in the counters of the letters.

### Brand

- **Voice:** confident and economical, with short declarative sentences
- **Palette:** paper white `#F4F2ED`, true black `#0A0A0A`, one acid accent `#D4FF00`
- **Type:** one variable font with many axes (Roboto Flex is a strong free option) used for everything, at sizes from 12px to 100vw
- **Logo:** none needed, since the name is the site

### Build

SVG and CSS transforms with GSAP for the zoom, with no 3D engine. It is light, fast and accessible because the content is real text. On phones the zoom becomes vertical snap sections.

### Risk

It depends on your name having enough letters for your projects (or mapping several projects per letter), and on the copy being good, because there is nothing else to look at.

---

## 10. Gravity Room

### Journey

1. **Arrival:** your name drops in letter by letter and lands in a pile, followed by project cards, a few shapes and the nav buttons, which all bounce and settle.
2. **Play:** everything can be grabbed, thrown and stacked. Tilting a phone shifts gravity.
3. **Tidy:** a "Tidy up" button springs every object into a clean, conventional grid. This is the mode for someone in a hurry, and a "Mess it up" button reverses it.
4. **Project:** dropping a card into a marked zone, or just clicking it, expands it to a full case study while the other objects are pushed to the edges.
5. **Extras:** small hidden behaviours, such as stacking all the cards into a tower to reveal a secret, or shaking the window to reset.

### Brand

- **Voice:** warm, funny and direct ("Go on, throw something.")
- **Palette:** cream `#FFF6E5`, cobalt `#2B4BFF`, tomato `#FF4A3D`, mustard `#FFC629`, mint `#7DE0B5`, ink `#151515`
- **Type:** a chunky geometric display face (Bricolage Grotesque or similar) with a plain sans for body text
- **Logo:** your initials as two blocks leaning on each other

### Build

Matter.js for 2D physics with DOM elements synced to the bodies, so the text stays selectable and readable by screen readers. The tidy layout is the default for reduced-motion and keyboard users.

### Risk

Physics-based portfolios do exist, so the originality has to come from the tidy/mess mechanic and the extras. The playful tone may not suit a corporate audience.

---

## 7. The Folded Sheet

### Journey

1. **Arrival:** a small folded square of paper sits in the centre of a desk-coloured background with your name on the top face.
2. **First unfold:** scrolling opens it once, into a spread with your introduction. The fold has real thickness, a shadow and a slight overshoot.
3. **Further unfolds:** each scroll step opens another crease, and the sheet grows in a new direction (right, down, diagonal). Each panel is a project. The printing on the reverse shows through faintly during the fold.
4. **Full sheet:** fully open, the site is one large poster showing everything at once, which you can pan and zoom like a map. Clicking a panel lifts it off the sheet as a case study.
5. **End:** the sheet folds itself back up into a business card with your contact details, which can be saved as an image.

### Brand

- **Voice:** quiet and crafted, in the first person
- **Palette:** paper `#F7F3EA`, desk charcoal `#2A2826`, riso blue `#2F4FE0`, riso pink `#FF6B8B` used sparingly as overprint
- **Type:** Newsreader for text with a compact grotesque for labels, and slight misregistration on headings
- **Logo:** a square with one folded corner

### Build

CSS 3D transforms driven by GSAP ScrollTrigger, with shadows and paper grain layered on top. No WebGL is needed. On phones it becomes an accordion-style vertical unfold.

### Risk

The fold has to feel physically right, and that takes many rounds of tuning. The fold pattern also fixes the number of panels, so adding a project later means redesigning the sheet.

---

## How the shortlist compares

| | Originality | Build difficulty | Speed for a busy visitor | Works without images |
|---|---|---|---|---|
| 2. Living Topography | Highest | Highest | Medium | Yes |
| 4. Type as Terrain | High | Low to medium | High | Yes |
| 10. Gravity Room | Medium | Medium | High (with Tidy) | Partly |
| 7. The Folded Sheet | High | Medium to high | Medium | Partly |

## Recommendation and combinations

**Recommended:** #4 Type as Terrain as the core, because it is the most distinctive result for the least technical risk and loads fast. If more spectacle is wanted, #2 is the one to pick, accepting the longer build.

Combinations that work:

- **4 + 10:** the letters of your name are physical objects that fall and settle, and you then zoom into them.
- **2 + 4:** the contour terrain is made from the shapes of your name's letters.

## Open questions

1. Which idea, or combination, is approved?
2. What do you do, and who is the site for (recruiters, clients, peers)?
3. How many projects will be shown, and are there images or video for them?
