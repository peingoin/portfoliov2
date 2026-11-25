# The Folded Sheet: Brand Guidelines v1.0

> Last updated: 2026-11-13 · Status: Draft

The whole site is one sheet of paper on a dark desk, printed in two riso inks. The brand is quiet and handmade: paper grain, a blue that is slightly out of register with a pink, and a voice that speaks in the first person.

## Colour

| Name | Hex | Usage |
|------|-----|-------|
| Paper | #F7F3EA | The sheet, flat sections, dialog |
| Desk | #2A2826 | Page background behind the sheet |
| Riso Blue | #2F4FE0 | Headings, numbers, links, buttons, the logo |
| Riso Pink | #FF6B8B | The misregistered second pass under headings; bullets; selection. Never body text. |
| Ink | #1C1A17 | Body text |
| Mute | #6F6A60 | Labels, secondary text |

Ink on Paper: 15.2:1. Blue on Paper: 6.1:1. Paper on Desk: 12.6:1. Mute on Paper: 4.9:1.

## Type

- **Newsreader** for everything that reads: names, headings (weight 500), body (400), italics for roles and hints. Optical sizing on.
- **Archivo** at width 78–88 for labels, buttons, numbers and metadata: 11–14px, weight 600, uppercase with 0.09em tracking.

Headings carry a riso misregistration: `text-shadow: 0.05em 0.035em 0 pink` under blue text.

## Voice

Quiet and crafted, first person, present tense.

| Context | Example |
|---------|---------|
| Cover | "Scroll to unfold" |
| Intro | "Hello. I'm Austin." |
| Panel link | "Lift the panel" |
| Open sheet | "Fully open. Click a panel to lift it off the sheet." |
| Card | "Folded into a card. Take it with you." |
| 404 | "Blank panel." |

## The fold

A 3 x 3 grid of 360px square panels, folded like a map. Closing: the left column goes behind the centre, the right column folds over the front, then the bottom row and the top row fold behind. Closed, the packet shows the back of the right-hand middle panel (the cover). Turned over, its underside is the back of the top-right panel (the business card).

Unfold order: right column, left column, bottom row, top row, so every step exposes printed fronts only. Each step is one scroll unit with a `back.out(1.15)` overshoot. Faces darken as they stand edge-on and the reverse printing shows during the turn. The desk shadow follows the visible box and stays under the sheet when it is turned over.

Under 760px or with reduced motion the panels stack in reading order and each one tips open as it arrives.

## Logo

A square with one folded corner, in Riso Blue. Files: `public/logo.svg`, `app/icon.svg`.
