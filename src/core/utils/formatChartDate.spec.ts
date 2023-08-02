import { timeIntervalMap } from '@config/prometheus';

import { formatChartDate, getDayFromTimestamp, getMonthAndDay, getTimeFromTimestamp } from './formatChartDate';

const fixedDate = new Date('2023-08-02T23:00:00');
jest.spyOn(Date, 'now').mockImplementation(() => fixedDate.getTime());

describe('formatChartDate', () => {
  const now = Date.now(); // Current time in milliseconds
  const oneMinuteAgo = now - timeIntervalMap.oneMinute.seconds * 1000;
  const twoDaysAgo = now - timeIntervalMap.twoDay.seconds * 1000;
  const twoWeeksAgo = now - timeIntervalMap.twoWeeks.seconds * 1000;

  it('should format date with time (minutes and seconds) if start is more than one minute ago', () => {
    const timestamp = now / 1000; // Current timestamp in seconds
    const start = now / 1000;
    const result = formatChartDate(timestamp, start);
    const expectedFormatted = getTimeFromTimestamp(timestamp);

    expect(result).toBe(expectedFormatted);
  });

  it('should format date with time (minutes and seconds) if start is more than one minute ago', () => {
    const timestamp = now / 1000; // Current timestamp in seconds
    const start = oneMinuteAgo / 1000;
    const result = formatChartDate(timestamp, start);
    const expectedFormatted = getTimeFromTimestamp(timestamp, true);

    expect(result).toBe(expectedFormatted);
  });

  it('should format date with day of the week and time if start is more than two days ago', () => {
    const timestamp = twoDaysAgo / 1000;
    const start = twoDaysAgo / 1000;
    const result = formatChartDate(timestamp, start);
    const expectedFormatted = getDayFromTimestamp(timestamp);

    expect(result).toBe(expectedFormatted);
  });

  it('should format date with month abbreviation and day if start is more than two weeks ago', () => {
    const timestamp = twoWeeksAgo / 1000;
    const start = twoWeeksAgo / 1000;
    const result = formatChartDate(timestamp, start);
    const expectedFormatted = getMonthAndDay(timestamp);

    expect(result).toBe(expectedFormatted);
  });
});
