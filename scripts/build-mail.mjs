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
  const locIdx = args.indexOf('--location');
  const loc = locIdx !== -1 ? args[locIdx + 1] : undefined;
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
