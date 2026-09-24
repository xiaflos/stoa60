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

test('empty poster_url allowed (gig announced before its poster exists)', () => {
  assert.deepEqual(validateRows([row({ poster_url: '' })], ok), []);
});

test('non-github poster_url reported', () => {
  assert.ok(validateRows([row({ poster_url: 'https://example.com/x.jpg' })], ok).some(x => /poster/i.test(x)));
});
