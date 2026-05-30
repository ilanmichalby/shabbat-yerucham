---
page: times
---
A Hebrew (RTL) "זמנים" (times) page for the **שבת בירוחם** website — a full schedule of
**candle-lighting (כניסת שבת / הדלקת נרות)** and **Shabbat end (צאת השבת / הבדלה)** times in
Yerucham (ירוחם) for the upcoming weeks. Where the home page is a calm "glance and know" hero,
this page is the complete, scannable reference: a clean RTL table of many Shabbatot, with the
current/nearest week clearly highlighted. Same serene evening-sky-into-night, warm candlelight feel.

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

**Consistency with existing pages (REQUIRED):**
- Reuse the SAME header as the home page: site name "שבת בירוחם" on the right, RTL nav (בית, זמנים, אודות) where "זמנים" is the active link. Keep the same fixed top bar + settings icon, and the same mobile bottom nav (בית / זמנים / אודות).
- Reuse the SAME footer ("שבת בירוחם", note that times are for Yerucham, placeholder legal links).
- Centered max-width container (~600px) like the home page.

**Page Structure:**
1. Header (RTL) — identical to index, with "זמנים" marked active.
2. Page title block: heading "זמני שבת בירוחם" with a short muted subtitle (e.g. "כניסת ויציאת שבת לשבועות הקרובים").
3. Main content: a clean RTL table/list of upcoming Shabbatot. Columns (RTL order): תאריך (Gregorian + short Hebrew date), פרשה, כניסת שבת (gold, tabular), צאת השבת (gold, tabular). Show ~8–10 rows.
   - Highlight the nearest/current week's row with a subtle gold halo / "השבת הקרובה" pill.
   - On mobile, each Shabbat can become a rounded card with the two big gold times stacked.
4. Optional secondary note: a small muted line explaining these are local Yerucham times (link "כיצד מחושב?" pointing to about.html).
5. Footer — identical to index.
