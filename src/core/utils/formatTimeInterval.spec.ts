// formatTimeInterval.test.ts

import { formatTimeInterval } from './formatTimeInterval';

describe('formatTimeInterval', () => {
  it('should format time interval correctly', () => {
    const startTime = 1627801200000000;
    const endTime = 1627804800000000;
    const expectedOutput = '1 hour';

    const result = formatTimeInterval(endTime, startTime);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle a time interval with zero duration', () => {
    const startTime = 1627804800000000;
    const endTime = 1627804800000000;
    const expectedOutput = '';

    const result = formatTimeInterval(endTime, startTime);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle a time interval with less than a second duration', () => {
    const startTime = 1627804800000000;
    const endTime = 1627804800000100;
    const expectedOutput = '';

    const result = formatTimeInterval(endTime, startTime);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle a time interval with one-second duration', () => {
    const startTime = 1627804800000000;
    const endTime = 1627804801000000;
    const expectedOutput = '1 second';

    const result = formatTimeInterval(endTime, startTime);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle a time interval with one-minute duration', () => {
    const startTime = 1627804800000000;
    const endTime = 1627804860000000;
    const expectedOutput = '1 minute';

    const result = formatTimeInterval(endTime, startTime);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle a time interval with one-hour duration', () => {
    const startTime = 1627804800000000;
    const endTime = 1627808400000000;
    const expectedOutput = '1 hour';

    const result = formatTimeInterval(endTime, startTime);
    expect(result).toEqual(expectedOutput);
  });
});
