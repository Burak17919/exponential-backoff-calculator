import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exponentialBackoff } from '../src/core.js';

test('first attempt returns base interval', () => {
  assert.equal(exponentialBackoff(1, { baseInterval: 500 }), 500);
});

test('attempts double the previous delay', () => {
  assert.equal(exponentialBackoff(1, { baseInterval: 1000, maxDelay: 100000 }), 1000);
  assert.equal(exponentialBackoff(2, { baseInterval: 1000, maxDelay: 100000 }), 2000);
  assert.equal(exponentialBackoff(3, { baseInterval: 1000, maxDelay: 100000 }), 4000);
  assert.equal(exponentialBackoff(4, { baseInterval: 1000, maxDelay: 100000 }), 8000);
});

test('delay is capped at maxDelay', () => {
  assert.equal(exponentialBackoff(10, { baseInterval: 1000, maxDelay: 30000 }), 30000);
});

test('default base interval and max delay', () => {
  assert.equal(exponentialBackoff(1), 1000);
  assert.equal(exponentialBackoff(6), 30000);
});

test('jitter returns value between 0 and raw delay inclusive', () => {
  const fixedRandom = () => 0.5;
  const delay = exponentialBackoff(2, { baseInterval: 1000, maxDelay: 10000, jitter: true, random: fixedRandom });
  assert.equal(delay, 1000); // 0.5 * (2000 + 1) = 1000.5, floor to 1000

  const zeroRandom = () => 0;
  assert.equal(exponentialBackoff(1, { baseInterval: 1000, jitter: true, random: zeroRandom }), 0);

  const oneRandom = () => 0.999999;
  const maxJittered = exponentialBackoff(1, { baseInterval: 1000, jitter: true, random: oneRandom });
  assert.equal(maxJittered, 1000);
});

test('jitter with capped delay uses capped raw delay', () => {
  const fixedRandom = () => 0.999999;
  const delay = exponentialBackoff(10, { baseInterval: 1000, maxDelay: 30000, jitter: true, random: fixedRandom });
  assert.equal(delay, 30000);
});

test('throws on invalid attempt', () => {
  assert.throws(() => exponentialBackoff(0), RangeError);
  assert.throws(() => exponentialBackoff(-1), RangeError);
  assert.throws(() => exponentialBackoff(1.5), RangeError);
  assert.throws(() => exponentialBackoff('1'), RangeError);
  assert.throws(() => exponentialBackoff(NaN), RangeError);
});

test('throws on invalid baseInterval', () => {
  assert.throws(() => exponentialBackoff(1, { baseInterval: 0 }), RangeError);
  assert.throws(() => exponentialBackoff(1, { baseInterval: -100 }), RangeError);
  assert.throws(() => exponentialBackoff(1, { baseInterval: NaN }), RangeError);
  assert.throws(() => exponentialBackoff(1, { baseInterval: Infinity }), RangeError);
});

test('throws on invalid maxDelay', () => {
  assert.throws(() => exponentialBackoff(1, { maxDelay: 0 }), RangeError);
  assert.throws(() => exponentialBackoff(1, { maxDelay: -100 }), RangeError);
  assert.throws(() => exponentialBackoff(1, { maxDelay: NaN }), RangeError);
  assert.throws(() => exponentialBackoff(1, { maxDelay: Infinity }), RangeError);
});

test('attempt does not overflow to Infinity with large attempt numbers', () => {
  const delay = exponentialBackoff(1000, { baseInterval: 1000, maxDelay: 30000 });
  assert.equal(delay, 30000);
});
