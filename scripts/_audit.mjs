// Temporary audit script — safe to delete after use
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const POSTER_ROOT = 'src/assets/images/posters';

function walk(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const full = path.join(dir, f);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(f)) {
      out.push(full.replace(/\\/g, '/').replace(POSTER_ROOT + '/', ''));
    }
  }
  return out;
}

const allFiles = walk(POSTER_ROOT);

const raw    = readFileSync('src/data/events.ts', 'utf8');
const start  = raw.indexOf('= [');
const end    = raw.lastIndexOf('];');
const events = JSON.parse(raw.slice(start + 2, end + 1));

const usedPosters = new Set(events.filter(e => e.poster).map(e => e.poster));

const orphans = allFiles.filter(f => !usedPosters.has(f));
const noP     = events.filter(e => !e.poster);

console.log('=== EVENTS WITHOUT A POSTER (' + noP.length + ') ===');
noP.forEach(e => console.log('  ' + e.date + ' | ' + e.location + ' | ' + e.rawTitle));

console.log('\n=== ORPHAN POSTERS — on disk but not in any event (' + orphans.length + ') ===');
orphans.forEach(f => console.log('  ' + f));

console.log('\nSummary: ' + allFiles.length + ' posters on disk | ' + usedPosters.size + ' used | ' + orphans.length + ' orphan | ' + noP.length + ' event(s) missing poster');
