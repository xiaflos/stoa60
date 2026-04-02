# Gig Calendar Page — Design Doc
_2026-04-02_

## Overview

A new page at `/gig-calendar` listing upcoming gigs grouped by month. Data is hardcoded in the page file (Option A). Posters are imported from `src/assets/images/posters/Upcoming/` by filename.

## URL & Navigation

- Route: `/gig-calendar`
- Added to nav on all pages alongside Home, Posters, About
- Page title: `GIG CALENDAR`

## Data Structure

Hardcoded TypeScript array at the top of `src/pages/gig-calendar.astro`:

```ts
interface Gig {
  month: string;       // e.g. "Απρίλιος"
  date: string;        // e.g. "18"
  bands: string[];     // e.g. ["Axeon", "Veil Omega"]
  poster: string | null; // filename in Upcoming/, or null
  location?: string;   // defaults to "STOA 60" if omitted
}
```

Current gigs:
- Απρίλιος 18 — Axeon × Veil Omega — poster: 3.axeon_veil2.jpg
- Απρίλιος 25 — Junkheart × Ποντικια — poster: 4..junkpontfn16b11111.jpg
- Μάιος 2 — SOMA × Malhotra — poster: null
- Μάιος 9 — Tiffany × Thymics — poster: null
- Μάιος 16 — Καθαρός Χαλκός × Αρκούδες των αγωγών της πολυκατοικίας — poster: null
- Μάιος 23 — State of Loss — poster: null

## Visual Design

### Month heading
- Full-width row with `border-b border-base-900/20`
- Month name in Road Rage (`font-grunge`), large (`text-4xl md:text-5xl`), muted (`text-base-900/40`)

### Gig row (alternating poster side)
Each gig is a flex row with three areas: **date | bands | poster** (or **poster | date+bands** on even rows).

- **Alternation**: even-indexed rows (`index % 2 === 0`) → poster RIGHT; odd-indexed rows → poster LEFT, achieved via `flex-row-reverse`
- **Date**: Road Rage, `text-6xl md:text-8xl`, left-aligned, muted (`text-base-900/50`)
- **Bands**: Road Rage, stacked vertically; `×` separator between bands, slightly smaller and muted
- **Poster thumbnail**: ~120px wide portrait image, `object-contain`; if `null` shows a dashed border placeholder of the same size
- Rows separated by `border-b border-base-900/15`

### Mobile
- Single column stack: date + bands on top, poster below
- Poster always full-width (max ~280px, centered)
- No alternation on mobile

### Poster imports
Use `import.meta.glob` to eagerly import all images from `Upcoming/`, then match by filename at render time.

## Components Used
- `Layout.astro` — existing wrapper
- `Container variant="xl"` — existing container
- `LanguageToggle` — existing
- `Image` from `astro:assets` — for poster thumbnails
- No new components needed

## Files Changed
- `src/pages/gig-calendar.astro` — new file (page + data)
- All existing nav links updated to include "GIG CALENDAR"
