# Brand Guidelines v1.0

> Last updated: 2026-11-12
> Status: Draft
> Theme: Night survey

The portfolio is a survey map of the work. It borrows the look and language of a topographic map sheet, read at night: a dark sheet, pale luminous contour lines, and one orange route.

## Quick Reference

| Element | Value |
|---------|-------|
| Primary Color | #FF5B1F |
| Secondary Color | #A9B8AE |
| Accent Color | #2F8F83 |
| Primary Font | Archivo |
| Voice | Factual, Brief, First person |

---

## 1. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Signal | #FF5B1F | rgb(255,91,31) | The trail, summit markers, hover, links |
| Signal Dark | #C2410C | rgb(194,65,12) | Pressed states |

Signal is the only strong colour. It always means "the route" or "you can click this".

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Contour Index | #A9B8AE | rgb(169,184,174) | Every fifth contour line |
| Contour Dark | #4E5E56 | rgb(78,94,86) | Regular contour lines. Lines only, never text. |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Range Code | #2F8F83 | rgb(47,143,131) | Faint wash and key for the code range |
| Range Design | #6C78E0 | rgb(108,120,224) | Faint wash and key for the design range |
| Range Video | #C08A3E | rgb(192,138,62) | Faint wash and key for the video range |

### Neutral Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Sheet | #0E1211 | rgb(14,18,17) | Page background |
| Sheet Raised | #161C1A | rgb(22,28,26) | Cards, legend, title block |
| Line | #26302C | rgb(38,48,44) | Borders, dividers, graticule |
| Ink | #E8E4D8 | rgb(232,228,216) | Headings, body text |
| Ink Muted | #9AA59E | rgb(154,165,158) | Captions, secondary text |

### Accessibility

- Ink on Sheet: 14.6:1 (AAA)
- Ink Muted on Sheet: 7.2:1 (AAA)
- Signal on Sheet: 6.1:1 (AA at any size)
- Contour Dark on Sheet: 2.7:1, so it is used for lines only

---

## 2. Typography

### Font Stack

```css
--font-display: 'Archivo', system-ui, sans-serif;      /* titles and UI, condensed widths */
--font-mono: 'IBM Plex Mono', ui-monospace, monospace;  /* labels, coordinates, data */
--font-serif: 'Newsreader', Georgia, serif;             /* italic only: range names */
```

Italic serif for range names follows the cartographic convention for natural features.

### Type Scale

| Element | Size (Desktop) | Size (Mobile) | Weight | Line Height |
|---------|----------------|---------------|--------|-------------|
| Display | 72px | 44px | 600, width 68 | 0.95 |
| H1 | 44px | 32px | 600, width 72 | 1.0 |
| H2 | 28px | 24px | 600, width 80 | 1.15 |
| Body | 17px | 16px | 400 | 1.6 |
| Label (mono) | 11px | 11px | 500, uppercase, 0.08em | 1.4 |
| Data (mono) | 13px | 13px | 400 | 1.4 |

---

## 3. Logo Usage

The mark is three nested contour rings in the shape of a peak seen from above. The rings read as an "A", and the open outer ring reads as a "C". A Signal dot marks the summit.

| Variant | File | Use Case |
|---------|------|----------|
| Mark | public/logo-mark.svg | Title block, favicon |
| Icon | app/icon.svg | Browser tab |

- Minimum size: 20px.
- Clear space: one ring width on every side.
- Do not recolour: rings are Ink, the summit is Signal.

---

## 4. Voice & Tone

Expedition log. Short, factual, first person.

| Trait | We Are | We Are Not |
|-------|--------|------------|
| Factual | Specific numbers and dates | Vague or inflated |
| Brief | One idea per sentence | Wordy |
| First person | "I built", "I learned" | "We", passive voice |
| Dry | Understated | Jokey or hyped |

### Tone by Context

| Context | Example |
|---------|---------|
| Summit label | "Wayfinder. 2025. 11 wk." |
| Case study opening | "Surveyed 2025. 11 weeks. Solo." |
| Empty or error state | "Off the map. This sheet does not exist." |
| Contact | "Base camp. Write to me here." |

### Map vocabulary

| Site term | Plain meaning |
|-----------|---------------|
| Summit | A project |
| Range | A discipline |
| Elevation | Weeks of work |
| Trail | The order projects are shown in |
| Gazetteer | The plain list of all projects |
| Base camp | About and contact |

Every map term appears next to a plain label or an explanation in the legend, so nobody has to guess.

### Prohibited Terms

| Avoid | Reason |
|-------|--------|
| Passionate | Overused |
| Cutting-edge | Vague claim |
| Seamless | Overused |
| Leverage | Use "use" |

---

## 5. Imagery Guidelines

- Project images sit on Sheet Raised with a 1px Line border and no rounded corners above 2px.
- Diagrams and charts use the palette above. Signal marks the one thing to look at.
- Icons: outlined, 1.5px stroke, square caps. Summit markers are solid triangles.

---

## 6. Design Components

### Buttons

| Type | Background | Text | Border Radius |
|------|------------|------|---------------|
| Primary | #FF5B1F | #0E1211 | 2px |
| Secondary | Transparent, 1px Line border | #E8E4D8 | 2px |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Compact elements |
| md | 16px | Standard spacing |
| lg | 24px | Sheet margin |
| xl | 40px | Section spacing |
| 2xl | 72px | Section dividers |

### Motion

| Token | Value | Usage |
|-------|-------|-------|
| ease-survey | cubic-bezier(0.22, 1, 0.36, 1) | Everything |
| fast | 150ms | Hover, focus |
| base | 400ms | Cards, panels |
| slow | 900ms | Map to page transition |

Lines draw in, the camera glides and settles, nothing bounces. All motion is removed under `prefers-reduced-motion`.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-11-12 | Initial guidelines, night survey theme |
