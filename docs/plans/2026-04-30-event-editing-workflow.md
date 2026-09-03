# Event Editing & Email Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** One CSV row, edited through a static helper page + GitHub's web UI, drives **both** the website (calendar + next-gig poster) **and** a ready-to-send HTML announcement email. No backend, no OAuth, no Netlify Functions.

**Architecture:** `tools/event-build/events.csv` is the single source of truth. A build-time step regenerates `src/data/events.ts` from the CSV, so editing the CSV alone updates the site. A static `/admin-helper` page builds a correctly-escaped CSV row in the browser. A GitHub Action validates the CSV on every push. `Hero.astro` shows the poster of the row flagged `is_next`. A local `build-mail.mjs <date>` turns a mail-ready row into an HTML email matching the existing hand-written newsletters.

**Tech Stack:** Astro 6.1, Tailwind v4, Node ESM scripts, `node:test` (built-in runner — no new dependency), GitHub Actions, Netlify.

---

## CRITICAL CONTEXT — read before starting

The original design assumed editing the CSV updates the site. **It currently does not.** Real pipeline as built:

```
tools/event-build/events.csv        ← edited by hand
        ↓  node scripts/csv-to-ts.mjs   (MANUAL local step — NOT in the build)
src/data/events.ts                  ← committed artifact the site builds from
        ↓  astro build  →  dist/      ← what Netlify serves
```

`package.json` `build` is just `astro build`. So a CSV edit via GitHub never regenerates `events.ts`. **Task 1 fixes this.** Without Task 1 the whole workflow is cosmetic.

### Real CSV schema (authoritative)

Current header (`tools/event-build/events.csv` line 1):
```
date,location,organiser,Title,band_1,band_2,band_3,band_4,band_5,band_6,poster_url,links
```

- `Title` holds the **event type** (`gig`, `Bar`, `Party`, …), not a title. Keep the column name.
- Bands live in `band_1`…`band_6`.
- `poster_url` is a **full GitHub raw URL** (`https://raw.githubusercontent.com/xiaflos/stoa60/main/src/assets/images/posters/<season>/<file>.jpg`).
- `links` is `Band=URL|Band=URL` (one URL per band).
- **This plan adds three trailing columns:** `is_next` (`true`/empty), `mailIntro` (one-line tagline), `descriptions` (`Band=text|Band=text`; text may contain literal `<br>`).

### Poster sourcing wrinkle

`csv-to-ts.mjs` currently reads each poster path from the *existing* `events.ts` (`loadExistingPosters`), keyed by `date|location` — it ignores the CSV's `poster_url`. A brand-new event has no `events.ts` entry, so its poster resolves to `''`. Task 1 makes the CSV `poster_url` the authoritative source.

### Project rules (`CLAUDE.md`)

- Work on `main`, no new branches.
- **No git commits unless the user explicitly asks.** "Checkpoint" = pause, do not commit.
- **Do not run the dev server.** Verify with `npm run build`.

---

## Reference snippets used across tasks

```js
const GITHUB_RAW = 'https://raw.githubusercontent.com/xiaflos/stoa60/main/src/assets/images/posters';

// URL → repo-relative poster path (the string stored in Event.poster)
function urlToPosterPath(url) {
  if (!url) return '';
  const prefix = GITHUB_RAW + '/';
  return url.startsWith(prefix) ? url.slice(prefix.length) : '';
}

// Parse a "Key=value|Key=value" cell (used for links AND descriptions)
function parsePairs(raw) {
  const out = {};
  if (!raw || !raw.trim()) return out;
  for (const part of raw.split('|')) {
    const i = part.indexOf('=');
    if (i > 0) {
      const k = part.slice(0, i).trim();
      const v = part.slice(i + 1).trim();
      if (k && v) out[k] = v;
    }
  }
  return out;
}
```

`Event.poster` stays relative to `src/assets/images/posters/`, e.g. `2025-2026/2026-05-16_kathares-arkoudes.jpg`.

---

## Task 1: Run CSV→TS at build time, sourcing posters from the CSV

**Why first:** nothing updates the live site until the build regenerates `events.ts` from the CSV.

**Files:**
- Modify: `scripts/csv-to-ts.mjs`
- Modify: `package.json:5-11`

**Step 1: Add a `--ts-only` flag and CSV-sourced posters**

In `scripts/csv-to-ts.mjs`, after the `GITHUB_RAW` constant (~line 14):

```js
const TS_ONLY = process.argv.includes('--ts-only');

function urlToPosterPath(url) {
  if (!url) return '';
  const prefix = GITHUB_RAW + '/';
  return url.startsWith(prefix) ? url.slice(prefix.length) : '';
}
```

In `main()`, replace the poster look-up block (~lines 192-211) with CSV-first sourcing:

```js
    // Poster: prefer the CSV's poster_url (authoritative for new events),
    // fall back to the existing events.ts lookup for legacy rows.
    let poster = urlToPosterPath((row.poster_url ?? '').trim());
    let recordings;

    if (!poster) {
      const key1 = `${date}|${location}`;
      const key2 = `${date}|underground`;
      for (const key of [key1, key2]) {
        const arr = posterMap.get(key);
        if (arr) {
          const idx = used.get(key) ?? 0;
          if (idx < arr.length) {
            poster     = arr[idx].poster ?? '';
            recordings = arr[idx].recordings;
            used.set(key, idx + 1);
            break;
          }
        }
      }
    }
    if (poster) matched++; else unmatched++;
```

Guard the CSV write-back at the end of `main()` (~line 221):

```js
  await fs.writeFile(TS_PATH, serializeTs(events), 'utf8');
  if (!TS_ONLY) {
    await fs.writeFile(CSV_PATH, serializeCsv(rows, events), 'utf8');
  }
```

**Step 2: Wire into the build**

`package.json` scripts:

```json
    "build": "node scripts/csv-to-ts.mjs --ts-only && astro build",
    "gen": "node scripts/csv-to-ts.mjs",
```

**Step 3: Verify**

```bash
npm run build
git status --short tools/event-build/events.csv
```
Expected: `[csv-to-ts] NNN events…` then a clean Astro build; the CSV is unchanged (no `git status` output).

**Step 4: Checkpoint** — no commit.

---

## Task 2: Add `is_next`, `mailIntro`, `descriptions` columns

**Files:**
- Modify: `scripts/csv-to-ts.mjs`
- Modify: `tools/event-build/events.csv`
- Test: `scripts/csv-to-ts.test.mjs` (new)

**Step 1: Failing test for the new parsers**

Create `scripts/csv-to-ts.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseIsNext, parsePairs } from './csv-to-ts.mjs';

test('parseIsNext true/false variants', () => {
  for (const v of ['true','TRUE',' true ','1','yes']) assert.equal(parseIsNext(v), true);
  for (const v of ['', '  ', 'false','no','0', undefined, null]) assert.equal(parseIsNext(v), false);
});

test('parsePairs splits Key=value|Key=value', () => {
  assert.deepEqual(parsePairs('A=x|B=y'), { A: 'x', B: 'y' });
  assert.deepEqual(parsePairs(''), {});
  assert.deepEqual(parsePairs('A=he said <br> hi'), { A: 'he said <br> hi' });
});
```

**Step 2: Run — confirm fail**

```bash
node --test scripts/csv-to-ts.test.mjs
```
Expected: FAIL (exports missing).

**Step 3: Implement and emit**

In `scripts/csv-to-ts.mjs`:

- Replace the existing `parseBandLinks` with an exported generic `parsePairs` (used for both links and descriptions), and add `parseIsNext`. Near the field parsers (~line 60):

```js
export function parsePairs(raw) {
  const out = {};
  if (!raw || !raw.trim()) return out;
  for (const part of raw.split('|')) {
    const i = part.indexOf('=');
    if (i > 0) {
      const k = part.slice(0, i).trim();
      const v = part.slice(i + 1).trim();
      if (k && v) out[k] = v;
    }
  }
  return out;
}

export function parseIsNext(raw) {
  const s = String(raw ?? '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}
```

Update the call site that used `parseBandLinks(row.links)` to `parsePairs(row.links)`.

- In `main()` where the event object is assembled (~line 214):

```js
    const bandLinks        = parsePairs(row.links ?? '');
    const bandDescriptions = parsePairs(row.descriptions ?? '');
    const mailIntro        = (row.mailIntro ?? '').trim();

    const ev = { date, bands, rawTitle, eventType, location, organiser, poster };
    if (Object.keys(bandLinks).length)        ev.bandLinks = bandLinks;
    if (recordings)                           ev.recordings = recordings;
    if (parseIsNext(row.is_next))             ev.isNext = true;
    if (mailIntro)                            ev.mailIntro = mailIntro;
    if (Object.keys(bandDescriptions).length) ev.bandDescriptions = bandDescriptions;
    return ev;
```

- In `serializeTs`, extend the `Event` interface (after `poster: string;`):

```js
  poster: string;
  isNext?: boolean;
  bandLinks?: Record<string, string>;
  mailIntro?: string;
  bandDescriptions?: Record<string, string>;
  recordings?: Recording[];
```

- In `serializeCsv`, add the three columns and their values. Column list (~line 113):

```js
  const BASE_COLS = ['date','location','organiser','Title',...BAND_COLS,'poster_url','links','is_next','mailIntro','descriptions'];
```

per-row `fields` (after `row.links`):

```js
      row.links          ?? '',
      row.is_next        ?? '',
      row.mailIntro      ?? '',
      row.descriptions   ?? '',
```

**Step 4: Run — confirm pass**

```bash
node --test scripts/csv-to-ts.test.mjs
```
Expected: PASS.

**Step 5: Add the columns to the CSV; flag the next gig; add mail fields to one upcoming row**

Edit `tools/event-build/events.csv`:
- Append `,is_next,mailIntro,descriptions` to the header.
- On the soonest upcoming gig: set `is_next` = `true`, fill `mailIntro`, and fill `descriptions` as `Band=text|Band=text` for each band. All other rows: leave the three new fields empty.

Regenerate and verify:
```bash
npm run gen
grep -c '"isNext": true' src/data/events.ts      # expect 1
grep -c '"mailIntro"' src/data/events.ts          # expect ≥1
```

**Step 6: Checkpoint** — no commit.

---

## Task 3: `validate-csv.mjs` — validation logic (TDD)

**Files:**
- Create: `scripts/validate-csv.mjs`
- Test: `scripts/validate-csv.test.mjs`

Pure `validateRows(rows, posterExists)` returns error strings (empty = valid). `posterExists(relPath)` injected for tests.

**Step 1: Failing tests**

Create `scripts/validate-csv.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRows } from './validate-csv.mjs';

const RAW = 'https://raw.githubusercontent.com/xiaflos/stoa60/main/src/assets/images/posters';
const ok = () => true;

function row(over = {}) {
  return {
    date: '2026-09-19', location: 'underground', organiser: 'stoa60', Title: 'gig',
    band_1: 'AAA', band_2: 'BBB', band_3: '', band_4: '', band_5: '', band_6: '',
    poster_url: `${RAW}/2025-2026/2026-09-19_aaa.jpg`,
    links: 'AAA=https://aaa.bandcamp.com', is_next: '', mailIntro: '', descriptions: '', ...over,
  };
}

test('valid row → no errors', () => assert.deepEqual(validateRows([row()], ok), []));

test('bad date reported', () => {
  assert.match(validateRows([row({ date: '19/09/2026' })], ok)[0], /date/i);
});

test('two is_next reported', () => {
  const e = validateRows([row({ is_next: 'true' }), row({ date: '2026-10-01', is_next: 'true' })], ok);
  assert.ok(e.some(x => /is_next/i.test(x)));
});

test('link key not a band reported', () => {
  assert.ok(validateRows([row({ links: 'GHOST=https://x.com' })], ok).some(x => /GHOST/.test(x)));
});

test('description key not a band reported', () => {
  assert.ok(validateRows([row({ descriptions: 'GHOST=hello' })], ok).some(x => /GHOST/.test(x)));
});

test('missing poster file reported', () => {
  assert.ok(validateRows([row()], () => false).some(x => /poster/i.test(x)));
});

test('empty poster_url reported', () => {
  assert.ok(validateRows([row({ poster_url: '' })], ok).some(x => /poster/i.test(x)));
});
```

**Step 2: Run — confirm fail**

```bash
node --test scripts/validate-csv.test.mjs
```
Expected: FAIL (module not found).

**Step 3: Implement**

```js
#!/usr/bin/env node
// scripts/validate-csv.mjs
// Validates tools/event-build/events.csv. validateRows() is pure (fs injected).

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT       = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSV_PATH   = path.join(ROOT, 'tools', 'event-build', 'events.csv');
const POSTERS    = path.join(ROOT, 'src', 'assets', 'images', 'posters');
const GITHUB_RAW = 'https://raw.githubusercontent.com/xiaflos/stoa60/main/src/assets/images/posters';
const BAND_COLS  = ['band_1','band_2','band_3','band_4','band_5','band_6'];

function parseCSVLine(line) {
  const out = []; let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === ',' && !inQ) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur); return out;
}

export function parseCSV(raw) {
  const lines = raw.split(/\r?\n/).filter(l => l.trim());
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? '').trim()]));
  });
}

function urlToPosterPath(url) {
  const prefix = GITHUB_RAW + '/';
  return url && url.startsWith(prefix) ? url.slice(prefix.length) : '';
}

function pairKeys(raw) {
  return (raw || '').split('|')
    .map(p => p.includes('=') ? p.slice(0, p.indexOf('=')).trim() : '')
    .filter(Boolean);
}

export function validateRows(rows, posterExists) {
  const errors = [];
  let nextCount = 0;

  rows.forEach((row, i) => {
    const where = `row ${i + 2} (${row.date || '?'} ${row.location || '?'})`;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date || '')) {
      errors.push(`${where}: date must be YYYY-MM-DD, got "${row.date}"`);
    }

    const flag = String(row.is_next ?? '').trim().toLowerCase();
    if (flag === 'true' || flag === '1' || flag === 'yes') nextCount++;

    const rel = urlToPosterPath((row.poster_url || '').trim());
    if (!rel) errors.push(`${where}: poster_url empty or not a github raw posters URL`);
    else if (!posterExists(rel)) errors.push(`${where}: poster file not found: ${rel}`);

    const bands = new Set(BAND_COLS.map(c => (row[c] || '').trim()).filter(Boolean));
    for (const k of pairKeys(row.links))        if (!bands.has(k)) errors.push(`${where}: link key "${k}" matches no band`);
    for (const k of pairKeys(row.descriptions)) if (!bands.has(k)) errors.push(`${where}: description key "${k}" matches no band`);
  });

  if (nextCount > 1) errors.push(`exactly one row may have is_next=true, found ${nextCount}`);
  return errors;
}

function isMain() { return path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url); }

if (isMain()) {
  const rows = parseCSV(fs.readFileSync(CSV_PATH, 'utf8'));
  const errors = validateRows(rows, rel => fs.existsSync(path.join(POSTERS, rel)));
  if (errors.length) {
    console.error(`✖ events.csv has ${errors.length} problem(s):\n`);
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }
  console.log(`✔ events.csv valid (${rows.length} rows)`);
}
```

**Step 4: Run — confirm pass**

```bash
node --test scripts/validate-csv.test.mjs
```
Expected: PASS (7 tests).

**Step 5: Run against the real CSV**

```bash
node scripts/validate-csv.mjs
```
Expected: `✔ events.csv valid (NNN rows)`. If legacy rows have empty `poster_url`, decide with the user: backfill, or relax the poster check to apply only when `date >= today`. If relaxing, add the date guard + a test before continuing.

**Step 6: Add npm script** — `"validate": "node scripts/validate-csv.mjs"`.

**Step 7: Checkpoint** — no commit.

---

## Task 4: GitHub Action — validate on every push

**Files:**
- Create: `.github/workflows/validate-csv.yml`

```yaml
name: Validate events.csv

on:
  push:
    paths: ['tools/event-build/events.csv', 'src/assets/images/posters/**', 'scripts/**.mjs']
  pull_request:
    paths: ['tools/event-build/events.csv', 'src/assets/images/posters/**']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node --test scripts/*.test.mjs
      - run: node scripts/validate-csv.mjs
```

**Verify (YAML present + non-trivial):**
```bash
node -e "const s=require('fs').readFileSync('.github/workflows/validate-csv.yml','utf8');if(!/jobs:/.test(s))process.exit(1);console.log('workflow ok')"
```
Real execution happens on push — **do not push unless the user asks.**

**Checkpoint** — no commit.

---

## Task 5: `Hero.astro` — show the `is_next` poster

**Files:**
- Modify: `src/components/sections/home/Hero.astro:11` + frontmatter + render site

**Step 1: Replace the hardcoded import with a glob + isNext lookup**

Remove line 11 (`import nextGigPoster from "...Upcoming/2026-05-02_somalhotra.jpg";`). Add to the frontmatter:

```ts
import { events } from "../../../data/events";

const posterModules = import.meta.glob<{ default: ImageMetadata }>(
  "../../../assets/images/posters/**/*.{jpg,jpeg,png,webp}", { eager: true }
);
const PREFIX = "../../../assets/images/posters/";
const postersByPath: Record<string, ImageMetadata> = {};
for (const [full, mod] of Object.entries(posterModules)) {
  postersByPath[full.slice(full.indexOf(PREFIX) + PREFIX.length)] = mod.default;
}

const TODAY = new Date().toISOString().slice(0, 10);
const flagged  = events.find(e => e.isNext);
const upcoming = events.filter(e => e.date >= TODAY && e.poster).sort((a,b)=>a.date.localeCompare(b.date))[0];
const newest   = events.filter(e => e.poster).sort((a,b)=>b.date.localeCompare(a.date))[0];
const featured = flagged ?? upcoming ?? newest;
const nextGigPoster = featured ? postersByPath[featured.poster] : undefined;
```

**Step 2: Guard the render site** (~line 117-122) — wrap the existing `<button id="hero-poster-btn">…</button>` in `{nextGigPoster && ( … )}`, leaving the button's attributes unchanged.

**Step 3: Build & inspect**

```bash
npm run build
```
Open `dist/index.html` — confirm the hero shows the `is_next` gig's poster. If `undefined`, the chosen event's `poster` path doesn't match a globbed file.

**Checkpoint** — no commit.

---

## Task 6: `/admin-helper` — static CSV-row builder (site + mail fields)

**Files:**
- Create: `src/pages/admin-helper.astro`

No layout chrome, no auth, no network. Form JS assembles one escaped CSV line. CSV-escaping mirrors `csvField` in `csv-to-ts.mjs`.

**Step 1: Write the page**

```astro
---
const GITHUB_RAW = "https://raw.githubusercontent.com/xiaflos/stoa60/main/src/assets/images/posters";
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" /><title>stoa60 — event row helper</title>
  <style>
    body{font-family:ui-monospace,monospace;max-width:46rem;margin:2rem auto;padding:0 1rem;background:#111;color:#eee}
    h1{font-size:1.1rem}label{display:block;margin:.6rem 0 .15rem;font-size:.8rem;opacity:.8}
    input,select,textarea{width:100%;padding:.4rem;background:#1c1c1c;color:#eee;border:1px solid #444;border-radius:4px;font:inherit}
    fieldset{border:1px solid #333;margin:1rem 0;padding:.5rem .8rem}
    .row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem}
    button{margin-top:1rem;padding:.5rem 1rem;cursor:pointer;background:#2a2a2a;color:#eee;border:1px solid #555;border-radius:4px}
    #out{white-space:pre-wrap;word-break:break-all;margin-top:1rem;min-height:4rem}small{opacity:.6}
  </style>
</head>
<body>
  <h1>event row helper</h1>
  <small>Fills one <code>events.csv</code> row that drives both the site and the email. Upload the poster JPG to the repo separately and paste its raw URL.</small>

  <div class="row">
    <div><label>date (YYYY-MM-DD)</label><input id="date" placeholder="2026-09-19" /></div>
    <div><label>location</label>
      <select id="location"><option>underground</option><option>karabolas</option><option>voutes</option><option>xenia</option><option>georgiadis</option><option>evangelismos</option><option>walls</option></select>
    </div>
    <div><label>event type (Title)</label><input id="title" value="gig" /></div>
  </div>

  <label>organiser (comma-separated)</label><input id="organiser" value="stoa60" />

  <fieldset><legend>bands — name, link, mail description</legend>
    <div id="bands"></div>
    <button type="button" id="addBand">+ add band</button>
  </fieldset>

  <label>poster raw URL</label>
  <input id="poster" placeholder={`${GITHUB_RAW}/2025-2026/2026-09-19_band.jpg`} />

  <label>mail intro (one-line tagline; leave empty if not sending a mail)</label>
  <input id="mailintro" placeholder="Μυσταγωγίες, drones & beat poetry." />

  <label><input type="checkbox" id="isnext" style="width:auto" /> this is the next gig (is_next)</label>

  <button type="button" id="gen">generate CSV row</button>
  <label>CSV row — copy this</label><div id="out"></div>
  <button type="button" id="copy">copy to clipboard</button>

  <script>
    const MAX = 6;
    const bandsEl = document.getElementById('bands');
    function addBand() {
      const n = bandsEl.children.length + 1; if (n > MAX) return;
      const div = document.createElement('div'); div.className = 'row';
      div.innerHTML = `
        <input placeholder="band ${n} name" data-band="${n}" />
        <input placeholder="link URL" data-link="${n}" />
        <input placeholder="mail description (<br> allowed)" data-desc="${n}" />`;
      bandsEl.appendChild(div);
    }
    addBand(); document.getElementById('addBand').onclick = addBand;

    function csvField(v){ const s=String(v??''); return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; }
    function pairs(names, vals){ return names.map((nm,i)=> nm&&vals[i] ? `${nm}=${vals[i]}` : '').filter(Boolean).join('|'); }

    function generate() {
      const val = id => (document.getElementById(id).value || '').trim();
      const names = [...bandsEl.querySelectorAll('[data-band]')].map(i=>i.value.trim());
      const links = [...bandsEl.querySelectorAll('[data-link]')].map(i=>i.value.trim());
      const descs = [...bandsEl.querySelectorAll('[data-desc]')].map(i=>i.value.trim());
      const bandCols = Array.from({length:MAX},(_,i)=>names[i]||'');
      const fields = [
        val('date'), val('location'), val('organiser'), val('title'),
        ...bandCols, val('poster'),
        pairs(names, links),                       // links
        document.getElementById('isnext').checked ? 'true' : '',  // is_next
        val('mailintro'),                          // mailIntro
        pairs(names, descs),                       // descriptions
      ];
      document.getElementById('out').textContent = fields.map(csvField).join(',');
    }
    document.getElementById('gen').onclick = generate;
    document.getElementById('copy').onclick = async () => {
      const t = document.getElementById('out').textContent; if (t) await navigator.clipboard.writeText(t);
    };
  </script>
</body>
</html>
```

**Step 2: Build & inspect**

```bash
npm run build
```
Open `dist/admin-helper/index.html`, fill it, click *generate* — confirm one comma-separated line with bands in the right columns, `links` and `descriptions` pipe-joined, `mailIntro` present.

**Step 3: Cross-check against the validator** — append a generated row to a scratch CSV copy, run `node scripts/validate-csv.mjs`, then `git checkout tools/event-build/events.csv`.

**Checkpoint** — no commit.

---

## Task 7: `build-mail.mjs` — generate the HTML email (TDD)

**Files:**
- Create: `scripts/build-mail.mjs`
- Test: `scripts/build-mail.test.mjs`

Reads `src/data/events.ts` (JSON-extract trick), finds the event by date, errors if it isn't mail-ready (`mailIntro` + `bandDescriptions` required), renders an HTML email mirroring `tools/event-build/newsletters/2026-05-16_kathares-arkoudes.html`, and writes `tools/event-build/newsletters/<slug>.html` where `<slug>` = the poster filename without extension. Refuses to overwrite unless `--force`.

**Design notes baked in (from `2026-05-23-mail-fields-in-csv-design.md`):**
- Poster in the email uses the **raw GitHub URL** (`${GITHUB_RAW}/${poster}`) — deliberately decoupled from Astro's optimized output. Tradeoff: larger image in inboxes. (The existing hand-written sample used an `_astro/*.webp` URL; we accept the raw-URL difference for zero build coupling.)
- One link per band; label derived from the link hostname.
- Sign-off and unsubscribe are template constants.

**Step 1: Failing tests for the pure helpers (`linkLabel`, `slugFromPoster`)**

Create `scripts/build-mail.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkLabel, slugFromPoster } from './build-mail.mjs';

test('linkLabel', () => {
  assert.equal(linkLabel('https://katharoschalkos.bandcamp.com/album/-'), 'katharoschalkos.bandcamp.com');
  assert.equal(linkLabel('https://www.youtube.com/watch?v=x'), 'youtube');
  assert.equal(linkLabel('https://youtu.be/x'), 'youtube');
  assert.equal(linkLabel('https://www.facebook.com/p/x'), 'facebook');
  assert.equal(linkLabel('https://example.org/band'), 'example.org');
});

test('slugFromPoster', () => {
  assert.equal(slugFromPoster('2025-2026/2026-05-16_kathares-arkoudes.jpg'), '2026-05-16_kathares-arkoudes');
});
```

**Step 2: Run — confirm fail**

```bash
node --test scripts/build-mail.test.mjs
```
Expected: FAIL (module not found).

**Step 3: Implement `build-mail.mjs`**

```js
#!/usr/bin/env node
// scripts/build-mail.mjs <YYYY-MM-DD> [--location <loc>] [--force]
// Renders a gig-announcement email from a mail-ready event in src/data/events.ts.

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT       = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TS_PATH    = path.join(ROOT, 'src', 'data', 'events.ts');
const OUT_DIR    = path.join(ROOT, 'tools', 'event-build', 'newsletters');
const GITHUB_RAW = 'https://raw.githubusercontent.com/xiaflos/stoa60/main/src/assets/images/posters';

const SIGN_OFF    = 'Στηρίζουμε το κουτί, σεβόμαστε τη γειτονιά.';
const UNSUB_EMAIL = 'stoasucks@riseup.net';

export function linkLabel(url) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, '');
    if (h.endsWith('bandcamp.com')) return h;
    if (h === 'youtube.com' || h === 'youtu.be') return 'youtube';
    if (h === 'facebook.com') return 'facebook';
    return h;
  } catch { return url; }
}

export function slugFromPoster(poster) {
  return path.basename(poster).replace(/\.[^.]+$/, '');
}

function loadEvents() {
  const raw = fs.readFileSync(TS_PATH, 'utf8');
  const s = raw.indexOf('= ['), e = raw.lastIndexOf('];');
  return JSON.parse(raw.slice(s + 2, e + 1));
}

const F = "font-family:'Courier New',Courier,monospace;";

function bandBlock(ev) {
  return ev.bands.map(name => {
    const link = ev.bandLinks?.[name];
    const desc = ev.bandDescriptions?.[name] ?? '';
    const linkHtml = link
      ? `<p style="margin:0 0 12px;"><a href="${link}" style="${F}font-size:11px;letter-spacing:0.1em;color:rgba(250,249,247,0.45);text-decoration:none;border-bottom:1px solid rgba(250,249,247,0.2);">${linkLabel(link)}</a></p>`
      : '';
    return `
          <tr><td style="padding-bottom:28px;border-top:1px solid rgba(250,249,247,0.12);padding-top:24px;text-align:center;">
            <p style="margin:0 0 4px;${F}font-size:18px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;color:#faf9f7;">${name}</p>
            ${linkHtml}
            <p style="margin:0;${F}font-size:13px;line-height:1.75;color:rgba(250,249,247,0.75);">${desc}</p>
          </td></tr>`;
  }).join('');
}

export function renderEmail(ev) {
  const posterUrl = `${GITHUB_RAW}/${ev.poster}`;
  return `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>STOA60</title></head>
<body style="margin:0;padding:0;background-color:#1a1714;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1714;"><tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">
      <tr><td style="padding-bottom:24px;text-align:center;">
        <a href="https://stoa60.net" style="${F}font-size:40px;font-weight:bold;letter-spacing:0.05em;color:#faf9f7;text-decoration:none;display:block;line-height:1.1;">STOA60</a>
        <span style="${F}font-size:18px;font-weight:bold;letter-spacing:0.05em;color:#faf9f7;text-transform:uppercase;display:block;margin-top:4px;">GIG ALERT</span>
      </td></tr>
      <tr><td style="padding-bottom:28px;text-align:center;border-bottom:1px solid rgba(250,249,247,0.2);">
        <img src="${posterUrl}" alt="${ev.rawTitle}" width="320" style="max-width:100%;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="padding:28px 0;text-align:center;">
        <p style="margin:0;${F}font-size:14px;line-height:1.7;color:#faf9f7;">${ev.mailIntro}</p>
      </td></tr>
      ${bandBlock(ev)}
      <tr><td style="padding-bottom:36px;border-top:1px solid rgba(250,249,247,0.12);padding-top:24px;text-align:center;">
        <p style="margin:0;${F}font-size:13px;line-height:1.75;color:rgba(250,249,247,0.75);">${SIGN_OFF}</p>
      </td></tr>
      <tr><td style="border-top:1px solid rgba(250,249,247,0.2);padding-top:24px;text-align:center;">
        <p style="margin:0;${F}font-size:12px;line-height:1.8;color:rgba(250,249,247,0.4);">To unsubscribe,<br />send a blank email to <a href="mailto:${UNSUB_EMAIL}" style="color:rgba(250,249,247,0.4);text-decoration:none;border-bottom:1px solid rgba(250,249,247,0.2);">${UNSUB_EMAIL}</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>
`;
}

function isMain() { return path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url); }

if (isMain()) {
  const args = process.argv.slice(2);
  const date = args.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
  const force = args.includes('--force');
  const loc = args[args.indexOf('--location') + 1];
  if (!date) { console.error('usage: build-mail.mjs <YYYY-MM-DD> [--location <loc>] [--force]'); process.exit(1); }

  let matches = loadEvents().filter(e => e.date === date);
  if (loc) matches = matches.filter(e => e.location === loc);
  if (matches.length === 0) { console.error(`No event for ${date}${loc ? ' @ ' + loc : ''}`); process.exit(1); }
  if (matches.length > 1)  { console.error(`Multiple events on ${date}; pass --location ${matches.map(m=>m.location).join('|')}`); process.exit(1); }

  const ev = matches[0];
  if (!ev.mailIntro || !ev.bandDescriptions) {
    console.error(`Event ${date} is not mail-ready (needs mailIntro + descriptions in the CSV).`); process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, slugFromPoster(ev.poster) + '.html');
  if (fs.existsSync(out) && !force) { console.error(`Refusing to overwrite ${out} (use --force)`); process.exit(1); }
  fs.writeFileSync(out, renderEmail(ev), 'utf8');
  console.log(`✔ wrote ${path.relative(ROOT, out)}`);
}
```

**Step 4: Run — confirm pass**

```bash
node --test scripts/build-mail.test.mjs
```
Expected: PASS.

**Step 5: Generate a real email and eyeball it**

Using the mail-ready row added in Task 2 Step 5:
```bash
npm run gen                      # ensure events.ts reflects the CSV
node scripts/build-mail.mjs <that-date> --force
```
Open the produced `tools/event-build/newsletters/<slug>.html` in a browser. Compare against `2026-05-16_kathares-arkoudes.html`: same dark layout, poster, intro, one block per band with a link label + description, sign-off, unsubscribe.

**Step 6: Add an npm script** — `"mail": "node scripts/build-mail.mjs"` (call as `npm run mail -- 2026-09-19 --force`).

**Checkpoint** — no commit.

---

## Task 8: End-to-end verification

**Step 1: Full clean build** — `npm run build` (csv-to-ts runs, then Astro; no missing-asset warnings).

**Step 2: All checks**
```bash
node --test scripts/*.test.mjs
node scripts/validate-csv.mjs
```
Expected: all tests pass; `✔ events.csv valid`.

**Step 3: Invariant** — `grep -c '"isNext": true' src/data/events.ts` → `1`.

**Step 4: Simulate the full editor flow once (locally, no commit)**
1. Open `dist/admin-helper/index.html`; build a row for a fake future gig (poster_url → an existing poster; fill mailIntro + descriptions; tick next-gig).
2. Append to `events.csv`; clear the previously-flagged `is_next`.
3. `node scripts/validate-csv.mjs` → valid.
4. `npm run build` → hero in `dist/index.html` shows that gig's poster.
5. `node scripts/build-mail.mjs <date> --force` → open the generated email.
6. Revert: `git checkout tools/event-build/events.csv src/data/events.ts`; delete the scratch newsletter file.

**Step 5: Hand off** — summarise: build regenerates `events.ts` from CSV; `/admin-helper` builds rows; CI validates on push; `build-mail.mjs` renders the email. Confirm before any commit or push.

---

## Done — and what stays manual by design

- **Sending the email.** `build-mail.mjs` only *generates* HTML. You open it, copy, and paste into the mailing-list tool. (No mailing-list credentials in the repo — deliberate.)
- **Running `build-mail.mjs`.** It's a one-line local command per gig (not part of the Netlify build, since the site doesn't need it). The editor — or whoever sends the mail — runs it locally.
- **Flipping the previous `is_next` to false.** Manual; the validator enforces "at most one," so a slip fails CI instead of shipping.
- **Poster upload.** Via GitHub drag-drop; the helper only takes the raw URL.
- **Auth on `/admin-helper`.** None needed; it emits text only and carries `noindex`. Exclude it from the build later if you'd rather it not ship publicly.
- **Upgrade path** to a one-click custom `/admin` with GitHub OAuth (shelved plan) — data shape is unchanged, so it stays a drop-in upgrade.
```
