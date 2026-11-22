import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseIsNext, parsePairs, parseBands, parseStruck } from './csv-to-ts.mjs';

test('~~Name~~ band cells: plain name in bands, listed in struck', () => {
  const row = { band_1: '~~Sister~~', band_2: 'Humachines', band_3: '', band_4: '', band_5: '', band_6: '' };
  assert.deepEqual(parseBands(row), ['Sister', 'Humachines']);
  assert.deepEqual(parseStruck(row), ['Sister']);
  assert.deepEqual(parseStruck({ band_1: 'A~~B', band_2: '~~' }), []);
});

test('parseIsNext true/false variants', () => {
  for (const v of ['true','TRUE',' true ','1','yes']) assert.equal(parseIsNext(v), true);
  for (const v of ['', '  ', 'false','no','0', undefined, null]) assert.equal(parseIsNext(v), false);
});

test('parsePairs splits Key=value|Key=value', () => {
  assert.deepEqual(parsePairs('A=x|B=y'), { A: 'x', B: 'y' });
  assert.deepEqual(parsePairs(''), {});
  assert.deepEqual(parsePairs('A=he said <br> hi'), { A: 'he said <br> hi' });
});
