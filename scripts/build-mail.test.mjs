import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkLabel, slugFromPoster, renderEmail } from './build-mail.mjs';

test('linkLabel', () => {
  assert.equal(linkLabel('https://katharoschalkos.bandcamp.com/album/-'), 'katharoschalkos.bandcamp.com');
  assert.equal(linkLabel('https://www.youtube.com/watch?v=x'), 'youtube');
  assert.equal(linkLabel('https://youtu.be/x'), 'youtube');
  assert.equal(linkLabel('https://www.facebook.com/p/x'), 'facebook');
  assert.equal(linkLabel('https://example.org/band'), 'example.org');
});

test('renderEmail never uses Courier (no Greek glyphs on Android) and loads the web font', () => {
  const html = renderEmail({
    poster: '2026-2027/x.jpg', rawTitle: 'X', mailIntro: 'Σάββατο', bands: ['AAA'],
    bandLinks: { AAA: 'https://aaa.bandcamp.com' }, bandDescriptions: { AAA: 'γεια' },
  });
  assert.doesNotMatch(html, /courier/i);
  assert.match(html, /@font-face\{font-family:'STOA Mono'/);
  assert.match(html, /jetbrains-mono-greek-wght-normal\.woff2/);
});

test('slugFromPoster', () => {
  assert.equal(slugFromPoster('2025-2026/2026-05-16_kathares-arkoudes.jpg'), '2026-05-16_kathares-arkoudes');
});
