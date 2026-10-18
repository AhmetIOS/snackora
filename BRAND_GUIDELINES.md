# Snackora – Brand guidelines

**SNACKORA — Deine Pause. Jederzeit.**

## 1. Brand concept

Snackora makes the small break easy: good snacks and cold drinks, available where people work, train or wait. The brand mixes a European consumer brand (warm, slightly playful) with a dependable regional B2B service (precise, honest, organised).

- **Personality:** modern, reliable, approachable, well organised, a little playful.
- **Core idea:** *das Fach*, the product compartment of a vending machine. Shelves, slot codes, keypad keys and the single product waiting in its compartment form the whole visual language.
- **Tone of voice:**
  - Business copy addresses readers formally (**Sie**) and is clear, concrete, confident without exaggeration.
  - The slogan alone speaks informally (**Du**), as a consumer-facing brand promise.
  - Never invent achievements, numbers, customers or guarantees. Prefer "je nach Standort und Vereinbarung" over promises.

## 2. Logo system

### Symbol: "Fach-S"

A squared **S** built from one constant stroke on an orthogonal grid with softened corners. Its two counters are vending **compartments**, and the upper one holds a single **product block**: the snack that is ready for your break.

The mark reads as *S · Fach · Snack* and stays recognisable without the word "Snackora": on a machine side panel, as a favicon, as a social avatar.

### Concepts evaluated

| Concept | Idea | Verdict |
| --- | --- | --- |
| **A – Fach-S** | Squared S whose counters are compartments, with one product block | **Chosen.** Distinctive, ownable, legible at 16 px, works in one colour, connects directly to the product |
| B – Ausgabe | Machine front with dispensing slot and dropping product | Rejected: reads like a phone or ATM; generic |
| C – Spirale | Three coil loops carrying a product | Rejected: reads as a chain or "ooo"; dissolves below 32 px |

### Wordmark

The custom lowercase letterforms use the same construction as the symbol: one stroke weight (21 u on a 104 u x-height), rectangular skeleton, rounded corners. The `s` mirrors the symbol, `k` is the only diagonal letter, and its arm meets the stem with a clean vertical cut. The letter spacing is set optically per pair.

The wordmark is real vector outlines, not typed text, so it prints and cuts cleanly.

### Lockups & files (`public/brand/`)

| File | Use |
| --- | --- |
| `snackora-logo.svg` | **Primary** horizontal lockup (symbol + wordmark) on light backgrounds |
| `snackora-logo-reversed.svg` | Horizontal on dark (forest/ink) backgrounds |
| `snackora-logo-tagline(-reversed).svg` | With slogan "Deine Pause. Jederzeit." (print, signage, machine panels) |
| `snackora-logo-stacked(-reversed).svg` | Compact / square formats |
| `snackora-wordmark(-reversed).svg` | Wordmark only (narrow spaces, when the symbol appears nearby) |
| `snackora-symbol(-reversed).svg` | Symbol on its key tile |
| `*-mono-black.svg` / `*-mono-white.svg` | Single-colour versions (stamps, engraving, foil, fax) |
| `snackora-symbol-192/512.png`, `snackora-avatar.png/.svg` | App icon / social avatar (800 px, circle-safe) |
| `src/app/favicon.ico`, `icon.svg`, `apple-icon.png` | Browser and home-screen icons |
| `src/app/opengraph-image.png` | Social sharing image 1200×630 |
| `snackora-automat-front.svg`, `snackora-automat-seite.svg`, `snackora-automat-konzept.png` | Vending-machine wrap concept |

All files are generated: geometry is in `scripts/brand/`, rebuilt with `npm run brand:assets`. Never edit the SVGs by hand.

### Rules

- **Clear space:** at least the height of the product block × 2 on all sides (≈ 25 % of the symbol height).
- **Minimum size:**
  - Horizontal logo: 96 px wide on screen, 25 mm in print.
  - Symbol: 16 px on screen, 6 mm in print.
  - Below this, use the symbol only.
- **Colourways:** primary (forest tile, cream S, lime block, forest wordmark) on light backgrounds; reversed (lime tile, ink S and block, cream wordmark) on dark backgrounds; mono where only one colour is possible.
- **Don't:**
  - stretch or rotate the logo
  - recolour the S or block outside the palette
  - put the logo on busy photos without a solid panel
  - outline the logo or add shadows or gradients
  - retype the wordmark in a font
  - separate the tagline from the logo in a different typeface

## 3. Colour

| Token | HEX | Role |
| --- | --- | --- |
| `ink` | `#0E1A14` | Text, darkest surfaces, footer |
| `forest` | `#12382A` | **Primary**: logo, primary buttons, dark sections |
| `forest-deep` | `#0B2419` | Deep sections, cards on forest |
| `moss` | `#2F5D47` | Secondary, subtle details |
| `lime` | `#C9F26B` | **Accent**: product block, CTAs on dark backgrounds, highlights. Use it as a fill or on dark surfaces; never as text on light backgrounds |
| `lime-soft` | `#E6F8B8` | Soft accent surface |
| `cream` | `#F5F1E6` | Page background |
| `paper` | `#FBF9F3` | Raised surfaces, inputs |
| `sand` | `#EBE5D5` | Alternate surface |
| `line` / `line-dark` | `#D9D2C0` / `#2A4A3C` | Borders on light / dark |
| `muted` / `muted-dark` | `#55615A` / `#A9BBB1` | Secondary text on light / dark |
| `paprika`, `mustard`, `sky`, `berry` | `#E2552D`, `#F1B734`, `#9CCBE6`, `#B2456E` | **Illustration only** (product packs), never for text |
| `error` / `success` | `#B3261E` / `#1F7A4A` | Feedback, with `-soft` backgrounds |

**Hover:** primary goes forest → ink; accent goes lime → `#D8F88F`.
**Focus:** a 2.5 px outline in forest on light surfaces and lime on dark surfaces, set by the `.surface-dark` class.

**Contrast** (WCAG AA ≥ 4.5:1, all checked):

| Pair | Ratio |
| --- | --- |
| muted on cream | 5.7 |
| muted-dark on forest | 6.4 |
| lime on forest | 10.1 |
| ink on lime | 13.9 |
| error on cream | 5.8 |

Rough proportions: cream/paper 60 %, forest/ink 30 %, lime ≤ 10 %. Lime is valuable because it is rare.

## 4. Typography

| Family | Use | Notes |
| --- | --- | --- |
| **Bricolage Grotesque** (variable, `opsz`) | Headlines, numbers in display sizes | Weight 600–650, tight tracking (−0.03 to −0.045 em), optical size follows the font size |
| **DM Sans** | Body text, UI | 17 px base, line-height 1.6 |
| **DM Mono** | Small uppercase labels ("slot labels"), reference numbers, step numbers | 12 px, +0.08 em tracking |

**Fluid scale** (`globals.css`):

| Class | Size range |
| --- | --- |
| `type-hero` | 48 → 120 px |
| `type-h1` | 36 → 76 px |
| `type-h2` | 30 → 56 px |
| `type-h3` | 21 → 26 px |
| `type-lead` | 18 → 21 px |

**German text:**
- Headlines use `text-wrap: balance`.
- Long compounds get soft hyphens where needed ("Pausen­versorgung").
- Automatic hyphenation is on for body text below 480 px.
- Keep headlines to two or three lines on mobile.

## 5. Graphic language

- **Product block:** the small rounded square from the symbol. Used as bullet, eyebrow marker, the full stop of the hero slogan, and map markers.
- **Slot labels:** mono uppercase eyebrows with a product block. Slot *codes* (A1, B3) appear only on shelf edges inside machine illustrations, where they explain themselves.
- **Rails:** a faint six-column vertical grid on brand surfaces, like shelf rails.
- **Keys:** buttons and step numbers look like keypad keys (firm 14 px radius, a subtle pressed bottom edge).
- **Compartments:** grids of panels separated by 1 px lines (`gap-px` on a line-coloured background), like shelves.

Avoid: gradients, glows, floating shapes, glassmorphism, emoji, pill-shaped everything.

## 6. Layout & spacing

- Container max 1312 px. Side padding 16 / 28 / 40 px (mobile / tablet / desktop). 12-column grid on desktop.
- Section rhythm: 80 px vertical padding on mobile, 112 px on desktop. Inner rhythm in multiples of 4 px (Tailwind scale).
- Vary compositions between sections: sticky heading + list, product line-up, uneven bento, process rail, colour-block section, map, accordion. Never stack three identical card grids.
- Radii: keys 14 px, panels 20 px. Nothing fully round except tiny dots.

## 7. Components & CTA system

| Variant | Look | Use |
| --- | --- | --- |
| **Primary** | Forest, cream text, lime key-arrow | The one main action per view: *Automatenlösung anfragen*, *Standort vorschlagen* |
| **Accent** | Lime, ink text, ink key-arrow | Primary action on dark sections |
| **Outline / Outline-dark** | Bordered | Secondary action next to a primary one |
| **Text link** | Forest/lime with an arrow-up-right icon | Navigational "more" links |

- CTA labels are verbs + object, ideally with *unverbindlich* where it reassures.
- Forms:
  - labels always visible above the fields; Pflichtfelder marked with `*`
  - hint text below the field, errors in red with an icon
  - radio options styled as keys
  - the privacy checkbox is never pre-checked

## 8. Imagery

**Current state:** bespoke vector illustrations of Snackora machines (snack, drink, combo) and the wrap concept, always captioned as *Illustration / Designkonzept*. No stock photography is used.

**Photography** can be added per slot in `src/content/media.ts`. It replaces the illustration and is captioned automatically. Rules:

1. **Best:** real photos of actual Snackora machines and locations (`symbolic: false`).
2. Licensed stock or AI-generated images must be `symbolic: true` (captioned *Symbolbild*). They must not show other brands' logos, legible fake text or real locations presented as Snackora sites. Never place the Snackora logo onto a photo of someone else's machine.
3. Style:
   - natural daylight, clean commercial interiors (office kitchen, workshop break room, gym lobby)
   - calm colours with deep green and warm off-white
   - one clear subject
   - no smiling-office-staff clichés, no robots, no neon
4. Technical: WebP/JPEG, ≥ 1600 px on the long side, < 300 KB, alt text describing the content in German.

**Prompts for AI-generated "Symbolbilder"** (check the results for malformed products and stray text before using them):

- *Hero:* "Editorial photograph of a modern, minimalist vending machine with a matte deep forest-green body and a glass front showing neatly arranged colourful snack packages without any readable text or logos, standing in a bright contemporary office break room with warm off-white walls and light oak floor, soft natural daylight from the side, shallow depth of field, calm premium European product photography, 4:5"
- *Snackautomat:* "Close-up product photograph of a vending machine glass front with spiral coils holding colourful unbranded snack bags and bars, deep green machine frame, soft reflections, no text, no logos, clean commercial interior, 4:5"
- *Getränkeautomat:* "Photograph of a modern refrigerated beverage vending machine with unbranded water bottles and plain coloured cans in tidy rows, deep green frame, cool soft light, industrial hall in the background softly blurred, no text, no logos, 4:5"
- *Standort:* "Wide photograph of a bright, empty corridor in a modern commercial building with a free wall space and a power outlet, warm off-white walls, natural light, architectural photography, no people, 16:9"

## 9. Brand on the machine (wrap concept)

- **Front:** brand panel at eye level (lime symbol tile + cream wordmark on forest), slogan band in lime above the plinth, keypad with one lime "OK" key.
- **Side:** full lime wrap with the oversized, cropped Fach-S in forest, the slogan running vertically, and the wordmark bottom right. Recognisable from a distance and without the word.
- Production: use the mono or primary SVGs (outlines, no fonts needed). Confirm the actual dimensions with the machine supplier before printing.

## 10. Responsive principles

- Mobile is composed, not shrunk:
  - the hero shows the headline first and a smaller machine below
  - machine cards switch to compact rows
  - secondary details (tag chips, differentiators) are hidden
  - tap targets are ≥ 44 px
- No horizontal scrolling at any width (tested at 320, 390, 430, 768, 1024, 1440 px).
- The navigation becomes a full-screen dialog grouped into *Automaten / Zusammenarbeit / Snackora*, with a persistent primary CTA.
- Motion is subtle and disabled under `prefers-reduced-motion`.
