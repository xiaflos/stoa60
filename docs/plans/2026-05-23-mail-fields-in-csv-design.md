# Email-generation fields in events.csv

**Date:** 2026-05-23
**Status:** Design approved, not yet implemented

## Goal

Extend `tools/event-build/events.csv` with the fields needed to auto-generate the gig-announcement HTML emails that currently live (hand-written) in `tools/event-build/newsletters/`. Keep the CSV as the single source of truth so events stay editable in Google Sheets.

## Why CSV (and not YAML / a separate file)

Descriptions will be short (1–2 sentences per band) and the existing CSV → `src/data/events.ts` pipeline already handles pipe-delimited per-band data (`links`). Adding two columns is cheaper than introducing a new file format, a merge step, and a second editing workflow.

## Schema changes

### `tools/event-build/events.csv` — two new columns

| column | content | example |
|---|---|---|
| `mailIntro` | The email's intro / tagline. Plain text, 1–2 sentences. Empty when the event isn't going out by mail. | `Μυσταγωγίες, drones & beat poetry.` |
| `descriptions` | Per-band description. Same pipe pattern as `links`: `Band=text\|Band=text`. Text may contain literal `<br>` for line breaks. | `ΚΑΘΑΡΟΣ ΧΑΛΚΟΣ=Φρέσκο σχήμα από την Αθήνα...\|ΑΡΚΟΥΔΕΣ...=Οι καλύτερες αρκούδες της Κρήτης.` |

Both columns are **optional**. Old events stay empty — no backfill.

### `links` column — unchanged

The existing `Band=URL|Band=URL` grammar stays as-is: **one URL per band**. The renderer derives a display label from the URL hostname:

| hostname | label |
|---|---|
| `*.bandcamp.com` | stripped subdomain (e.g. `katharoschalkos.bandcamp.com`) |
| `youtube.com`, `youtu.be` | `youtube` |
| `facebook.com` | `facebook` |
| anything else | stripped host |

Known limitation: any band that historically had multiple links (e.g. YouTube + Facebook in the hand-written Αρκούδες newsletter) must pick one canonical link in the CSV. The other is dropped from auto-generated mails.

### Delimiter rule

Description text must not contain literal `|` or `=`. For 1–2 sentence natural-language text this is a non-issue in practice.

### `src/data/events.ts` — interface additions

`scripts/csv-to-ts.mjs` is updated to emit two new optional fields. `bandLinks` shape is unchanged.

```ts
export interface Event {
  // ...existing fields unchanged...
  bandLinks?: Record<string, string>;       // unchanged
  mailIntro?: string;                       // NEW
  bandDescriptions?: Record<string, string>;// NEW
}
```

No breaking changes — existing consumers of `bandLinks` keep working.

### Validation in `csv-to-ts.mjs`

- If `descriptions` is non-empty: every band key in it must exist in the event's band columns. Fail loudly on mismatch (typo protection).
- If `descriptions` is non-empty and a band in the event has no description: warn (don't fail) — lets you stage emails incrementally.
- Existing `links` validation stays as-is.

## Renderer

New script: `scripts/build-mail.mjs <YYYY-MM-DD>`

**What it does:**

1. Reads `src/data/events.ts`, finds the event matching the given date. Errors if none / multiple.
2. Errors if `mailIntro` or `bandDescriptions` is missing — those are the "this event is mail-ready" signal.
3. Fills an HTML template with: poster URL (raw from CSV — the GitHub-hosted JPG), `mailIntro`, and a per-band block `{name, link, description}`.
4. Writes output to `tools/event-build/newsletters/<date>_<slug>.html`. Slug derived from event metadata the same way existing newsletter filenames are. Refuses to overwrite an existing file unless `--force` is passed.

**Template location:** `tools/event-build/templates/mail.html` with simple `{{placeholder}}` substitution, OR an inline JS template literal in `build-mail.mjs`. Pick whichever is shortest at implementation time; the template structure mirrors the existing hand-written newsletters (same dark-background table layout, monospace font, sign-off line, unsubscribe footer).

**Sign-off line** (`Στηρίζουμε το κουτί, σεβόμαστε τη γειτονιά.`) and **unsubscribe footer** are template constants — not in the CSV.

**Poster URL:** taken straight from the CSV `poster_url` column (raw GitHub JPG). Accepted trade-off: bigger image in subscribers' inboxes vs. zero coupling to Astro's build output.

## Out of scope (future work)

- GitHub-OAuth UI for editing events without touching Google Sheets. When built, that UI writes back to `events.csv` and commits via GitHub — same source of truth, different editor.
- Mailing-list sending itself (the script outputs HTML only; sending is still manual).
- Migrating existing hand-written newsletters into the CSV. They stay where they are.

## Files touched

- `tools/event-build/events.csv` — add 2 columns (`mailIntro`, `descriptions`)
- `scripts/csv-to-ts.mjs` — parse the new columns, add validation
- `src/data/events.ts` — auto-regenerated (additive only)
- `scripts/build-mail.mjs` — NEW
- `tools/event-build/templates/mail.html` — NEW (optional; template may live inline in the script)
