/**
 *  Converts the latency in the most appropriate format
 *  By default the resolution expected from time is microseconds
 */

interface FormatTimeOptions {
  decimals?: number;
  startSize?: 'µs' | 'ms' | 'sec';
}

export function formatLatency(time: number, options?: FormatTimeOptions) {
  const startSize = options?.startSize || 'µs';
  const decimals = options?.decimals || 2;

  if (time === 0) {
    return `0 ${startSize}`;
  }

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;

  const sizes = ['µs', 'ms', 'sec'];
  const sizeFromIndex = sizes.findIndex((size) => size === startSize);
  const sizeFrom = sizes.slice(sizeFromIndex);

  const i = Math.floor(Math.log(time) / Math.log(k));
  const timeSized = parseFloat((time / Math.pow(k, i)).toFixed(dm));

  if (isNaN(timeSized)) {
    return '';
  }

  return `${timeSized} ${sizeFrom[i]}`;
}
