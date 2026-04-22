# STOA60

Underground music venue website — Heraklion, Crete. 10+ years, hundreds of gigs.

## Stack
- **Framework:** Astro 5.x (static output)
- **Styling:** Tailwind CSS v4 with `@tailwindcss/vite`
- **Fonts:** Road Rage (headings), JetBrains Mono (body), PF Papernote (serif accents)
- **Deploy:** Netlify
- **Images:** Astro Image with Sharp optimizer

## Commands
```
npm run dev       # localhost:4321
npm run build     # static build → ./dist/
npm run preview   # preview production build
```

## Project Structure
```
src/
├── pages/           index, about, posters/index, 404
├── layouts/         Layout.astro (single layout wrapping all pages)
├── components/
│   ├── global/      BaseHead, Navigation, Footer, Wrapper
│   ├── elements/    Container, Heading, Text, Link, ImageContainer, etc.
│   └── sections/    Page-specific sections (home/Hero, about/Intro)
├── assets/
│   ├── images/posters/   ~300 posters in season/venue folders (e.g. 2024-2025/, GEORGIADIS/, Upcoming/)
│   ├── fonts/            PF Papernote woff2 files
│   └── ui/               barcode.svg, symbolWhite.svg
└── styles/          global.css (theme + tailwind), markdown.css
```

## Conventions
- **Language:** Site content mixes English (hero, nav) and Greek (about, descriptions)
- **Colors:** oklch palette — dark background (~14% lightness), light text (~98%)
- **Breakpoints:** xsm:320 sm:480 md:768 lg:1200 xl:1440
- **Mobile-first:** All layouts start mobile, scale up
- **Component pattern:** Astro components with Props interface, no client-side JS unless needed
- **Poster naming:** Files inside `src/assets/images/posters/{season-or-venue}/` with `YYYY-MM-DD_bandname.jpg` pattern — sorted naturally by filename
- **Noise effect:** Grunge texture via `tailwindcss-noise` plugin on backgrounds

## Important Notes
- Newsletter form UI exists in Hero.astro but has NO backend handler yet
- Next gig poster is hardcoded in Hero.astro (`stolensimadi` import) — update when a new gig is posted
