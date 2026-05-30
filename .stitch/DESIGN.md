# DESIGN.md — Shabbat Times (Yerucham)

> Visual design system for the site. **Section 6** is the block to copy verbatim into
> every Stitch generation prompt (the baton). Keep this file the single source of truth.

## 1. Brand Mood

Serene, warm, reverent. An evening sky deepening from dusk indigo to night, lit by the
soft gold of Shabbat candles. Quiet, uncluttered, generous whitespace. Not corporate,
not playful — calm and a little sacred.

## 2. Color

| Token | Hex | Use |
|-------|-----|-----|
| `--bg` deep night | `#0E1530` | Page background (dark mode primary) |
| `--surface` dusk indigo | `#1B2347` | Cards, panels |
| `--candle` warm gold | `#E8B65A` | Primary accent — candle glow, key numbers, CTAs |
| `--candle-soft` | `#F3D9A0` | Hover / soft highlights |
| `--text` parchment | `#F5F1E6` | Primary text on dark |
| `--text-muted` | `#A9B0CC` | Secondary text, labels |
| `--line` | `#2C3566` | Hairline borders, dividers |

Color mode: **DARK**. Accent / custom color: **#E8B65A** (warm candle gold). Saturation: low–medium (calm).

## 3. Typography

- Hebrew display + body: **Heebo** (or **Assistant** / **Rubik** as fallback) — clean, modern Hebrew.
- The two times (כניסת / יציאת שבת) are the visual heroes: very large, gold, tabular numerals.
- Hebrew labels in medium weight; muted secondary text smaller.
- Strong hierarchy, lots of breathing room.

## 4. Shape & Spacing

- Roundness: **generous** (rounded-2xl, ~16px radii on cards).
- Soft shadows / subtle candle-glow halo around the primary time cards.
- 8px spacing scale; airy padding inside cards.

## 5. Layout & Direction

- **RTL (Hebrew)** is the default direction — `dir="rtl"`, `lang="he"`.
- Mobile-first, responsive up to a centered max-width container on desktop.
- Hero centered: city name "ירוחם" + this week's date, then the two big times side-by-side (stack on mobile).

---

## 6. Design System Notes for Stitch Generation (COPY THIS BLOCK INTO PROMPTS)

**DESIGN SYSTEM (REQUIRED):**
- Language & direction: Hebrew, **RTL** layout (`dir="rtl"`, `lang="he"`). All copy in Hebrew.
- Mood: serene, warm, reverent — an evening sky deepening to night, lit by soft Shabbat candlelight. Calm, uncluttered, generous whitespace.
- Color mode: **DARK**. Background deep night indigo `#0E1530`; card surfaces dusk indigo `#1B2347`; hairlines `#2C3566`.
- Accent: warm candle gold `#E8B65A` (with soft highlight `#F3D9A0`) — used for the key time numbers, glow halos, and primary buttons.
- Text: parchment `#F5F1E6` primary, muted `#A9B0CC` secondary.
- Typography: Hebrew sans — **Heebo** (fallback Assistant/Rubik). The candle-lighting and Havdalah times are the visual heroes: very large, gold, tabular numerals, strong hierarchy.
- Shape: generously rounded cards (rounded-2xl), soft shadows, a subtle warm candle-glow halo around the primary time cards.
- Spacing: airy, 8px scale, mobile-first and responsive with a centered max-width container on desktop.
- Imagery/motif: subtle candle flame / dusk-to-night gradient motif; no stock-photo clutter.
