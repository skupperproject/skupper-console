/**
 *  Converts input time in the most appropriate format
 */
export function formatTime(time: number, decimals = 2) {
  if (time === 0) {
    return '0 µs';
  }

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['µs', 'ms', 'sec'];

  const i = Math.floor(Math.log(time) / Math.log(k));
  const timeSized = parseFloat((time / Math.pow(k, i)).toFixed(dm));

  return isNaN(timeSized) ? '' : `${timeSized} ${sizes[i]}`;
}
