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
