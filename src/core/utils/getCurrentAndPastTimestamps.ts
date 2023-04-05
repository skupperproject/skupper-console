/**
 * Calculates the start and end time of a time interval based on a specified duration.
 * @param {number} durationInSeconds - The duration of the time interval, in seconds.
 * @returns {Object} An object with `start` and `end` properties representing the start and end times of the interval, respectively. The values are in Unix timestamp format, which is the number of seconds since January 1, 1970.
 *
 */
export function getCurrentAndPastTimestamps(durationInSeconds: number): { start: number; end: number } {
  const now = new Date().getTime() / 1000; // convert in second

  return {
    start: now - durationInSeconds,
    end: now
  };
}
