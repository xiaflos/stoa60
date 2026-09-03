# Event editing workflow — design

**Date:** 2026-04-30
**Status:** Approved, ready for implementation plan
**Supersedes:** `2026-05-23-github-login-event-editor-plan.md` (the OAuth/Function editor is shelved as over-engineered for current scale)
**Builds on:** `2026-05-21-events-database-design.md`, `2026-05-23-mail-fields-in-csv-design.md`

## Goal

Let a small trusted group (you + 1–2 others) add or update a gig — calendar row, mail content, poster image, "next gig" flag — using only GitHub's web UI plus one small static helper page. No backend, no OAuth code, no Netlify Functions, no new auth system.

## Constraints

- `tools/event-build/events.csv` stays the single source of truth.
- Site stays fully static (Astro → Netlify); rebuild on every push to main.
- No runtime database, no server-side editor.
- Editor access = GitHub repo collaborator. No separate user system.
- Edits happen ~once a week.

## Pieces

### 1. `is_next` column on `events.csv`

- New optional boolean column. At most one row may be `true`.
- `csv-to-ts.mjs` parses it into `Event.isNext?: boolean`.
- `Hero.astro` drops the hardcoded `import nextGigPoster from "..."` and instead picks the event where `isNext === true`, using its `poster` field. Fallback if none flagged: the soonest upcoming event with a date ≥ today.

### 2. Static "CSV row helper" page — `/admin-helper`

A single Astro page, no login, no backend, no commit logic. Just a form that builds a correctly-escaped CSV row in your browser.

- **Fields** (one per CSV column): date, location, organiser, event_type, title, bands (1–6 rows), per-band link, per-band description, poster filename, `mailIntro`, `is_next`.
- **Output**: a textarea below the form holding the generated CSV row, plus a "copy to clipboard" button.
- **No persistence.** Refresh = empty form. This is a one-shot row builder.
- **No image upload.** Editor uploads the JPG to the repo via GitHub's drag-drop in a separate step.
- The page is unlinked from the public site (just bookmarked by the few editors).

This removes the only genuinely fiddly part of editing the CSV in GitHub's web textarea — getting the pipe-delimited `Band=URL|Band=URL` and `Band=description|Band=description` strings escaped correctly.

### 3. GitHub Action — `.github/workflows/validate-csv.yml`

Runs on every push and PR touching `tools/event-build/events.csv` or `src/assets/images/posters/`.

- Calls a new `scripts/validate-csv.mjs` that reuses the validation already inside `csv-to-ts.mjs`, plus:
  - Date format `YYYY-MM-DD`.
  - At most one row with `is_next: true`.
  - Every `poster` filename resolves to an existing file under `src/assets/images/posters/`.
  - Every band key in `descriptions` exists in `bands`.
- Fails the workflow with a readable error on the PR / commit if anything is off. Prevents broken deploys.

### 4. Editor workflow per gig

1. Open the helper page → fill form → copy generated CSV row.
2. In GitHub web UI: open `events.csv`, paste the row, commit.
3. In GitHub web UI: drag-drop the poster JPG into the appropriate season/venue folder under `src/assets/images/posters/`, commit.
4. If a previous event was `is_next: true`, open that row and set it to `false` (the validator catches you if you forget — it won't let two rows be true).
5. Netlify auto-rebuilds in ~90s. Calendar updates. Email HTML auto-generates from the same row via the planned `scripts/build-mail.mjs`.

Two commits per gig (or one if batched via GitHub's "Add file → Upload files" flow). ~3 minutes per gig.

## Files touched

**New**
- `src/pages/admin-helper.astro` — the form page
- `.github/workflows/validate-csv.yml` — the CI validator
- `scripts/validate-csv.mjs` — validation logic, runnable from CLI + Action

**Modified**
- `tools/event-build/events.csv` — add `is_next` column (existing rows: empty/false)
- `scripts/csv-to-ts.mjs` — parse `is_next`, run validation on build
- `src/data/events.ts` — regenerated (additive)
- `src/components/sections/home/Hero.astro` — replace hardcoded poster import with `isNext` lookup + fallback

## Out of scope

- Auth on the helper page. It only emits CSV text; nothing to protect.
- Image upload through the helper page (drag-drop in GitHub is enough).
- Auto-flipping the previous `is_next` to false on submit. Manual; validator enforces the invariant.
- Editing past events through the form. Past rows stay editable directly in the CSV.
- Sending the email (still a manual paste into the mailing-list tool, per the mail-fields design).
- Migrating to a full custom `/admin` with OAuth — explicitly deferred. Data shape is identical, so it remains an easy upgrade path later if this workflow turns out to be too fiddly.

## Open risks

- **Editor forgets to flip the previous `is_next` to false.** Validator catches it on commit (won't let two be true). Fallback in Hero.astro (soonest upcoming event) means even if no row is flagged, the homepage doesn't break.
- **Two editors editing simultaneously.** GitHub's standard commit conflict handling. Rare at this scale.
- **CSV manually edited in a way that breaks pipe delimiters.** Validator fails the build. Helper page exists specifically to avoid this.
- **Editor uploads poster to the wrong folder.** Validator's "poster file exists" check fires; editor moves it.

## Acceptance criteria

- Helper page renders at `/admin-helper`; all fields work; generated row passes the validator.
- `is_next` column exists in `events.csv`; at most one row is true at any time.
- `Hero.astro` shows the correct poster based on `isNext`, with the upcoming-event fallback when nothing is flagged.
- The GitHub Action runs on every relevant push and blocks bad commits with a readable message.
- One real editor adds a real gig end-to-end in under 5 minutes without engineering help.
