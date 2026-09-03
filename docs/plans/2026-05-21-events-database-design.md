# Stoa60 events database & past-events calendar — design

**Date:** 2026-05-21
**Status:** approved, ready for implementation plan

## Goal

Create a single source of truth for every stoa60 event (~290 entries, 2015–2026)
that powers:

1. The homepage calendar — currently upcoming-only, will become a
   scrollable list including all past events.
2. A future poster archive page with tag-based filtering (out of scope here;
   same data source).

## Inputs

- `data/Event Calendar stoa60.xlsx` — copied into the repo from
  `C:\Users\asmol\Desktop\Event Calendar stoa60.xlsx`. Used only to build
  the database; becomes obsolete after the initial generation. Keep
  gitignored.
- `src/assets/images/posters/` — ~291 posters across season folders
  (`2015-2016` … `2025-2026`) and venue folders (`BAR`, `BA2037`,
  `KARABOLAS`, `VOUTES`, `XENIA`, `GEORGIADIS`, `Upcoming`). Filenames
  follow `YYYY-MM-DD_<slug>.<ext>` — dates here are authoritative.

## Color → Location map

Derived by inspecting the Excel legend (rows 2–7) and reconciling with band
names and poster filenames.

```
(no fill)   → stoa60      (season folders 2015-2016 … 2025-2026)
FFA4C2F4    → karabolas   (legend swatch FF6D9EEB unused in data)
FFEAD1DC    → bar
FFD0E0E3    → ba2037      (legend label says "ΒΑ3027"; folder is BA2037 — folder wins)
FFB6D7A8    → voutes
FFE06666    → xenia
FFF1C232    → georgiadis  (legend swatch FFFFE599 unused in data)
FFFFD966    → georgiadis  (single stray cell, header-row color leak)
```

## Database — `src/data/events.ts`

```ts
export type Location =
  | 'stoa60'
  | 'karabolas'
  | 'bar'
  | 'ba2037'
  | 'voutes'
  | 'xenia'
  | 'georgiadis';

export interface Event {
  /** ISO "YYYY-MM-DD" — taken from poster filename (authoritative). */
  date: string;
  /** Bands parsed from column A (split on "," "&" "//" "/" "|"). */
  bands: string[];
  /** Original column-A text, preserved verbatim. Useful for festivals/parties. */
  rawTitle: string;
  location: Location;
  /** Path relative to src/assets/images/posters/. */
  poster: string;
  /** Empty for now; backfilled manually post-launch. */
  recordings?: { name: string; url: string }[];
  /** Empty for now; future archive filters. */
  tags?: string[];
}

export const events: Event[] = [ /* sorted newest → oldest */ ];
```

The file is generated; it carries a `// generated — do not edit by hand`
header. After the initial run the generator script remains in-tree so it
can be re-run if posters are added later, but the xlsx itself is treated as
a one-shot input.

## Generator — `scripts/build-events.mjs`

A standalone Node ESM script. Steps:

1. **Read** `data/Event Calendar stoa60.xlsx` using `exceljs` or equivalent.
2. **Index** every poster file by walking `src/assets/images/posters/`,
   producing `{[location]: Map<ISODate, filename>}`.
3. **For each Excel row 9..lastNonEmpty**:
   - Determine `location` from cell A fill color.
   - Parse column B: handle `DD/MM/YYYY` strings and Excel datetimes.
   - Look up a matching poster in the correct location bucket.
   - **No match?** Try the day/month-swapped date. If that matches, accept
     it and log to `tools/event-build/date-corrections.log`.
   - **Still no match?** Log to `tools/event-build/unmatched-events.log`
     and skip emitting that event.
   - Split column A on `,`, `&`, `//`, `/`, `|` (trim each piece, drop empties).
4. **Orphan posters** (no Excel row points at them) are still added to the
   database with `bands: []`, `rawTitle: ''`, so the archive stays complete,
   and listed in `tools/event-build/orphan-posters.log` for manual review.
5. **Emit** `src/data/events.ts` sorted newest-first.
6. **Print** summary: matched / auto-corrected / unmatched / orphans.

### Logs (`tools/event-build/`, gitignored)

- `date-corrections.log` — `[raw → corrected]  bands  poster`
- `unmatched-events.log` — Excel rows with no matching poster (both date
  interpretations, location, raw band text)
- `orphan-posters.log` — posters with no Excel entry

## Homepage calendar — `src/components/sections/home/Hero.astro`

- Replace the inline `entries: CalendarEntry[]` with
  `import { events } from "../../../data/events"`.
- Partition into `upcoming` (date ≥ today) and `past` (date < today).
- Render order: upcoming first (grouped by month, current style preserved),
  then past in reverse-chronological scroll grouped by year → month.
- Drop `MAX_ENTRIES` for past; if perf becomes an issue we lazy-render
  later. Existing fade-mask + scrollbar-none styling preserved.
- Each row: `date · bands (linked when recordings exist) · location label`.
- `monthLabels` map expands to all 12 months; i18n keys
  `cal.january … cal.december`.

## Out of scope

- Poster archive page (separate design; will consume the same `events.ts`).
- Recording-link backfill (manual; you'll edit `events.ts` directly later).
- Tag system UI (field exists, populated later).

## Open risks / known unknowns

- ~13 Excel rows have empty dates. These will all show up in the unmatched
  log for manual resolution.
- The `FFFFD966` single-cell case might be a header-color leak rather than
  a real Georgiadis event; the unmatched/orphan logs will surface it
  either way.
- Some band-name strings contain `//` as a venue separator (e.g.
  `"LOST BODIES, LOS TRE // KARAVOLAS"`). Splitting on `//` will produce a
  stray "KARAVOLAS" band; we'll detect and strip the trailing venue marker
  in a small post-processing step.

## Acceptance criteria

- `src/data/events.ts` exists, type-checks, contains every poster
  (matched or orphan) exactly once.
- All three logs exist under `tools/event-build/` with non-empty contents
  for whatever didn't auto-resolve.
- Homepage calendar renders upcoming + past with no console errors and no
  visual regression to the upcoming section.
