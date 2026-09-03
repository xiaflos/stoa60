# Prompt: upgrade STOA60 from Astro 6 to Astro 7

Paste everything below the line into a fresh Claude Code session started in
`C:\Users\asmol\Desktop\site\stoa60`.

---

Upgrade this repo from Astro 6 to Astro 7. A dependency/health scan was run on
2026-09-02 and everything below was verified at that time — trust it as a
starting point, but re-check anything that looks stale before acting on it.

## Current state

- `astro` **6.4.8** (latest is 7.2.10)
- `tailwindcss` and `@tailwindcss/vite` pinned to an **exact 4.2.1** — no caret,
  deliberately. See the landmine section.
- `typescript` 5.9.3, `@astrojs/sitemap` 3.7.4, `@astrojs/check` 0.9.10
- Single deduped `vite@7.3.6` in the tree
- Node: local is v22.18.0, npm 10.9.3
- Baseline that must still hold after the upgrade:
  - `npm run build` → 5 pages, ~305 optimized images, no errors
  - `node --test scripts/*.test.mjs` → 11/11 pass
  - `node scripts/validate-csv.mjs` → `✔ events.csv valid (292 rows)`
  - `dist/sitemap-0.xml` contains exactly 3 routes: `/`, `/about/`, `/posters/`
  - `npx astro check` → **23 errors, all inside `src/pages/admin-helper.astro`**
    (implicit `any`, unchecked `getElementById` in its inline script). This is a
    known pre-existing baseline, not something to fix here — but do not let it
    mask *new* errors the upgrade introduces. Count and locate them.

## Goal

Land Astro 7.2.10 with a green build and the baseline above intact. This also
clears 4 of the 5 remaining `npm audit` advisories (astro / esbuild / sharp).
The 5th is `exceljs`→`uuid`, whose only "fix" is a downgrade to exceljs 3.4.0 —
leave it alone, `exceljs` is the bands-database reader.

## Rules for this repo

- Work directly on `main`. Do **not** create branches or worktrees.
- Do **not** commit, push, or run any git command unless explicitly told to.
- Do **not** start a dev server (`npm run dev` / `astro dev`).
- Verify by running the real build and reporting actual output — never assume.

## Landmines specific to this repo

1. **The tailwind pin must be lifted as part of this upgrade, not before or
   after.** Astro 6 runs `vite ^7`; Astro 7 depends on `vite ^8.0.13`. From
   `@tailwindcss/vite` 4.2.4 onward the plugin's peer range accepts `vite ^8`,
   so under Astro 6 npm auto-installs a *second* Vite (8.x) beside Astro's 7.x
   and the build dies with:
   `[@tailwindcss/vite:generate:build] Missing field 'tsconfigPaths' on BindingViteResolvePluginConfig.resolveOptions`
   Once Astro is on Vite 8 this resolves. So: bump astro **and** restore
   `tailwindcss` + `@tailwindcss/vite` to `^4.3.3` together, then confirm
   `npm ls vite` shows a **single deduped vite 8.x**. Two Vite copies = broken.

2. **Do not let the TypeScript 7 major ride along.** `npm outdated` will offer
   `typescript` 5.9.3 → 7.0.2, but `@astrojs/check` 0.9.10 peers
   `typescript: ^5.0.0 || ^6.0.0`. Keep TypeScript on 5.x. Separate job.

3. **Node floor rises.** Astro 7 requires `node >=22.12.0`. Local 22.18.0 is
   fine, but:
   - `.github/workflows/validate-csv.yml` pins `node-version: 20` — it only runs
     the CSV scripts today, but bump it to 22 for consistency.
   - There is **no `.nvmrc` and no `engines` field**, and no `netlify.toml`, so
     Netlify picks its own Node version. Add an `.nvmrc` (or `engines`) pinning
     Node 22 so the production build cannot silently land on an unsupported
     runtime. This is the single highest-risk part of the upgrade — a green
     local build tells you nothing about Netlify's Node.

4. **`astro:assets` is used in four places** — `Image` in
   `src/components/elements/ImageContainer.astro`,
   `src/components/sections/about/Intro.astro`, `src/pages/posters/index.astro`;
   `getImage` in `src/layouts/Layout.astro`. Astro 7 also pulls sharp ≥0.35.
   After building, spot-check that posters actually render and that the
   optimized-image count is still ~305, not silently zero.

5. **Two `set:html` usages** that a stricter escaping pass could affect:
   `src/layouts/Layout.astro:28` (injected `<style>`) and
   `src/pages/posters/index.astro:458`
   (`<script type="application/json" set:html={JSON.stringify(allBands)}>`,
   read back at line ~670). Verify the posters page's band search still works by
   inspecting the built HTML — the JSON must still parse.

6. **`astro.config.mjs` carries a sitemap `filter`** excluding `/admin-helper`
   from the sitemap (it is an internal CSV-row generator, `noindex`, but still
   ships in the static build). Confirm the filter API is unchanged in the
   Astro 7 sitemap integration and that the built sitemap still has 3 routes.

7. **`npm run build` runs `node scripts/csv-to-ts.mjs --ts-only` first**, which
   regenerates `src/data/events.ts`. That file is auto-generated — never hand-edit
   it, and expect it to show up as modified in `git status`.

## Approach

1. Read the official Astro 6→7 upgrade guide and the v7 changelog first. Do not
   work from memory — enumerate the actual breaking changes and check each one
   against this codebase before changing any code.
2. Run `npx @astrojs/upgrade` if it fits, or bump manually. Either way, restore
   the tailwind packages to `^4.3.3` in the same step.
3. Fix whatever the build reports, smallest change first.
4. Handle the Node pinning (item 3).
5. Run the full verification list below.

## Verification checklist — all of it, with real output

```bash
npm ls vite                        # must be ONE deduped vite 8.x
npm run build                      # 5 pages, ~305 images, no errors
node --test scripts/*.test.mjs     # 11/11
node scripts/validate-csv.mjs      # 292 rows
npx astro check                    # expect the SAME 23 admin-helper errors, no new ones
npm audit                          # expect ~1 remaining (exceljs/uuid)
```

Then confirm by inspection: `dist/sitemap-0.xml` has exactly 3 routes and no
`/admin-helper/`; `dist/admin-helper/index.html` still exists; posters render in
the built HTML.

## Report back

State plainly what broke and how it was fixed, what the Node situation on
Netlify now is, and anything deferred. If a breaking change turns out to need a
real code rewrite rather than a config tweak, stop and say so rather than
improvising a large refactor. Leave everything uncommitted.

Finally, update `CLAUDE.md`: it currently documents the tailwind 4.2.1 pin, the
pending Astro 7 upgrade, and "Astro 6.x" as the stack version. All three need
correcting once this lands.
