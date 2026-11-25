# Type as Terrain: Brand Guidelines v1.0

> Last updated: 2026-11-13 · Status: Draft

There are no images. The name is the site. One variable typeface does every job, from a 12px label to letters wider than the screen, and the only decoration is the way those letters move.

## Colour

| Name | Hex | Usage |
|------|-----|-------|
| Paper | #F4F2ED | Page background, text on black |
| Black | #0A0A0A | Text, the inside of a letter |
| Acid | #D4FF00 | Numbers, current letter, hover, contact chips. Never for body text. |
| Mute | #6B6962 | Secondary text on paper |

Black on Paper: 17.6:1. Paper on Black: 17.6:1. Acid on Black: 15.4:1. Black on Acid: 15.4:1. Acid is never placed on Paper as text.

## Type

- **Roboto Flex**, the only typeface. Loaded with the `wdth`, `GRAD`, `opsz` and `slnt` axes.
- Name: weight 800, width 100, letter-spacing −0.04em, line-height 0.82. Width and grade shift towards the cursor (up to width 122, grade 90).
- Titles: weight 800–900, letter-spacing −0.035em to −0.045em.
- Body: weight 400–450, 17px to 24px.
- Labels: 12px, weight 600, uppercase, 0.1em tracking, width 110.

Optical sizing is on, so the same font sets small text and the name correctly.

## Voice

Confident and economical. Short declarative sentences. Numbers before adjectives.

| Context | Example |
|---------|---------|
| Claim | "The school timetable was a PDF. I made it open to the next lesson." |
| Hint | "Six letters. Six projects. Scroll to go inside the first letter." |
| Section | "Everything, on one screen." |
| Contact | "Write to me." |
| 404 | "Not a letter." |

Avoid: passionate, cutting-edge, seamless, leverage.

## Motion

- Dive: scale with `power2.in`, surface with `power2.out`. Scrubbed from scroll, 0.6s smoothing.
- Inside a letter the page is black. Content rises 48px as it fades in.
- The scroll settles inside a letter when it is within reach of one.
- Letters breathe: a 7s idle cycle of 4 width units and 30 grade, offset per letter.
- Under 720px or with reduced motion, there is no zoom: the name is a hero and each room is a screen you scroll to.

## Logo

None. The name is the mark. The tab icon is an acid "A" on black (`app/icon.svg`).
