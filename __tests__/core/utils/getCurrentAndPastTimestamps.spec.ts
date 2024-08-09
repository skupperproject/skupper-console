import { getCurrentAndPastTimestamps } from '../../../src/core/utils/getCurrentAndPastTimestamps';

describe('getCurrentAndPastTimestamps', () => {
  it('should returns an object with current and past Unix timestamps', () => {
    const intervalInSeconds = 3600; // 1 hour
    const result = getCurrentAndPastTimestamps(intervalInSeconds);

    expect(result.end - result.start).toBeCloseTo(intervalInSeconds);
  });

  it('should handles small intervals', () => {
    const intervalInSeconds = 0.001; // 1 millisecond
    const result = getCurrentAndPastTimestamps(intervalInSeconds);

    expect(result.end - result.start).toBeLessThan(1); // difference should be very small
  });

  it('should handles large intervals', () => {
    const intervalInSeconds = 86400 * 30; // 30 days
    const maxNumber = Number.MAX_SAFE_INTEGER; // maximum value of the Number type
    const result = getCurrentAndPastTimestamps(intervalInSeconds);

    expect(result.end - result.start).toBe(intervalInSeconds % maxNumber); // difference should be equal to the interval modulo the maximum value of the Number type
  });

  it('should handles negative intervals', () => {
    const intervalInSeconds = -3600; // negative 1 hour
    const result = getCurrentAndPastTimestamps(intervalInSeconds);

    expect(result.end - result.start).toBe(intervalInSeconds); // difference should be negative (because interval is negative) and equal to the interval
  });
});
