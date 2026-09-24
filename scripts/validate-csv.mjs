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

    const posterUrl = (row.poster_url || '').trim();
    if (posterUrl) {
      const rel = urlToPosterPath(posterUrl);
      if (!rel) errors.push(`${where}: poster_url is not a github raw posters URL`);
      else if (!posterExists(rel)) errors.push(`${where}: poster file not found: ${rel}`);
    }

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
