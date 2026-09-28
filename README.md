# punch card studio

> **experimental** — none of this has been tested on an actual punch
> card knitting machine or IBM card equipment yet. the formats follow
> documented specs, but real-world output is unverified. i'd love to
> change that, so if you have a machine and try it, please open an
> issue and tell me how it went.

two real punch card formats, one shared grid underneath:

- **knitting machine, 24-stitch** — the punch card system shared across
  brother, silver reed/studio, toyota, and knitking machines (largely
  interchangeable between brands, lace cards being the exception).
  24 columns, adjustable row count, freeform bitmap
- **IBM 80-column hollerith** — the card format IBM used for data
  processing (payroll, timesheets, census data) before it was ever
  used for knitting. fixed 80 columns × 12 rows (zone rows 12/11/0,
  digit rows 1–9), character-encoded rather than freeform

three ways to fill the grid, available for either format:

- **image** — dither a photo into it (knitting format only; hollerith
  is character-encoded, not photographic)
- **draw** — click or drag directly on the grid, hand-authored
- **generate** — stripes, checkerboard, noise, or an elementary
  cellular automaton (wolfram rule 0–255), wrapped around the card's
  own column count as its boundary condition

plus, specific to the hollerith format:

- **text** — type a line, it encodes into real Hollerith punches:
  digits get one row punch, letters get a zone punch (12 for A–I, 11
  for J–R, 0 for S–Z) plus a digit punch. verified against the
  documented reference before shipping. covers uppercase letters,
  digits, and spaces — not the full 029 punctuation set.

either format can be rendered **rotated** — the whole grid transposed,
including which physical pitch governs which axis, so a tall narrow
strip becomes a wide short one and vice versa.

## making a real, usable punch card

the knitting format exports at true physical scale (millimeters),
not arbitrary pixels — necessary if you actually want to print and
punch it, or cut it on a craft cutter.

what's genuinely confirmed: standard-gauge needle pitch is 4.5mm, and
that's the one number that really matters, since each card column has
to line up with a needle position. what's **not** independently
confirmed: row (vertical) pitch, and the reader offset / minimum-rows-
to-roll facts, which actually differ by machine brand (brother/
knitking: 7-row offset; silver reed/studio: 5-row offset; roll minimums
commonly 30–36 depending on model). rather than hardcode one brand's
numbers as universal, the "machine settings" panel exposes all four as
adjustable fields with documented defaults, plus a **calibration
swatch** — a small fixed grid you print at 100% and hold against your
own card or needle bed to confirm the pitch before committing to a
full pattern.

to print: open the downloaded SVG and print at 100%/actual size — not
"fit to page." for real precision, importing the SVG into craft-cutter
software (silhouette studio, cricut design space) and cutting will be
far more reliable than hand-punching from a printout; this is a solved
approach other makers have used successfully on real Brother machines.

## look

bold and vibrant, but still soft: a cream base with four function
colors pushed bright (blush for primary actions, matcha for
input controls, wisteria for output/preview, butter for connective
accents), rounded pill shapes, and dashed "running stitch" borders.

- **type** — pixelify sans for display, ibm plex sans for body text,
  ibm plex mono for labels and readouts
- **hero card** — a real 80-column hollerith card with "PUNCH CARD
  STUDIO" punched into it, drawn as an SVG using the same encoder as
  the text tab
- **favicon** — a tiny version of the same card
- **responsive** — header, hero, and workspace share one 1200px column;
  the hero card drops below the copy under 900px and the workspace
  stacks into one column under 760px, with no horizontal scroll down
  to phone width

## running it

```
npm install
npm run dev
```

then open http://localhost:3000

## structure

- `lib/cardformats.ts` — hardware facts for both formats: confirmed
  ones (24 columns, 4.5mm needle pitch, IBM's 80×12 layout) kept
  separate from brand-variable defaults (reader offset, roll minimum,
  row pitch) that the machine settings panel lets you override
- `lib/punchcard.ts` — generic grid utilities and the SVG renderer, at
  true millimeter scale rather than arbitrary pixels, plus the
  calibration swatch generator
- `lib/dither.ts` — binary dithering, carried over from pixel picnic
- `lib/generative.ts` — stripes/checkerboard/noise/automaton generators
- `lib/hollerith.ts` — real IBM card character encoding
- `components/Workspace.tsx` — shared state (format, grid, orientation,
  machine settings) and mode switching
- `components/MachineSettings.tsx` — adjustable pitch/offset/roll-
  minimum, and the calibration swatch download
- `components/ImageMode.tsx`, `EditorMode.tsx`, `GenerativeMode.tsx`,
  `TextMode.tsx` — the four input modes
- `components/PunchCardPreview.tsx` — shared export panel, with
  explicit print-at-100% instructions
- `components/HeroCard.tsx` — the punched hollerith card in the hero
- `app/layout.tsx` — fonts and metadata
- `app/globals.css` — color tokens, hero and workspace layout, and
  responsive breakpoints
- `app/icon.svg` — favicon, picked up automatically by next.js

## roadmap (not yet built)

- **invert / mirror / shift** — basic grid transforms
- **saved pattern library** — persist a few grids locally
- **more automaton rules as presets** — a small gallery of named rules
  instead of typing a number blind
- **full 029 punctuation/symbol set** — the hollerith encoder currently
  only covers letters, digits, and spaces
- **confirmed row pitch** — if a real spec or careful physical
  measurement ever nails down the row pitch independent of the
  calibration swatch, that default can be tightened
- **more card formats** — the format system is designed to take more
  than two
