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
