# GitHub-login event editor UI — plan (deferred)

**Date:** 2026-05-23
**Status:** Plan-only. To be built in a separate session.
**Depends on:** `2026-05-23-mail-fields-in-csv-design.md` (the CSV must have `mailIntro` and `descriptions` columns before this is useful)

## Goal

A small web UI where a trusted person logs in with GitHub, fills out a form for one event (date, location, bands, links, mail intro, descriptions), previews the generated email HTML, and on submit the changes land as a commit to `events.csv` in the `xiaflos/stoa60` repo.

Single source of truth stays the same: `tools/event-build/events.csv`. The UI is just a friendlier editor than Google Sheets when the goal is "set up a gig + write its email."

## Why GitHub login

- Repo write access is already gated by GitHub. Reusing GitHub OAuth means no separate user database, no separate password story, and the audit trail is just the commit history.
- The set of people who should be able to edit events is small and roughly equal to the set who already have repo write access.

## Architecture options

Three plausible shapes. To be decided when building.

### Option A — Netlify Function + static frontend (recommended starting point)

- The Astro site itself serves a `/admin` route (static-rendered, no SSR).
- GitHub OAuth handled by a Netlify Function (`/.netlify/functions/auth`). Standard OAuth dance: redirect to GitHub, exchange code for token, store token in an httpOnly cookie.
- A second Netlify Function (`/.netlify/functions/commit-event`) receives form submissions, validates them, reads the current `events.csv` via GitHub Contents API, edits the row, and commits via GitHub Contents API on behalf of the logged-in user.
- All commits authored by the logged-in user (their token, their commit) — keeps the audit trail honest.

**Pros:** zero new infrastructure; lives in the same repo as the site; Netlify already deploys it.
**Cons:** OAuth secret management (client secret in Netlify env vars); function cold starts; need to handle the case where two people edit the CSV simultaneously.

### Option B — Standalone tiny app on a separate host

- A separate Node/Express or Astro-with-SSR app on Fly.io, Render, or similar.
- Same OAuth flow, same commit-via-Contents-API logic.

**Pros:** decoupled from the site build; easier to develop locally.
**Cons:** new deploy target to maintain; another DNS entry.

### Option C — Skip the OAuth dance, use Decap CMS (formerly Netlify CMS)

- Decap CMS is a drop-in Git-backed admin UI that already does GitHub OAuth → commit. It edits Markdown/YAML/JSON nicely; CSV support is via a custom widget but is awkward.
- Would likely require migrating `events.csv` to one-file-per-event YAML (which we explicitly rejected earlier).

**Pros:** almost no code to write.
**Cons:** forces the schema migration we already decided against.

**Recommended:** A. Smallest surface area, keeps the CSV-as-source-of-truth decision intact.

## UI shape (form fields)

One page per event (new or existing), with these fields — all backed by the matching CSV columns:

- **Date** (date picker) — required
- **Location** (dropdown — values from `Location` type in `events.ts`) — required
- **Organiser** (multiselect — values from `Organiser` type) — required
- **Event type** (text, default `gig`) — required
- **Title** (text, default `gig`)
- **Bands** (1–6 text inputs, "add band" button up to 6) — at least 1 required
- **Poster URL** (text — pasted GitHub raw URL) — required
- **Per band:**
  - link (text — one URL) — optional but recommended
  - description (textarea — 1–2 sentences, `<br>` allowed) — required if `mailIntro` is filled
- **Mail intro** (textarea, 1–2 sentences) — optional; presence flips this event to "will be in the next mail"
- **Preview button** → renders the same HTML the `build-mail.mjs` script would produce, in an iframe below the form

## Server-side flow (commit-event function)

1. Verify session (cookie → GitHub username). Reject if not in an allowlist of permitted usernames (env var).
2. Fetch current `events.csv` via GitHub Contents API. Save its SHA.
3. Parse CSV. Find row by date (or insert new row). Apply form values.
4. Re-serialize CSV. Preserve column order and existing quoting style.
5. PUT updated CSV back via Contents API with the saved SHA (this is how the API does optimistic concurrency — request fails if someone else committed in the meantime, and we can surface a friendly "someone else just edited this, refresh and retry" error).
6. Return success → UI shows the resulting commit URL.

Netlify then auto-deploys the site as usual; `csv-to-ts.mjs` runs during the build; the email HTML can be generated locally with `node scripts/build-mail.mjs <date>` (the UI does *not* need to send the mail — it only edits the data).

## Concerns / open questions

- **Allowlist of usernames.** Where it lives — env var (simple) or a committed `.admins` file in the repo (auditable). Probably env var for v1.
- **Multi-person editing.** SHA-based optimistic concurrency above handles it for the same row. Two people editing different rows simultaneously is also safe because each commit only changes one row's bytes.
- **CSV round-tripping.** The parser must preserve column order, quoting, and line endings exactly, otherwise every commit produces a noisy diff. Pick a CSV library that supports lossless round-trip or write a minimal one.
- **Validation on submit.** Same validation `csv-to-ts.mjs` does (band keys in `descriptions` exist in `bands`, etc.), run *before* committing, with friendly inline errors.
- **Local development.** GitHub OAuth callback URL must allow localhost. Either register a second OAuth app for dev, or use `127.0.0.1` with a fixed port.
- **Costs / limits.** Netlify Functions free tier is generous for this kind of low-traffic usage; GitHub Contents API rate limit is 5000/hr per user — irrelevant at this scale.

## Out of scope (for v1)

- Editing past events (only the current/upcoming gig flow matters first).
- Image uploads (poster image is uploaded to the repo by hand or via Google Drive sync — UI just receives the URL).
- Sending the email (still a manual paste into the mailing-list tool).
- Multi-language UI (English-only is fine for the small admin user base).

## Suggested first-session scope (when this gets picked up)

1. Register the GitHub OAuth app, store secret in Netlify env.
2. Build the `/admin` page with the form (no submit yet).
3. Build the GitHub login flow + session cookie.
4. Build the preview button — calls the same HTML template as `build-mail.mjs`.
5. Build the commit-event function with allowlist + SHA-based commit.
6. Manual smoke test: log in, edit a real event, commit, verify the diff is clean and Netlify auto-deploys.
