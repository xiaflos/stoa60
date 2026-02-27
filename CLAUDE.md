# STOA60

Underground music venue website — Heraklion, Crete. 10+ years, hundreds of gigs.

## Stack
- **Framework:** Astro 5.x (static output)
- **Styling:** Tailwind CSS v4 with `@tailwindcss/vite`
- **Fonts:** Road Rage (headings), JetBrains Mono (body), PF Papernote (serif accents)
- **Deploy:** Cloudflare Pages → `grunge.pages.dev`
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
├── pages/           index, about, works/index, 404
├── layouts/         Layout.astro (single layout wrapping all pages)
├── components/
│   ├── global/      BaseHead, Navigation, Footer, Wrapper
│   ├── elements/    Container, Heading, Text, Link, ImageContainer, etc.
│   └── sections/    Page-specific sections (home/Hero, about/Intro, works/Works)
├── assets/
│   ├── images/posters/   189 posters in season folders (e.g. 2024-2025/)
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
- **Poster naming:** Files inside `src/assets/images/posters/{season}/` — sorted naturally by filename
- **Noise effect:** Grunge texture via `tailwindcss-noise` plugin on backgrounds

## Important Notes
- Newsletter form UI exists in Hero.astro but has NO backend handler yet
- Next gig poster is currently hardcoded (update `INVALTA.jpg` reference in Hero.astro)
- Several unused components exist from the original Grunge template (see deprecated list below)

## Deprecated (from template, safe to delete)
- `src/components/sections/home/About.astro`
- `src/components/sections/home/SelectedWorks.astro`
- `src/components/sections/home/Services.astro`
- `src/components/sections/home/Faq.astro`
- `src/components/sections/about/Education.astro`
- `src/components/sections/about/Experience.astro`
- `src/components/sections/works/Pagination.astro`
- `src/components/sections/contact/` (entire directory)
- `src/pages/contact.astro`
- `src/content/*.md` (6 placeholder portfolio items)
- `src/assets/work-card/` (empty directory)
