# Gig Calendar Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a `/gig-calendar` page listing upcoming gigs grouped by month, with alternating poster placement and consistent site aesthetic.

**Architecture:** Single Astro page (`src/pages/gig-calendar.astro`) with hardcoded gig data array. Posters loaded via `import.meta.glob` from `src/assets/images/posters/Upcoming/`. Nav updated in 3 existing files.

**Tech Stack:** Astro 6, Tailwind CSS v4, `astro:assets` Image component, Road Rage (`font-grunge`) + JetBrains Mono fonts.

---

### Task 1: Add i18n key for nav link

**Files:**
- Modify: `src/i18n/translations.ts`

**Step 1: Add translation key**

In `src/i18n/translations.ts`, inside the `// ─── Navigation ───` block, add:

```ts
"nav.calendar": { el: "Gig Calendar", en: "Gig Calendar" },
```

**Step 2: Verify build**

```bash
cd C:\Users\asmol\Desktop\site\stoa60 && npm run build 2>&1 | findstr /i "error complete"
```
Expected: `Complete!` with no errors.

**Step 3: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "Add nav.calendar i18n key"
```

---

### Task 2: Add "GIG CALENDAR" link to all nav bars

**Files:**
- Modify: `src/components/sections/home/Hero.astro` (line ~27–31, inside `<nav>`)
- Modify: `src/components/sections/about/Intro.astro` (line ~18–23, inside `<nav>`)
- Modify: `src/pages/works/index.astro` (line ~93–97, inside `<nav>`)

**Step 1: Add link to Hero.astro nav**

After the existing About link, add:
```html
<a href="/gig-calendar" class="text-base-900 font-grunge text-2xl md:text-3xl underline underline-offset-4 decoration-2 hover:text-base-700" data-i18n="nav.calendar">Gig Calendar</a>
```

**Step 2: Add link to Intro.astro nav**

Same HTML after the About link.

**Step 3: Add link to works/index.astro nav**

Same HTML after the About link.

**Step 4: Verify build**

```bash
npm run build 2>&1 | findstr /i "error complete"
```
Expected: `Complete!`

**Step 5: Commit**

```bash
git add src/components/sections/home/Hero.astro src/components/sections/about/Intro.astro src/pages/works/index.astro
git commit -m "Add Gig Calendar link to all nav bars"
```

---

### Task 3: Create the gig calendar page

**Files:**
- Create: `src/pages/gig-calendar.astro`

**Step 1: Create the page**

Create `src/pages/gig-calendar.astro` with the following content:

```astro
---
import Layout from "../layouts/Layout.astro";
import Container from "../components/elements/Container.astro";
import LanguageToggle from "../components/elements/LanguageToggle.astro";
import { Image } from "astro:assets";

// Load all Upcoming posters eagerly
const allPosters = import.meta.glob<{ default: ImageMetadata }>(
    "../assets/images/posters/Upcoming/*.{jpg,jpeg,png}",
    { eager: true }
);

// Helper: find poster by filename
function getPoster(filename: string | null): ImageMetadata | null {
    if (!filename) return null;
    const match = Object.entries(allPosters).find(([path]) =>
        path.endsWith(`/${filename}`)
    );
    return match ? match[1].default : null;
}

// Gig data — update here to change the calendar
interface Gig {
    month: string;
    date: string;
    bands: string[];
    poster: string | null;
    location?: string;
}

const gigs: Gig[] = [
    { month: "Απρίλιος", date: "18", bands: ["Axeon", "Veil Omega"],       poster: "3.axeon_veil2.jpg" },
    { month: "Απρίλιος", date: "25", bands: ["Junkheart", "Ποντικια"],     poster: "4..junkpontfn16b11111.jpg" },
    { month: "Μάιος",    date: "2",  bands: ["SOMA", "Malhotra"],          poster: null },
    { month: "Μάιος",    date: "9",  bands: ["Tiffany", "Thymics"],        poster: null },
    { month: "Μάιος",    date: "16", bands: ["Καθαρός Χαλκός", "Αρκούδες των αγωγών της πολυκατοικίας"], poster: null },
    { month: "Μάιος",    date: "23", bands: ["State of Loss"],             poster: null },
];

// Group gigs by month, preserving order and global index for alternation
const months: { name: string; entries: { gig: Gig; index: number }[] }[] = [];
let globalIndex = 0;
for (const gig of gigs) {
    let group = months.find(m => m.name === gig.month);
    if (!group) {
        group = { name: gig.month, entries: [] };
        months.push(group);
    }
    group.entries.push({ gig, index: globalIndex++ });
}
---

<Layout title="Gig Calendar">
    <Container variant={"xl"} class="flex flex-col !gap-0 pb-8">

        <!-- Nav -->
        <nav class="flex flex-wrap gap-4 md:gap-8 justify-start items-center pt-2">
            <a href="/" class="text-base-900 font-grunge text-2xl md:text-3xl underline underline-offset-4 decoration-2 hover:text-base-700" data-i18n="nav.home">Home</a>
            <a href="/works" class="text-base-900 font-grunge text-2xl md:text-3xl underline underline-offset-4 decoration-2 hover:text-base-700" data-i18n="nav.posters">Posters</a>
            <a href="/about" class="text-base-900 font-grunge text-2xl md:text-3xl underline underline-offset-4 decoration-2 hover:text-base-700" data-i18n="nav.about">About</a>
            <a href="/gig-calendar" class="text-base-900 font-grunge text-2xl md:text-3xl underline underline-offset-4 decoration-2 hover:text-base-700" data-i18n="nav.calendar">Gig Calendar</a>
            <LanguageToggle />
        </nav>

        <!-- Page title -->
        <h1 class="font-grunge text-6xl md:text-8xl text-base-900 mt-6 mb-8 uppercase">GIG CALENDAR</h1>

        <!-- Months -->
        {months.map(({ name, entries }) => (
            <section class="w-full mb-10">

                <!-- Month heading -->
                <div class="border-b border-base-900/30 mb-2 pb-1">
                    <span class="font-grunge text-4xl md:text-5xl text-base-900/40 uppercase">{name}</span>
                </div>

                <!-- Gig rows -->
                {entries.map(({ gig, index }) => {
                    const poster = getPoster(gig.poster);
                    const isEven = index % 2 === 0;
                    return (
                        <div class:list={[
                            "flex items-center gap-6 md:gap-10 py-6 border-b border-base-900/15",
                            !isEven && "flex-row-reverse"
                        ]}>

                            <!-- Poster (or placeholder) -->
                            <div class="shrink-0 w-24 md:w-32">
                                {poster ? (
                                    <Image
                                        src={poster}
                                        alt={`Poster for ${gig.bands.join(" × ")}`}
                                        class="w-full h-auto object-contain"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div class="w-full aspect-[2/3] border border-dashed border-base-900/30" />
                                )}
                            </div>

                            <!-- Date + Bands -->
                            <div class:list={[
                                "flex items-center gap-4 md:gap-8 flex-1",
                                !isEven && "flex-row-reverse"
                            ]}>
                                <!-- Date -->
                                <span class="font-grunge text-6xl md:text-8xl text-base-900/40 leading-none shrink-0">{gig.date}</span>

                                <!-- Band names -->
                                <div class:list={["flex flex-col", !isEven && "items-end"]}>
                                    {gig.bands.map((band, i) => (
                                        <>
                                            <span class="font-grunge text-2xl md:text-4xl text-base-900 uppercase leading-tight">{band}</span>
                                            {i < gig.bands.length - 1 && (
                                                <span class="font-grunge text-xl md:text-2xl text-base-900/40 leading-none my-0.5">×</span>
                                            )}
                                        </>
                                    ))}
                                    <span class="font-mono text-xs text-base-900/30 mt-1 uppercase tracking-widest">{gig.location ?? "STOA 60"}</span>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </section>
        ))}

    </Container>
</Layout>
```

**Step 2: Verify build**

```bash
npm run build 2>&1 | findstr /i "error complete"
```
Expected: `4 page(s) built` → wait, should be `5 page(s) built` now. And `Complete!`.

**Step 3: Commit**

```bash
git add src/pages/gig-calendar.astro
git commit -m "Add gig calendar page with alternating poster layout"
```

---

### Task 4: Push and verify

**Step 1: Push to origin**

```bash
git push origin main
```

**Step 2: Final check**

Run dev server and open `http://localhost:4321/gig-calendar` to visually confirm:
- Month headings render correctly
- Alternating poster sides work
- Placeholder dashed boxes show for gigs without posters
- Nav link present and functional
