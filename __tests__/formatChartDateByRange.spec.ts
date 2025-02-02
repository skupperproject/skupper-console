import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { timeIntervalMap } from '../src/config/prometheus';
import { formatChartDateByRange } from '../src/core/utils/formatChartDateByRange';

describe('formatChartDateByRange', () => {
  const mockDate = new Date('2024-02-02T15:30:45');
  const timestamp = Math.floor(mockDate.getTime() / 1000);

  beforeEach(() => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'en-US',
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats date with hours, minutes, and seconds for range <= fifteenMinutes', () => {
    const result = formatChartDateByRange(timestamp, timeIntervalMap.fifteenMinutes.seconds);
    expect(result).toBe('3:30:45 PM');
  });

  it('formats date with hours and minutes for range <= twoHours', () => {
    const result = formatChartDateByRange(timestamp, timeIntervalMap.twoHours.seconds);
    expect(result).toBe('3:30 PM');
  });

  it('formats date with weekday, hours, and minutes for range <= twelveHours', () => {
    const result = formatChartDateByRange(timestamp, timeIntervalMap.twelveHours.seconds);
    expect(result).toBe('Fri 3:30 PM');
  });

  it('formats date with weekday, month, day, hours, and minutes for range <= oneDay', () => {
    const result = formatChartDateByRange(timestamp, timeIntervalMap.oneDay.seconds);
    expect(result).toBe('Fri, Feb 2, 3:30 PM');
  });

  it('formats date with weekday, month, day, hours, and minutes for range === twoDays', () => {
    const result = formatChartDateByRange(timestamp, timeIntervalMap.twoDays.seconds);
    expect(result).toBe('Fri, Feb 2, 3:30 PM');
  });

  it('formats date with month, day, year, hours, and minutes for range > twoDays', () => {
    const result = formatChartDateByRange(timestamp, timeIntervalMap.twoDays.seconds + 1);
    expect(result).toBe('Feb 2, 2024, 3:30 PM');
  });

  it('uses the navigator language when available', () => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'it-IT',
      configurable: true
    });
    const result = formatChartDateByRange(timestamp, timeIntervalMap.oneDay.seconds);
    expect(result).toMatch('ven 2 feb, 15:30');
  });

  it('falls back to en-US when navigator language is not available', () => {
    Object.defineProperty(window.navigator, 'language', {
      value: undefined,
      configurable: true
    });
    const result = formatChartDateByRange(timestamp, timeIntervalMap.oneDay.seconds);
    expect(result).toBe('Fri, Feb 2, 3:30 PM');
  });

  it('returns "Invalid Date" for invalid timestamp', () => {
    const result = formatChartDateByRange(NaN, timeIntervalMap.oneDay.seconds);
    expect(result).toBe('Invalid Date');
  });

  it('returns "Invalid Date" when date formatting fails', () => {
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
      throw new Error('Formatting failed');
    });
    const result = formatChartDateByRange(timestamp, timeIntervalMap.oneDay.seconds);
    expect(result).toBe('Invalid Date');
  });
});
