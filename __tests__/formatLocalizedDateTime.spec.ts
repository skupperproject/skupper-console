import { expect } from '@jest/globals';

import { formatLocalizedDateTime } from '../src/core/utils/formatLocalizedDateTime';

describe('formatLocalizedDateTime', () => {
  it('should return the correct formatted date and time for the Italian locale', () => {
    const testDate = new Date('2024-06-21T15:48:00').getTime();
    const microseconds = testDate * 1000; // Convert to microseconds
    expect(formatLocalizedDateTime(microseconds, 'it-IT')).toBe('21 giu 2024, 15:48');
  });

  it('should handle missing timestamp by returning a blank space', () => {
    expect(formatLocalizedDateTime(0)).toBe(' ');
  });

  it('should return the correct formatted date and time for a different Italian date', () => {
    const testDate = new Date('2024-12-31T09:30:00').getTime();
    const microseconds = testDate * 1000; // Convert to microseconds
    expect(formatLocalizedDateTime(microseconds, 'it-IT')).toBe('31 dic 2024, 09:30');
  });

  it('should return the correct formatted date and time for the US locale', () => {
    const testDate = new Date('2024-06-21T15:48:00').getTime();
    const microseconds = testDate * 1000; // Convert to microseconds
    expect(formatLocalizedDateTime(microseconds, 'en-US')).toBe('Jun 21, 2024, 03:48 PM');
  });

  it('should return the correct formatted date and time for the UK locale', () => {
    const testDate = new Date('2024-06-21T15:48:00').getTime();
    const microseconds = testDate * 1000; // Convert to microseconds
    expect(formatLocalizedDateTime(microseconds, 'en-GB')).toBe('21 Jun 2024, 15:48');
  });
});
