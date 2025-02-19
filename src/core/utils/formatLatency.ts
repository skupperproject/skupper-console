/**
 *  Converts the latency in the most appropriate format
 *  By default the resolution expected from time is microseconds
 */

interface FormatTimeOptions {
  decimals?: number;
  startSize?: 'µs' | 'ms' | 'sec';
}

export function formatLatency(time: number, options?: FormatTimeOptions) {
  const { decimals = 1, startSize = 'µs' } = options || {};
  const sizes = ['µs', 'ms', 'sec'];
  let currentIndex = sizes.findIndex((size) => size === startSize);

  if (currentIndex === -1) {
    currentIndex = 0;
  }

  if (time === 0) {
    return `0 ${sizes[currentIndex]}`;
  }

  if (time < 1 && currentIndex === 0) {
    return `${time.toFixed(decimals)} ${sizes[currentIndex]}`;
  }

  let timeSized = time;

  if (time >= 1) {
    const i = Math.floor(Math.log(time) / Math.log(1000));
    timeSized = time / Math.pow(1000, i);
    currentIndex = Math.min(currentIndex + i, sizes.length - 1); // Adjust index if possible
  } else {
    if (currentIndex === 0) {
      timeSized *= 1000;
      currentIndex = 1;

      if (timeSized >= 1000) {
        timeSized /= 1000;
        currentIndex = 2;
      }
    } else if (currentIndex === 1 && time < 0.001) {
      timeSized *= 1000000;
      currentIndex = 0;
    }
  }

  const timeSizedRounded = parseFloat(timeSized.toFixed(decimals));

  if (isNaN(timeSizedRounded)) {
    return '';
  }

  return `${timeSizedRounded} ${sizes[currentIndex]}`;
}
