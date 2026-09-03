# STOA60

Website for **STOA60**, a self-managed underground music venue in Heraklion, Crete. Running since 2015 — hundreds of gigs and counting.

## What it does
- **Next gig** — hero section showing the upcoming show poster
- **Gig mail alert** — newsletter signup, handled by Netlify Forms
- **About** — the venue's story and values
- **Poster archive** — 292 posters across 11 seasons (2015–2026), with lightbox viewer and band search
- **Greek / English** — runtime language toggle, Greek by default

## Tech stack
- [Astro](https://astro.build) 6.x (static site)
- Tailwind CSS v4
- TypeScript
- Deployed on Netlify

## Development

```bash
npm install          # install dependencies
npm run dev          # dev server at localhost:4321
npm run build        # production build → ./dist/
npm run preview      # preview production build locally
```

## Events data

Gig data lives in `tools/event-build/events.csv`, the single source of truth for
both the site and the newsletter. `src/data/events.ts` is generated from it and
should never be edited by hand.

```bash
npm run gen          # regenerate src/data/events.ts from the CSV
npm run validate     # check rows, dates, and that every poster file exists
npm run mail         # build newsletter HTML from the CSV
npm run build:events # rebuild the CSV from the Excel workbook
```

`npm run validate` also runs in CI on any push that touches the CSV, the posters,
or the build scripts.

## Credits
Built on the [Grunge](https://astro.build/themes/details/grunge/) Astro theme by [@_gasparjs](https://twitter.com/_gasparjs).
