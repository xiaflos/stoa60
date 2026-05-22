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
const XLSX_PATH      = path.join(ROOT, 'data', 'Event Calendar stoa60.xlsx');
const POSTERS_ROOT   = path.join(ROOT, 'src', 'assets', 'images', 'posters');
const OUTPUT_TS      = path.join(ROOT, 'src', 'data', 'events.ts');
const LOG_DIR        = path.join(ROOT, 'tools', 'event-build');
const MATCHING_FILE  = path.join(LOG_DIR, 'matching.txt');
const OUTPUT_CSV     = path.join(LOG_DIR, 'events.csv');
const OUTPUT_XLSX    = path.join(LOG_DIR, 'events.xlsx');

const MAX_BANDS = 6;

const COLOR_TO_LOCATION = {
  '':         'underground',
  '00000000': 'underground',
  'FFA4C2F4': 'karabolas',
  'FFEAD1DC': 'bar',
  'FFD0E0E3': 'ba2037',     // organiser tag — normalised to underground in output
  'FFB6D7A8': 'voutes',
  'FFE06666': 'xenia',
  'FFF1C232': 'georgiadis',
  'FFFFD966': 'georgiadis',
};

const LOCATION_FOLDER = {
  karabolas:    'KARABOLAS',
  bar:          'BAR',
  ba2037:       'BA2037',
  voutes:       'VOUTES',
  xenia:        'XENIA',
  georgiadis:   'GEORGIADIS',
  evangelismos: 'EVANGELISMOS',
  // stoa60 resolves dynamically via seasonFolder()
};

function seasonFolder(isoDate) {
  const [y, m] = isoDate.split('-').map(Number);
  const startYear = m >= 9 ? y : y - 1;
  return `${startYear}-${startYear + 1}`;
}

const POSTER_FILE_RE = /^(\d{4})-(\d{2})-(\d{2})[_-](.+)\.(jpe?g|png|webp)$/i;

/**
 * Walk POSTERS_ROOT and produce:
 *   byDate: Map<ISODate, poster[]>  — all posters across all season folders
 *   allPosters: poster[]            — flat list for orphan detection
 *
 * All season-folder posters are indexed as location='underground'.
 * Matching is now purely date-based; location comes from the Excel row color.
 */
async function buildPosterIndex() {
  const byDate    = new Map();   // ISODate → poster[]
  const allPosters = [];         // {location, date, relPath}

  const folders = await fs.readdir(POSTERS_ROOT, { withFileTypes: true });
  for (const entry of folders) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'Upcoming') continue;

    const folder = entry.name;
    const isSeason = /^\d{4}-\d{4}$/.test(folder);
    // After the folder migration all category posters live in season folders.
    // Any remaining non-season, non-Upcoming folder is logged but still indexed.
    const location = isSeason ? 'underground' : (LOCATION_FOLDER[folder.toLowerCase()] ?? 'underground');

    const files = await fs.readdir(path.join(POSTERS_ROOT, folder));
    for (const file of files) {
      const m = POSTER_FILE_RE.exec(file);
      if (!m) {
        console.warn(`[indexer] unparseable filename: ${folder}/${file}`);
        continue;
      }
      const iso    = `${m[1]}-${m[2]}-${m[3]}`;
      const relPath = `${folder}/${file}`;
      const record  = { filename: file, relPath, folder, location, date: iso };

      if (!byDate.has(iso)) byDate.set(iso, []);
      byDate.get(iso).push(record);
      allPosters.push({ location, date: iso, relPath });
    }
  }

  const total = allPosters.length;
  const dups   = [...byDate.values()].filter(v => v.length > 1).length;
  if (dups) console.log(`[indexer] ${dups} dates with multiple posters (will use manual matching)`);
  console.log(`[indexer] indexed ${total} posters across ${byDate.size} dates`);

  return { byDate, allPosters };
}

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

/**
 * Try to find a poster for an Excel row.
 * byDate: Map<ISODate, poster[]>
 * claimed: Set<relPath> — already-matched posters (mutated on success)
 *
 * Returns { matched: posterRecord, usedDate: iso, swapped: bool }
 * or { matched: null, reason } if nothing fits.
 */
function matchRow(row, byDate, claimed) {
  if (!row.dates) return { matched: null, reason: 'no-date' };

  const tryDate = (iso) => {
    if (!iso) return null;
    const posters = byDate.get(iso);
    if (!posters) return null;
    return posters.find(p => !claimed.has(p.relPath)) ?? null;
  };

  // 1) try primary date
  const primaryHit = tryDate(row.dates.primary);
  if (primaryHit) {
    claimed.add(primaryHit.relPath);
    return { matched: primaryHit, usedDate: row.dates.primary, swapped: false };
  }

  // 2) try day/month swapped alternative
  if (row.dates.swapped) {
    const swapHit = tryDate(row.dates.swapped);
    if (swapHit) {
      claimed.add(swapHit.relPath);
      return { matched: swapHit, usedDate: row.dates.swapped, swapped: true };
    }
  }

  return { matched: null, reason: 'no-poster' };
}

function findOrphans(allPosters, claimed) {
  return allPosters.filter(p => !claimed.has(p.relPath));
}

/**
 * Parse the user's manual matching file at tools/event-build/matching.txt.
 *
 * Supported line forms:
 *   • Normal:  [loc]  DATE  folder/file.jpg [R### ...]  [bands=Band1, Band2]
 *   • Skip:    [skip]  R###  [R### ...]
 *   • Comment: # anything
 *
 * R### tokens: last occurrence wins (allows correction without deletion).
 * bands=…   : parsed for orphan-poster band attribution.
 * [skip]    : those Excel rows are excluded from all output.
 *
 * Returns { rowMap, bandOverrides, skipRows }.
 */
async function parseManualMatches() {
  let raw;
  try {
    raw = await fs.readFile(MATCHING_FILE, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return { rowMap: new Map(), bandOverrides: new Map(), skipRows: new Set() };
    throw e;
  }

  const POSTER_RE = /\b([A-Za-z0-9\-]+\/[^\s]+\.(?:jpe?g|png|webp))\b/i;
  const R_RE = /\bR(\d+)\b/g;
  const rowMap              = new Map();  // rowNumber → relPath
  const bandOverrides       = new Map();  // relPath   → string[]
  const locationOverrides   = new Map();  // relPath   → Location string
  const organiserOverrides  = new Map();  // relPath   → Organiser[]
  const skipRows            = new Set();  // rowNumbers to exclude entirely

  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    // [skip] R### lines — mark those Excel rows as intentionally excluded
    if (/^\[skip\]/i.test(line)) {
      for (const m of line.matchAll(R_RE)) skipRows.add(Number(m[1]));
      continue;
    }

    const pm = POSTER_RE.exec(line);
    if (!pm) {
      console.warn(`[manual] line ${i + 1}: no poster path found, skipping`);
      continue;
    }
    const relPath = pm[1];

    // R### → row mapping (last write wins)
    for (const m of line.matchAll(R_RE)) {
      const rowNum = Number(m[1]);
      const prev = rowMap.get(rowNum);
      if (prev && prev !== relPath) {
        console.warn(`[manual] R${rowNum} re-matched (was ${prev}, now ${relPath} on line ${i + 1}); using latest`);
      }
      rowMap.set(rowNum, relPath);
    }

    // bands=Band1, Band2  → band override
    const bm = /\bbands=([^\n\r]+)/i.exec(line);
    if (bm) {
      const bands = bm[1].trim().split(/[,&]|\/\//).map(x => x.trim()).filter(Boolean);
      if (bands.length > 0) bandOverrides.set(relPath, bands);
    }

    // location=<loc>  → location override
    const lm = /\blocation=(\w+)/i.exec(line);
    if (lm) locationOverrides.set(relPath, lm[1]);

    // organiser=tag1,tag2  → organiser override (comma-separated)
    const om = /\borganiser=([^\n\r]+)/i.exec(line);
    if (om) {
      const orgs = om[1].trim().split(',').map(x => x.trim()).filter(Boolean);
      if (orgs.length > 0) organiserOverrides.set(relPath, orgs);
    }
  }
  return { rowMap, bandOverrides, locationOverrides, organiserOverrides, skipRows };
}

/**
 * Apply manual matches: for each (rowNumber → posterRelPath) in rowMap,
 * find the still-unmatched row and the poster, build a match record, and
 * move the row from `unmatched` into `matches`.
 *
 * Rows in skipRows are silently removed from `unmatched` (e.g. COVID marker).
 *
 * The poster's location and date win over the Excel row's. The row's bands
 * and rawTitle are preserved.
 *
 * Runs in TWO passes:
 *  Pass 1 (pre-auto): called before auto-matching with all rows. Rows with a
 *    manual R### mapping are matched immediately and their posters pre-claimed,
 *    so the auto-matcher never sees them.  Returns the set of pre-claimed rowNumbers.
 *  Pass 2 (post-auto): called on the `unmatched` remainder. Handles any manual
 *    matches for rows that had no R### but were skipped, etc.
 *
 * Mutates `matches`, `claimed` in place.
 */
function applyManualMatches(rows, rowMap, allPosters, skipRows, claimed, matches) {
  const posterByRelPath = new Map(allPosters.map(p => [p.relPath, p]));
  const preClaimedRows  = new Set();
  let applied = 0;

  for (const row of rows) {
    if (skipRows.has(row.rowNumber)) { preClaimedRows.add(row.rowNumber); continue; }

    const relPath = rowMap.get(row.rowNumber);
    if (!relPath) continue;

    const poster = posterByRelPath.get(relPath);
    if (!poster) {
      console.warn(`[manual] R${row.rowNumber} → ${relPath}: poster not in index, skipping`);
      continue;
    }

    claimed.add(relPath);
    preClaimedRows.add(row.rowNumber);
    matches.push({
      row,
      matched: poster,
      usedDate: poster.date,
      swapped: false,
      manual: true,
    });
    applied++;
  }

  return { applied, preClaimedRows };
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

/** ba2037 and bar are organiser/sub-venue tags — normalise both to underground in output. */
const normaliseLocation = (loc, override) => {
  const resolved = override ?? loc;
  return (resolved === 'ba2037' || resolved === 'bar') ? 'underground' : resolved;
};

/**
 * Derive the organiser tag(s) from the internal (pre-normalisation) location + date.
 * Returns an array so dual-organiser events (e.g. rastapank+ba2037) are supported.
 *  - ba2037  → ['ba2037']   (BA2037 collective events)
 *  - voutes after 2018-02-17 → ['rastapank']  (Rastapank collective)
 *  - everything else (including bar, underground, etc.) → ['stoa60']
 * Use organiser= in matching.txt to override for specific posters.
 */
function deriveOrganiser(internalLoc, date) {
  if (internalLoc === 'ba2037') return ['ba2037'];
  if (internalLoc === 'voutes' && date > '2018-02-17') return ['rastapank'];
  return ['stoa60'];
}

function buildEventList(matches, orphans, bandOverrides, locationOverrides, organiserOverrides) {
  // Matched events — matching.txt overrides win over Excel when present
  const matched = matches.map(m => {
    const overrideBands = bandOverrides.get(m.matched.relPath);
    const overrideLoc   = locationOverrides.get(m.matched.relPath);
    const overrideOrg   = organiserOverrides.get(m.matched.relPath);
    return {
      date:      m.usedDate,
      bands:     overrideBands ?? m.row.bands,
      rawTitle:  overrideBands ? overrideBands.join(', ') : m.row.rawTitle,
      location:  normaliseLocation(m.row.location, overrideLoc),
      organiser: overrideOrg ?? deriveOrganiser(m.row.location, m.usedDate),
      poster:    m.matched.relPath,
    };
  });

  // Orphan posters — use overrides if provided, otherwise empty/folder-derived
  const orphanEvents = orphans.map(p => {
    const overrideBands = bandOverrides.get(p.relPath);
    const overrideLoc   = locationOverrides.get(p.relPath);
    const overrideOrg   = organiserOverrides.get(p.relPath);
    return {
      date:      p.date,
      bands:     overrideBands ?? [],
      rawTitle:  overrideBands ? overrideBands.join(', ') : '',
      location:  normaliseLocation(p.location, overrideLoc),
      organiser: overrideOrg ?? deriveOrganiser(p.location, p.date),
      poster:    p.relPath,
    };
  });

  const all = [...matched, ...orphanEvents];
  // Sort newest first, then by location for stable output
  all.sort((a, b) => b.date.localeCompare(a.date) || a.location.localeCompare(b.location));
  return all;
}

function serializeTs(events) {
  const HEADER = `// AUTO-GENERATED by scripts/build-events.mjs — do not edit by hand.
// Re-run \`npm run build:events\` to regenerate.

export type Location =
  | 'underground' | 'karabolas'
  | 'voutes' | 'xenia' | 'georgiadis' | 'evangelismos';

export type Organiser = 'stoa60' | 'ba2037' | 'rastapank';

export interface Recording { name: string; url: string; }

export interface Event {
  date: string;
  bands: string[];
  rawTitle: string;
  location: Location;
  organiser: Organiser[];
  poster: string;
  recordings?: Recording[];
}

export const events: Event[] = `;

  const body = JSON.stringify(events, null, 2);
  return HEADER + body + ';\n';
}

/**
 * Export events to:
 *  - tools/event-build/events.csv  — date, location, band_1…band_N
 *  - tools/event-build/events.xlsx — same + link_1…link_N, styled
 */
async function exportSpreadsheet(events) {
  // ── CSV ────────────────────────────────────────────────────────────────────
  const bandHeaders = Array.from({ length: MAX_BANDS }, (_, i) => `band_${i + 1}`);
  const csvHeader   = ['date', 'location', 'organiser', ...bandHeaders].join(',');

  const csvRows = events.map(ev => {
    const cells = [ev.date, ev.location, (ev.organiser ?? []).join(';')];
    for (let i = 0; i < MAX_BANDS; i++) {
      const b = ev.bands[i] ?? '';
      // Wrap in quotes if the value contains a comma
      cells.push(b.includes(',') ? `"${b.replace(/"/g, '""')}"` : b);
    }
    return cells.join(',');
  });

  await fs.writeFile(OUTPUT_CSV, [csvHeader, ...csvRows].join('\n') + '\n', 'utf8');
  console.log(`[export] wrote events.csv (${events.length} rows)`);

  // ── XLSX ───────────────────────────────────────────────────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator = 'build-events.mjs';
  wb.created = new Date();

  const ws = wb.addWorksheet('Events', { views: [{ state: 'frozen', ySplit: 1 }] });

  // Build column definitions: date | location | tags | band_1 | link_1 | band_2 | link_2 …
  const cols = [
    { header: 'date',     key: 'date',     width: 12 },
    { header: 'location', key: 'location', width: 14 },
    { header: 'organiser', key: 'organiser', width: 14 },
  ];
  for (let i = 1; i <= MAX_BANDS; i++) {
    cols.push({ header: `band_${i}`, key: `band_${i}`, width: 28 });
    cols.push({ header: `link_${i}`, key: `link_${i}`, width: 32 });
  }
  ws.columns = cols;

  // Style header row
  const headerRow = ws.getRow(1);
  headerRow.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF222222' } };
  headerRow.alignment = { vertical: 'middle' };
  headerRow.height    = 20;

  // Fill data rows
  const evenFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };

  events.forEach((ev, idx) => {
    const rowData = { date: ev.date, location: ev.location, organiser: (ev.organiser ?? []).join(';') };
    for (let i = 1; i <= MAX_BANDS; i++) {
      rowData[`band_${i}`] = ev.bands[i - 1] ?? '';
      rowData[`link_${i}`] = '';   // placeholder — user fills these in
    }
    const row = ws.addRow(rowData);
    if (idx % 2 === 1) {
      row.fill = evenFill;
    }
    row.height = 16;
  });

  // Auto-filter on the header row
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to:   { row: 1, column: cols.length },
  };

  await wb.xlsx.writeFile(OUTPUT_XLSX);
  console.log(`[export] wrote events.xlsx (${events.length} rows, ${cols.length} cols)`);
  const byOrganiser = { stoa60: 0, ba2037: 0, rastapank: 0 };
  for (const e of events) for (const o of e.organiser) byOrganiser[o] = (byOrganiser[o] ?? 0) + 1;
  console.log(`  organisers:`, byOrganiser);
}

async function main() {
  const { byDate, allPosters } = await buildPosterIndex();
  const rows = await readExcelRows();
  console.log(`[excel] ${rows.length} event rows`);
  const byLoc = {};
  for (const r of rows) byLoc[r.location] = (byLoc[r.location] ?? 0) + 1;
  console.log('[excel] by location:', byLoc);

  const claimed   = new Set();   // relPaths claimed by auto or manual matching
  const matches   = [];          // { row, matched, usedDate, swapped }
  const unmatched = [];          // { row, reason }

  // ── Step 1: apply R### manual matches FIRST so those posters are pre-claimed ──
  // This prevents the auto-matcher from grabbing a poster that belongs to a
  // specific manual match (e.g. when Excel dates are inverted for two events).
  const { rowMap: manualMap, bandOverrides, locationOverrides, organiserOverrides, skipRows } = await parseManualMatches();
  const { applied: manualApplied, preClaimedRows } = applyManualMatches(rows, manualMap, allPosters, skipRows, claimed, matches);

  // ── Step 2: auto-match all rows NOT already handled by Step 1 ──
  for (const row of rows) {
    if (preClaimedRows.has(row.rowNumber)) continue;  // already matched or skipped
    const r = matchRow(row, byDate, claimed);
    if (r.matched) matches.push({ row, ...r });
    else unmatched.push({ row, reason: r.reason });
  }

  const swappedCount = matches.filter(m => m.swapped).length;
  const manualCount  = matches.filter(m => m.manual).length;
  console.log(`[match] ${matches.length}/${rows.length} matched (${manualCount} manual, ${swappedCount} auto-swapped), ${unmatched.length} unmatched`);
  if (manualMap.size > 0 || skipRows.size > 0 || bandOverrides.size > 0) {
    console.log(`[manual] ${manualApplied}/${manualMap.size} R### applied, ${skipRows.size} skipped, ${bandOverrides.size} band overrides, ${organiserOverrides.size} organiser overrides`);
  }

  await fs.mkdir(LOG_DIR, { recursive: true });

  const correctionLines = matches
    .filter(m => m.swapped)
    .map(m => `R${m.row.rowNumber}  ${m.row.dates.primary} → ${m.usedDate}  [${m.row.location}]  ${m.row.rawTitle}  →  ${m.matched.relPath}`);

  const manualLines = matches
    .filter(m => m.manual)
    .map(m => {
      const orig = m.row.dates
        ? `${m.row.dates.primary}${m.row.dates.swapped ? ' or ' + m.row.dates.swapped : ''}`
        : '(no date)';
      return `R${m.row.rowNumber}  ${orig} → ${m.usedDate}  [${m.row.location}]  ${m.row.rawTitle}  →  ${m.matched.relPath}`;
    });

  const unmatchedLines = unmatched.map(u => {
    const { row, reason } = u;
    const dates = row.dates ? `${row.dates.primary}${row.dates.swapped ? ' or ' + row.dates.swapped : ''}` : '(no date)';
    return `R${row.rowNumber}  [${row.location}]  date=${dates}  reason=${reason}  title=${row.rawTitle}`;
  });

  const orphans = findOrphans(allPosters, claimed);
  const orphanLines = orphans.map(p => `[${p.location}]  ${p.date}  ${p.relPath}`);

  await writeLog('date-corrections.log', correctionLines);
  await writeLog('manual-matches.log',   manualLines);
  await writeLog('unmatched-events.log', unmatchedLines);
  await writeLog('orphan-posters.log',   orphanLines);

  const eventList = buildEventList(matches, orphans, bandOverrides, locationOverrides, organiserOverrides);
  await fs.mkdir(path.dirname(OUTPUT_TS), { recursive: true });
  await fs.writeFile(OUTPUT_TS, serializeTs(eventList), 'utf8');
  console.log(`[emit] wrote ${OUTPUT_TS} (${eventList.length} events)`);

  await exportSpreadsheet(eventList);
}

main().catch(err => { console.error(err); process.exit(1); });
