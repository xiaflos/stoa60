# Stoa60 Events Database & Past-Events Calendar — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single TypeScript event database (`src/data/events.ts`) from the existing Excel sheet + poster archive, then wire the homepage calendar to display every event past and upcoming.

**Architecture:** A Node ESM generator script (`scripts/build-events.mjs`) reads the xlsx + walks every poster folder, reconciles dates between the two (with day/month-swap correction), emits a typed array to `src/data/events.ts`, and writes three audit logs for manual review. The Astro homepage `Hero.astro` swaps its inline gig array for an import from this file, partitions into past + upcoming, and renders past events as a scrollable history grouped by year and month.

**Tech Stack:** Astro 6.1, Tailwind v4, Node ESM script, `exceljs` (Excel reader). No test framework set up — verification is by running the generator and inspecting outputs.

**Project rules in effect (from `CLAUDE.md`):**
- Work directly on `main`, no new branches.
- **No git commits unless the user explicitly asks.** The "Commit" step at the end of each task is intentionally a checkpoint, not a `git commit`.
- **Do not run the dev server.** Use `npm run build` only when the design doc says to verify.

**Design doc:** `docs/plans/2026-05-21-events-database-design.md`

---

## Reference: data shape (recap from design doc)

```ts
// src/data/events.ts (generated)
export type Location =
  | 'stoa60' | 'karabolas' | 'bar' | 'ba2037'
  | 'voutes' | 'xenia' | 'georgiadis';

export interface Event {
  date: string;                  // "YYYY-MM-DD"
  bands: string[];
  rawTitle: string;
  location: Location;
  poster: string;                // path relative to src/assets/images/posters/
  recordings?: { name: string; url: string }[];
  tags?: string[];
}

export const events: Event[] = [ /* newest → oldest */ ];
```

Color → Location map (hard-coded in generator):
```
""           → stoa60
"FFA4C2F4"   → karabolas
"FFEAD1DC"   → bar
"FFD0E0E3"   → ba2037
"FFB6D7A8"   → voutes
"FFE06666"   → xenia
"FFF1C232"   → georgiadis
"FFFFD966"   → georgiadis
```

Location → poster folder map:
```
stoa60      → season folder by date (see logic in Task 4)
karabolas   → KARABOLAS
bar         → BAR
ba2037      → BA2037
voutes      → VOUTES
xenia       → XENIA
georgiadis  → GEORGIADIS
```

Season folder lookup for `stoa60`: the season runs Sep–Aug. A gig on
`2024-10-05` belongs to season `2024-2025`; a gig on `2024-05-09` belongs to
`2023-2024`. Formula: if `month ≥ 9`, season is `YYYY-(YYYY+1)`, else
`(YYYY-1)-YYYY`. Exception: the folder `2020-2021` does not exist (covid
gap); events found in that range must map to `2021-2022` if the poster
lives there, otherwise be flagged.

---

## Task 1: Scaffold repo additions

**Files:**
- Create: `data/.gitkeep`
- Create: `data/Event Calendar stoa60.xlsx` (copy from `C:\Users\asmol\Desktop\Event Calendar stoa60.xlsx`)
- Create: `tools/event-build/.gitkeep`
- Modify: `.gitignore`

**Step 1: Create directories and copy the xlsx**

```bash
mkdir -p data tools/event-build
cp "/c/Users/asmol/Desktop/Event Calendar stoa60.xlsx" "data/Event Calendar stoa60.xlsx"
touch tools/event-build/.gitkeep
```

**Step 2: Update `.gitignore` to keep the source data + logs out of git**

Append to `.gitignore`:
```
# Events DB build artifacts
/data/*.xlsx
/tools/event-build/*.log
```

Keep `.gitkeep` files tracked so the dirs survive.

**Step 3: Verify**

```bash
ls "data/Event Calendar stoa60.xlsx" && ls tools/event-build/.gitkeep
```
Expected: both paths print, no error.

```bash
git check-ignore -v "data/Event Calendar stoa60.xlsx" "tools/event-build/dummy.log"
```
Expected: both lines show the rule matched in `.gitignore`.

**Step 4: Checkpoint**

Don't commit. Move on.

---

## Task 2: Install `exceljs`

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Install as devDependency**

```bash
npm install --save-dev exceljs
```

**Step 2: Verify**

```bash
node -e "import('exceljs').then(m => console.log('exceljs', m.default ? 'ok' : 'missing default'))"
```
Expected: `exceljs ok`.

**Step 3: Checkpoint** — no commit.

---

## Task 3: Generator skeleton with constants

**Files:**
- Create: `scripts/build-events.mjs`

**Step 1: Write the skeleton — color map, location map, and entry point**

```js
#!/usr/bin/env node
// scripts/build-events.mjs
// Reads data/Event Calendar stoa60.xlsx + src/assets/images/posters/,
// emits src/data/events.ts and three audit logs under tools/event-build/.
//
// Re-run whenever posters are added or the xlsx is updated.

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const XLSX_PATH    = path.join(ROOT, 'data', 'Event Calendar stoa60.xlsx');
const POSTERS_ROOT = path.join(ROOT, 'src', 'assets', 'images', 'posters');
const OUTPUT_TS    = path.join(ROOT, 'src', 'data', 'events.ts');
const LOG_DIR      = path.join(ROOT, 'tools', 'event-build');

const COLOR_TO_LOCATION = {
  '':         'stoa60',
  '00000000': 'stoa60',
  'FFA4C2F4': 'karabolas',
  'FFEAD1DC': 'bar',
  'FFD0E0E3': 'ba2037',
  'FFB6D7A8': 'voutes',
  'FFE06666': 'xenia',
  'FFF1C232': 'georgiadis',
  'FFFFD966': 'georgiadis',
};

const LOCATION_FOLDER = {
  karabolas:  'KARABOLAS',
  bar:        'BAR',
  ba2037:     'BA2037',
  voutes:     'VOUTES',
  xenia:      'XENIA',
  georgiadis: 'GEORGIADIS',
  // stoa60 resolves dynamically via seasonFolder()
};

function seasonFolder(isoDate) {
  const [y, m] = isoDate.split('-').map(Number);
  const startYear = m >= 9 ? y : y - 1;
  return `${startYear}-${startYear + 1}`;
}

async function main() {
  console.log('TODO: pipeline');
}

main().catch(err => { console.error(err); process.exit(1); });
```

**Step 2: Add an npm script**

Modify `package.json` — under `"scripts"` add:
```json
"build:events": "node scripts/build-events.mjs"
```

**Step 3: Verify it runs**

```bash
npm run build:events
```
Expected: prints `TODO: pipeline` and exits 0.

**Step 4: Checkpoint** — no commit.

---

## Task 4: Poster indexer

**Files:**
- Modify: `scripts/build-events.mjs`

**Step 1: Add an indexer that walks all poster folders**

Insert above `main()`:

```js
const POSTER_FILE_RE = /^(\d{4})-(\d{2})-(\d{2})[_-](.+)\.(jpe?g|png|webp)$/i;

/**
 * Walk POSTERS_ROOT and produce:
 *   index[location] = Map<ISODate, { filename, relPath, folder }>
 * For 'stoa60', the key is the ISO date; folder is the season folder.
 * Returns also `allPosters` array for orphan detection.
 */
async function buildPosterIndex() {
  const folders = await fs.readdir(POSTERS_ROOT, { withFileTypes: true });
  const index = {
    stoa60: new Map(), karabolas: new Map(), bar: new Map(),
    ba2037: new Map(), voutes: new Map(), xenia: new Map(),
    georgiadis: new Map(),
  };
  const allPosters = [];   // {location, date, relPath}
  const folderToLocation = Object.fromEntries(
    Object.entries(LOCATION_FOLDER).map(([loc, folder]) => [folder, loc])
  );

  for (const entry of folders) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'Upcoming') continue;  // handled separately, not part of archive

    const folder = entry.name;
    const isSeason = /^\d{4}-\d{4}$/.test(folder);
    const location = isSeason ? 'stoa60' : folderToLocation[folder];
    if (!location) {
      console.warn(`[indexer] unknown folder: ${folder}`);
      continue;
    }

    const files = await fs.readdir(path.join(POSTERS_ROOT, folder));
    for (const file of files) {
      const m = POSTER_FILE_RE.exec(file);
      if (!m) {
        console.warn(`[indexer] unparseable filename: ${folder}/${file}`);
        continue;
      }
      const iso = `${m[1]}-${m[2]}-${m[3]}`;
      const relPath = `${folder}/${file}`;
      const record = { filename: file, relPath, folder };

      if (index[location].has(iso)) {
        console.warn(`[indexer] duplicate date in ${location}: ${iso} (${file} vs ${index[location].get(iso).filename})`);
      }
      index[location].set(iso, record);
      allPosters.push({ location, date: iso, relPath });
    }
  }
  return { index, allPosters };
}
```

**Step 2: Wire into `main()`**

Replace the `TODO` line in `main()`:

```js
const { index, allPosters } = await buildPosterIndex();
console.log(`[indexer] indexed ${allPosters.length} posters`);
for (const [loc, map] of Object.entries(index)) {
  console.log(`  ${loc}: ${map.size}`);
}
```

**Step 3: Verify**

```bash
npm run build:events
```
Expected: total posters ~291, breakdown roughly:
```
stoa60: 222
karabolas: 18
bar: 13
ba2037: 16
voutes: 12
xenia: 4
georgiadis: 5
```

If any folder warns about unparseable filenames, note them — you'll fix
them after Task 5 by renaming the poster files to match the
`YYYY-MM-DD_*` pattern.

**Step 4: Checkpoint** — no commit.

---

## Task 5: Excel reader + row normalization

**Files:**
- Modify: `scripts/build-events.mjs`

**Step 1: Add date and band parsers**

Insert above `main()`:

```js
/** Parse column-B value to ISO date(s). Returns { primary, swapped } where
 *  - primary is the most-likely interpretation
 *  - swapped is the day/month-swapped alternative (or null if same / invalid)
 *  Returns null if unparseable.
 */
function parseDateCell(value) {
  if (value == null || value === '') return null;

  // ExcelJS gives Date objects for true date cells.
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = value.getUTCMonth() + 1;
    const d = value.getUTCDate();
    return makeBothInterpretations(y, m, d);
  }

  // Strings like "31/1/2026" or "14/07/2018" or "30/09/2017"
  const s = String(value).trim();
  const m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/.exec(s);
  if (!m) return null;
  const a = Number(m[1]); // assumed day
  const b = Number(m[2]); // assumed month
  const y = Number(m[3]);
  return makeBothInterpretations(y, b, a);
}

function makeBothInterpretations(y, month, day) {
  const primary = toIso(y, month, day);
  if (!primary) return null;
  const swap = (month !== day && month <= 12 && day <= 12) ? toIso(y, day, month) : null;
  return { primary, swapped: swap };
}

function toIso(y, m, d) {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Split column-A title into a band-name array. */
function parseBands(rawTitle) {
  if (!rawTitle) return [];
  // Drop trailing venue marker like " // KARAVOLAS" or "// KARAVOLAS"
  let s = rawTitle.replace(/\s*\/\/\s*(KARAVOLAS|BA2037|VOUTES|XENIA|GEORGIADIS|BAR)\s*$/i, '');
  return s
    .split(/[,&]|\/\/|(?<!:)\s\/\s/)   // commas, ampersands, double-slashes, " / "
    .map(x => x.trim())
    .filter(Boolean);
}
```

**Step 2: Add the Excel reader**

```js
async function readExcelRows() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);
  const ws = wb.worksheets[0];

  const rows = [];
  // Data starts at row 9 (row 8 is "LIVE NAME | DATE" header).
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < 9) return;
    const a = row.getCell(1);
    const b = row.getCell(2);
    if (!a.value && !b.value) return;

    const fillColor =
      (a.fill && a.fill.fgColor && a.fill.fgColor.argb) ||
      (a.fill && a.fill.bgColor && a.fill.bgColor.argb) ||
      '';
    const location = COLOR_TO_LOCATION[fillColor] ?? 'stoa60';
    const rawTitle = String(a.value ?? '').trim();
    const dates = parseDateCell(b.value);

    rows.push({
      rowNumber,
      rawTitle,
      bands: parseBands(rawTitle),
      location,
      fillColor,
      dates, // {primary, swapped} | null
    });
  });
  return rows;
}
```

**Step 3: Wire into `main()`**

Append after the indexer logging:
```js
const rows = await readExcelRows();
console.log(`[excel] ${rows.length} event rows`);
const byLoc = {};
for (const r of rows) byLoc[r.location] = (byLoc[r.location] ?? 0) + 1;
console.log('[excel] by location:', byLoc);
```

**Step 4: Verify**

```bash
npm run build:events
```
Expected: `[excel] 287 event rows` and a breakdown close to:
```
stoa60: 224, karabolas: 17, bar: 15, ba2037: 13, voutes: 8,
xenia: 4, georgiadis: 4
```

If the color picks `fillColor: ''` for everything → ExcelJS may be reading
the color from a different property. Inspect with:
```bash
node -e "
import('exceljs').then(async ExcelJS => {
  const wb = new ExcelJS.default.Workbook();
  await wb.xlsx.readFile('data/Event Calendar stoa60.xlsx');
  const ws = wb.worksheets[0];
  for (let r = 9; r <= 15; r++) {
    const c = ws.getCell(r, 1);
    console.log(r, JSON.stringify(c.fill));
  }
});
"
```
Adjust the `fillColor` extraction in `readExcelRows` accordingly.

**Step 5: Checkpoint** — no commit.

---

## Task 6: Match events to posters with day/month-swap fallback

**Files:**
- Modify: `scripts/build-events.mjs`

**Step 1: Add the matcher**

Insert above `main()`:

```js
/**
 * Try to find a poster for an Excel row.
 * Returns { matched: posterRecord, usedDate: iso, swapped: bool }
 * or { matched: null, reason } if nothing fits.
 */
function matchRow(row, index) {
  if (!row.dates) return { matched: null, reason: 'no-date' };

  const tryDate = (iso) => {
    if (!iso) return null;
    const map = index[row.location];
    if (!map) return null;
    return map.get(iso) ?? null;
  };

  // 1) try primary
  const primaryHit = tryDate(row.dates.primary);
  if (primaryHit) return { matched: primaryHit, usedDate: row.dates.primary, swapped: false };

  // 2) try swapped (only if it's a different valid date)
  if (row.dates.swapped) {
    const swapHit = tryDate(row.dates.swapped);
    if (swapHit) return { matched: swapHit, usedDate: row.dates.swapped, swapped: true };
  }

  return { matched: null, reason: 'no-poster' };
}
```

**Step 2: Wire into `main()`**

Append:

```js
const matches = [];        // { row, poster, usedDate, swapped }
const unmatched = [];      // { row, reason }

for (const row of rows) {
  const r = matchRow(row, index);
  if (r.matched) matches.push({ row, ...r });
  else unmatched.push({ row, reason: r.reason });
}

const swappedCount = matches.filter(m => m.swapped).length;
console.log(`[match] ${matches.length}/${rows.length} matched, ${swappedCount} via day/month swap, ${unmatched.length} unmatched`);
```

**Step 3: Verify**

```bash
npm run build:events
```
Expected: a large fraction matched (likely 250+/287); the rest will go to
the unmatched log in the next task. Note the swap count — if it's
implausibly high (>30) the date parsing is probably backwards; investigate.

**Step 4: Checkpoint** — no commit.

---

## Task 7: Detect orphan posters, emit logs

**Files:**
- Modify: `scripts/build-events.mjs`

**Step 1: Add orphan detection and log writers**

Insert above `main()`:

```js
function findOrphans(allPosters, matches) {
  const claimed = new Set(matches.map(m => `${m.row.location}|${m.matched.relPath}`));
  return allPosters.filter(p => !claimed.has(`${p.location}|${p.relPath}`));
}

async function writeLog(filename, lines) {
  const file = path.join(LOG_DIR, filename);
  if (lines.length === 0) {
    await fs.writeFile(file, '(none)\n', 'utf8');
  } else {
    await fs.writeFile(file, lines.join('\n') + '\n', 'utf8');
  }
  console.log(`  wrote ${filename} (${lines.length} entries)`);
}
```

**Step 2: Append log writing to `main()`**

```js
await fs.mkdir(LOG_DIR, { recursive: true });

const correctionLines = matches
  .filter(m => m.swapped)
  .map(m => `R${m.row.rowNumber}  ${m.row.dates.primary} → ${m.usedDate}  [${m.row.location}]  ${m.row.rawTitle}  →  ${m.matched.relPath}`);

const unmatchedLines = unmatched.map(u => {
  const { row, reason } = u;
  const dates = row.dates ? `${row.dates.primary}${row.dates.swapped ? ' or ' + row.dates.swapped : ''}` : '(no date)';
  return `R${row.rowNumber}  [${row.location}]  date=${dates}  reason=${reason}  title=${row.rawTitle}`;
});

const orphans = findOrphans(allPosters, matches);
const orphanLines = orphans.map(p => `[${p.location}]  ${p.date}  ${p.relPath}`);

await writeLog('date-corrections.log', correctionLines);
await writeLog('unmatched-events.log', unmatchedLines);
await writeLog('orphan-posters.log',   orphanLines);
```

**Step 3: Verify**

```bash
npm run build:events
ls -la tools/event-build/
```
Expected: three `.log` files exist. Open each one — they should contain
human-readable diagnostic lines (or `(none)`).

```bash
head -20 tools/event-build/date-corrections.log
head -20 tools/event-build/unmatched-events.log
head -20 tools/event-build/orphan-posters.log
```

**Step 4: Checkpoint** — no commit.

---

## Task 8: Emit `src/data/events.ts`

**Files:**
- Modify: `scripts/build-events.mjs`
- Create: `src/data/events.ts` (generated)

**Step 1: Add the TS emitter**

Insert above `main()`:

```js
function buildEventList(matches, orphans) {
  // Matched events
  const matched = matches.map(m => ({
    date:      m.usedDate,
    bands:     m.row.bands,
    rawTitle:  m.row.rawTitle,
    location:  m.row.location,
    poster:    m.matched.relPath,
  }));

  // Orphan posters → included with empty bands/title
  const orphanEvents = orphans.map(p => ({
    date:     p.date,
    bands:    [],
    rawTitle: '',
    location: p.location,
    poster:   p.relPath,
  }));

  const all = [...matched, ...orphanEvents];
  // Sort newest first, then by location for stable output
  all.sort((a, b) => b.date.localeCompare(a.date) || a.location.localeCompare(b.location));
  return all;
}

function serializeTs(events) {
  const HEADER = `// AUTO-GENERATED by scripts/build-events.mjs — do not edit by hand.
// Re-run \`npm run build:events\` to regenerate.

export type Location =
  | 'stoa60' | 'karabolas' | 'bar' | 'ba2037'
  | 'voutes' | 'xenia' | 'georgiadis';

export interface Recording { name: string; url: string; }

export interface Event {
  date: string;
  bands: string[];
  rawTitle: string;
  location: Location;
  poster: string;
  recordings?: Recording[];
  tags?: string[];
}

export const events: Event[] = `;

  const body = JSON.stringify(events, null, 2);
  return HEADER + body + ';\n';
}
```

**Step 2: Append to `main()`**

```js
const eventList = buildEventList(matches, orphans);
await fs.mkdir(path.dirname(OUTPUT_TS), { recursive: true });
await fs.writeFile(OUTPUT_TS, serializeTs(eventList), 'utf8');
console.log(`[emit] wrote ${OUTPUT_TS} (${eventList.length} events)`);
```

**Step 3: Verify**

```bash
npm run build:events
head -30 src/data/events.ts
wc -l src/data/events.ts
```
Expected: header present, JSON-shaped array of objects, ~290–300 entries.

**Step 4: Type-check**

```bash
npx astro check
```
Expected: zero errors related to `src/data/events.ts`.

**Step 5: Checkpoint** — no commit.

---

## Task 9: User review checkpoint

This task is a **stop-and-review** — no code changes.

**Step 1: Send the user a summary**

Tell the user:
- counts (matched / corrected / unmatched / orphans)
- locations of the three log files
- Ask them to skim `unmatched-events.log` and `orphan-posters.log` and
  either (a) accept as-is, (b) fix the source data (rename a poster, edit
  a row in the xlsx) then re-run `npm run build:events`.

**Step 2: Wait for explicit "go" before proceeding to Task 10.**

If the user changes the xlsx or renames any poster files, re-run the
generator and re-show the logs. Loop until they say go.

---

## Task 10: Hero.astro — import the events module

**Files:**
- Modify: `src/components/sections/home/Hero.astro` (top of frontmatter)

**Step 1: Replace the inline `entries` array**

In `Hero.astro` frontmatter:

- Remove the entire `interface Band`, `interface Gig`, `interface Screening`,
  `type CalendarEntry`, and the hand-written `const entries: CalendarEntry[] = [...]`.
- Add at the top of the script block:
  ```ts
  import { events, type Event, type Location } from "../../../data/events";
  ```

**Step 2: Add the partition + grouping logic**

Replace the existing `monthLabels`, `MAX_ENTRIES`, `visibleEntries`,
and `entriesByMonth` block with:

```ts
const TODAY = new Date().toISOString().slice(0, 10);

// Past = strictly before today, sorted newest first.
// Upcoming = today or later, sorted soonest first.
const past = events
  .filter(e => e.date < TODAY)
  .sort((a, b) => b.date.localeCompare(a.date));
const upcoming = events
  .filter(e => e.date >= TODAY)
  .sort((a, b) => a.date.localeCompare(b.date));

const MONTH_KEYS = [
  'cal.january','cal.february','cal.march','cal.april','cal.may','cal.june',
  'cal.july','cal.august','cal.september','cal.october','cal.november','cal.december',
];
const MONTH_LABELS_EL: Record<string, string> = {
  'cal.january':   'Ιανουάριος',
  'cal.february':  'Φεβρουάριος',
  'cal.march':     'Μάρτιος',
  'cal.april':     'Απρίλιος',
  'cal.may':       'Μάιος',
  'cal.june':      'Ιούνιος',
  'cal.july':      'Ιούλιος',
  'cal.august':    'Αύγουστος',
  'cal.september': 'Σεπτέμβριος',
  'cal.october':   'Οκτώβριος',
  'cal.november':  'Νοέμβριος',
  'cal.december':  'Δεκέμβριος',
};

const LOCATION_LABEL: Record<Location, string> = {
  stoa60:     'STOA60',
  karabolas:  'KARAVOLAS',
  bar:        'BAR',
  ba2037:     'BA2037',
  voutes:     'VOUTES',
  xenia:      'XENIA',
  georgiadis: 'GEORGIADIS',
};

function isoToParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, monthIndex: m - 1, day: d };
}

/** Group events by year → month, preserving the input order within each month. */
function groupByYearMonth(list: Event[]) {
  const out: { year: number; months: { monthKey: string; events: Event[] }[] }[] = [];
  for (const e of list) {
    const { year, monthIndex } = isoToParts(e.date);
    let yearGroup = out.find(g => g.year === year);
    if (!yearGroup) { yearGroup = { year, months: [] }; out.push(yearGroup); }
    const monthKey = MONTH_KEYS[monthIndex];
    let monthGroup = yearGroup.months.find(m => m.monthKey === monthKey);
    if (!monthGroup) { monthGroup = { monthKey, events: [] }; yearGroup.months.push(monthGroup); }
    monthGroup.events.push(e);
  }
  return out;
}

const upcomingGroups = groupByYearMonth(upcoming);
const pastGroups     = groupByYearMonth(past);
```

**Step 3: Verify it compiles (build only — do NOT run dev)**

```bash
npm run build
```
Expected: build succeeds. Visual output will look broken until Task 11.
That's fine. If the build fails on type errors, fix them and re-run.

**Step 4: Checkpoint** — no commit.

---

## Task 11: Hero.astro — render upcoming + past

**Files:**
- Modify: `src/components/sections/home/Hero.astro` (template section)

**Step 1: Replace the calendar markup**

Find the `<!-- 3. Calendar -->` block (currently around lines 128–155).
Replace its inner content (the `.map` over `entriesByMonth`) with two
sections — upcoming then past — sharing one render helper.

Insert this Astro fragment in place of the existing `entriesByMonth.map`:

```astro
{upcomingGroups.map(({ year, months }) => (
  <div class="w-full max-w-md">
    {months.map(({ monthKey, events: monthEvents }) => (
      <div class="mb-4">
        <div class="flex items-baseline gap-2 pb-1">
          <span class="font-bahnschrift font-bold text-sm text-base-900/40 uppercase tracking-widest" data-i18n={monthKey}>
            {MONTH_LABELS_EL[monthKey]} {year}
          </span>
        </div>
        {monthEvents.map(event => {
          const { day } = isoToParts(event.date);
          return (
            <div class="flex items-baseline gap-3 py-1.5 border-b border-base-900/10">
              <span class="font-bahnschrift text-sm text-base-900/70 w-6 text-right">{day}</span>
              <span class="flex-1 min-w-0 font-bahnschrift uppercase text-sm text-base-900 truncate">
                {event.rawTitle || event.bands.join(', ')}
              </span>
              <span class="font-bahnschrift text-[10px] tracking-widest text-base-900/40 uppercase">
                {LOCATION_LABEL[event.location]}
              </span>
            </div>
          );
        })}
      </div>
    ))}
  </div>
))}

{pastGroups.length > 0 && (
  <div class="w-full max-w-md mt-8 pt-6 border-t border-base-900/20">
    <div class="font-bahnschrift text-xs tracking-widest text-base-900/40 uppercase mb-3">Archive</div>
    {pastGroups.map(({ year, months }) => (
      <details class="mb-2">
        <summary class="cursor-pointer font-bahnschrift text-base text-base-900 py-1">
          {year}
        </summary>
        <div class="pl-3 pt-2">
          {months.map(({ monthKey, events: monthEvents }) => (
            <div class="mb-3">
              <div class="font-bahnschrift font-bold text-[11px] text-base-900/40 uppercase tracking-widest pb-1"
                   data-i18n={monthKey}>
                {MONTH_LABELS_EL[monthKey]}
              </div>
              {monthEvents.map(event => {
                const { day } = isoToParts(event.date);
                const display = event.rawTitle || event.bands.join(', ') || '—';
                return (
                  <div class="flex items-baseline gap-3 py-1 border-b border-base-900/5">
                    <span class="font-bahnschrift text-xs text-base-900/60 w-6 text-right">{day}</span>
                    <span class="flex-1 min-w-0 font-bahnschrift uppercase text-xs text-base-900/80 truncate">
                      {display}
                    </span>
                    <span class="font-bahnschrift text-[9px] tracking-widest text-base-900/30 uppercase">
                      {LOCATION_LABEL[event.location]}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </details>
    ))}
  </div>
)}
```

**Step 2: Add i18n keys for the new months**

Open `src/i18n/translations.ts`. Find the existing `cal.*` keys and add
any of `cal.january…cal.december` that don't yet exist, in both languages
the file supports. Mirror the existing pattern exactly.

**Step 3: Build & visually inspect**

```bash
npm run build
```
Expected: zero errors. Then open `dist/index.html` in a browser (no dev
server) — confirm upcoming events render at top and the `Archive`
section appears with collapsible year groups underneath.

If layout is broken, iterate on the Tailwind classes only — do not change
the data flow.

**Step 4: Checkpoint** — no commit.

---

## Task 12: Final verification

**Files:** none

**Step 1: Full build**

```bash
npm run build
```
Expected: clean build, no warnings about missing assets.

**Step 2: Sanity-check the data**

```bash
node -e "
import('./src/data/events.ts').catch(() => {
  // .ts can't be loaded directly — use the json-ish trick
});
" 2>/dev/null || true

# instead: just grep counts
grep -c '\"location\":' src/data/events.ts
grep -c '\"location\": \"stoa60\"' src/data/events.ts
grep -c '\"location\": \"karabolas\"' src/data/events.ts
```
Expected: total ≈ 290–300; stoa60 ≈ 220+; karabolas ≈ 17–18.

**Step 3: Confirm no poster paths 404**

The poster `path` strings in `events.ts` should all exist on disk.
Run:

```bash
node -e "
const fs = require('node:fs');
const re = /\"poster\":\s*\"([^\"]+)\"/g;
const ts = fs.readFileSync('src/data/events.ts', 'utf8');
const root = 'src/assets/images/posters/';
let missing = 0, total = 0, m;
while ((m = re.exec(ts))) {
  total++;
  if (!fs.existsSync(root + m[1])) { console.log('MISSING:', m[1]); missing++; }
}
console.log('checked', total, 'missing', missing);
"
```
Expected: `missing 0`.

**Step 4: Hand off to the user**

Show:
- final event count
- log line counts (`wc -l tools/event-build/*.log`)
- a screenshot or paste of the homepage Archive section

Ask them to confirm before any commit.

---

## Done

After Task 12 is signed off:

- The xlsx in `data/` is now obsolete — keep it gitignored so it doesn't
  ship; you can delete it once `events.ts` is committed.
- Tag system and recording links remain blank fields ready for manual
  editing in `events.ts`.
- A future poster-archive page can import the same `events` array and
  filter by `location` / `tags`.
