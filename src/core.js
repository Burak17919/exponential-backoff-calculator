/**
 * Compute the delay for a given attempt using exponential backoff.
 *
 * The formula is `min(maxDelay, baseInterval * 2 ** (attempt - 1))`.
 * If jitter is enabled, the result is a random value between 0 and the
 * calculated delay. The attempt number is 1-based, so the first attempt
 * yields the base interval.
 *
 * @param {number} attempt - The attempt number (1-based).
 * @param {object} options
 * @param {number} [options.baseInterval=1000] - The base delay in milliseconds.
 * @param {number} [options.maxDelay=30000] - The maximum delay in milliseconds.
 * @param {boolean} [options.jitter=false] - If true, return a random value
 *   between 0 and the calculated delay.
 * @param {() => number} [options.random=Math.random] - Function returning a
 *   random number in [0, 1). Useful for deterministic tests.
 * @returns {number} The delay in milliseconds.
 */
export function exponentialBackoff(attempt, options = {}) {
  if (!Number.isInteger(attempt) || attempt < 1) {
    throw new RangeError('attempt must be a positive integer');
  }

  const {
    baseInterval = 1000,
    maxDelay = 30000,
    jitter = false,
    random = Math.random,
  } = options;

  if (!Number.isFinite(baseInterval) || baseInterval <= 0) {
    throw new RangeError('baseInterval must be a positive finite number');
  }

  if (!Number.isFinite(maxDelay) || maxDelay <= 0) {
    throw new RangeError('maxDelay must be a positive finite number');
  }

  const rawDelay = Math.min(maxDelay, baseInterval * 2 ** (attempt - 1));

  if (jitter) {
    return Math.floor(random() * (rawDelay + 1));
  }

  return rawDelay;
}
