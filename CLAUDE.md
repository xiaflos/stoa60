<!-- Web development rules are inherited from the workspace file at
     Desktop\site\CLAUDE.md (auto-loaded as an ancestor). Canonical source:
     FredD\04-coding\projects\web-deploy\web-design.md
     Removed 2026-08-29: a dead @import to the deleted
     FredD\04-coding\projects\stoa60\CLAUDE.md stood on the first line. -->

# STOA60

Underground music venue website — Heraklion, Crete. 10+ years, hundreds of gigs.

## Stack
- **Framework:** Astro 7.x (static output)
- **Styling:** Tailwind CSS v4 with `@tailwindcss/vite`
- **Fonts:** Road Rage (headings) and JetBrains Mono Variable (body) via `@fontsource*`;
  Bahnschrift loaded from a local `.ttf` with an `@font-face` in `global.css`
- **Deploy:** Netlify (newsletter uses Netlify Forms)
- **Images:** Astro Image with Sharp optimizer

## Commands
```
npm run dev          # localhost:4321
npm run build        # regenerates events.ts, then static build → ./dist/
npm run preview      # preview production build
npm run gen          # regenerate src/data/events.ts + reports from events.csv
npm run validate     # validate events.csv (rows, dates, poster files exist)
npm run mail         # build a newsletter HTML from the CSV
npm run build:events # rebuild events.csv from the Excel workbook (exceljs)
```

## Project Structure
```
src/
├── pages/           index, about, posters/index, admin-helper, 404
├── layouts/         Layout.astro (single layout wrapping all pages)
├── components/
│   ├── global/      BaseHead, Footer, Wrapper
│   ├── elements/    Container, Heading, Text, Link, ImageContainer,
│   │                LanguageToggle, NewsletterForm
│   └── sections/    Page-specific sections (home/Hero, about/Intro)
├── data/            events.ts — AUTO-GENERATED, do not edit by hand
├── i18n/            i18n.ts (runtime swap), translations.ts (el/en strings)
├── assets/
│   ├── images/posters/   292 posters in season folders (2015-2016 … 2025-2026)
│   │                     plus Upcoming/
│   ├── fonts/            bahnschrift.ttf
│   └── ui/               barcode.svg, symbol.svg, symbolWhite.svg
└── styles/          global.css (theme + tailwind)
```

## Events pipeline
`tools/event-build/events.csv` is the single source of truth. It drives both the
site and the newsletter.

```
Excel workbook ──build:events──> events.csv ──csv-to-ts──> src/data/events.ts
                                     │
                                     └────build-mail───> newsletter HTML
```

- Never hand-edit `src/data/events.ts` — it is regenerated on every `npm run build`.
- `npm run validate` is enforced in CI (`.github/workflows/validate-csv.yml`) on
  any push touching the CSV, the posters, or `scripts/*.mjs`.
- `scripts/_audit.mjs` reports orphan posters and events missing a poster.

## Conventions
- **Language:** Greek is the default; `LanguageToggle` swaps to English at runtime
  via `data-i18n` attributes, persisted in `localStorage` under `stoa60-lang`
- **Colors:** oklch palette — dark background (~14% lightness), light text (~98%)
- **Breakpoints:** xsm:320 sm:480 md:768 lg:1200 xl:1440
- **Mobile-first:** All layouts start mobile, scale up
- **Component pattern:** Astro components with Props interface, no client-side JS unless needed
- **Poster naming:** Files inside `src/assets/images/posters/{season}/` with
  `YYYY-MM-DD_bandname.jpg` pattern — sorted naturally by filename
- **Noise effect:** Grunge texture via `tailwindcss-noise` plugin on backgrounds

## Important Notes
- The newsletter form posts to **Netlify Forms** (`data-netlify="true"` with a
  `bot-field` honeypot) — no custom backend to maintain.
- The next-gig poster is **not** hardcoded: `Hero.astro` picks the event flagged
  `is_next` in the CSV, falling back to the soonest upcoming event.
- `/admin-helper` is an internal CSV-row generator. It is `noindex` and is
  filtered out of the sitemap in `astro.config.mjs`, but it still ships in the
  static build and is reachable by URL.
- `npx astro check` currently reports errors, all confined to the inline script
  in `admin-helper.astro` (implicit `any`, unchecked `getElementById`). The build
  does not run `check`, so these do not block a deploy.
- `tailwindcss` and `@tailwindcss/vite` track `^4.3.3`. The old exact-4.2.1 pin
  is gone: it existed only because Astro 6 ran Vite 7 while `@tailwindcss/vite`
  ≥ 4.2.4 accepts `vite ^8`, which made npm install a second Vite alongside
  Astro's and broke the build on a rolldown binding mismatch. Astro 7 is on
  Vite 8, so the tree dedupes again — after any dependency change, confirm
  `npm ls vite` still shows a **single** deduped vite 8.x. Two copies = broken.
- **Node ≥ 22.12 is required** (Astro 7). `.nvmrc` pins `22` so Netlify cannot
  silently build on an older runtime, `package.json` carries a matching
  `engines.node`, and CI (`validate-csv.yml`) runs `node-version: 22`. On Node
  22.18 npm prints an `EBADENGINE` warning for `undici` (a transitive dep of
  `unifont`, which wants ≥ 22.19); it is a warning only and the build is
  unaffected, but Node 22.19+ silences it.
- Astro 7 defaults `compressHTML` to `'jsx'`, which strips whitespace and line
  breaks *between* elements rather than collapsing them to a space. Every place
  this site relies on inter-element spacing is a flex container with a `gap`,
  so the output is unchanged visually — but if you add inline elements inside
  ordinary text flow, put the space in explicitly.
- The Astro 7 build emits a few `Pango-CRITICAL … pango_font_description_get_family`
  lines on Windows during "Building static entrypoints". They come from the
  sharp/libvips font stack, are stderr noise only, and do not fail the build.
- Left deliberately unfixed: `npm audit` reports `exceljs` → `uuid` (moderate).
  The only offered fix downgrades to `exceljs` 3.4.0, which is the bands-database
  reader — leave it alone.
