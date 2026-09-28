# Exponential Backoff Calculator

Computes the delay in milliseconds for a given attempt using exponential backoff, with optional jitter and a configurable maximum delay.

```js
import { exponentialBackoff } from 'exponential-backoff-calculator';

const delay = exponentialBackoff(3, {
  baseInterval: 1000,
  maxDelay: 30000,
  jitter: true,
});

console.log(delay); // e.g. 1734 (random between 0 and 4000)
```

## Why this library exists

Retry logic often needs to wait longer after each failed attempt. This library encapsulates the common formula `baseInterval * 2^(attempt-1)` with a cap, and optionally adds jitter to spread out retries from multiple clients. The trade-off made here is simplicity over configuration: the formula is fixed as base-2 exponential growth, and jitter is a uniform distribution from zero to the uncapped delay. If you need a different growth factor or jitter distribution, this library is not the right fit.

## Awkward edge

Jitter uses `Math.floor(random() * (rawDelay + 1))`, so the returned delay is an integer between 0 and the raw delay inclusive. The raw delay itself may not be an integer if `baseInterval` is not a power of two; the cap is applied before jitter, so the maximum jittered value is exactly the capped delay, not a rounded version of it.

## API

### `exponentialBackoff(attempt, options?)`

- `attempt` (number, required): 1-based attempt count. Must be a positive integer.
- `options` (object, optional):
  - `baseInterval` (number, default `1000`): base delay in milliseconds.
  - `maxDelay` (number, default `30000`): maximum delay in milliseconds.
  - `jitter` (boolean, default `false`): if true, returns a random integer from 0 to the uncapped delay.
  - `random` (function, default `Math.random`): function returning a number in `[0, 1)`. Useful for deterministic tests.

Returns the delay in milliseconds as a number.

Throws `RangeError` if `attempt` is not a positive integer, or if `baseInterval` or `maxDelay` is not a positive finite number.

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

