import { expect } from '@jest/globals';

import { timeAgo } from '../../../src/core/utils/timeAgo';

describe('timeAgo', () => {
  it('should return the correct formatted date and time', () => {
    const testDate = new Date('2024-06-21T15:48:00').getTime();
    const microseconds = testDate * 1000; // Convert to microseconds
    expect(timeAgo(microseconds)).toBe('21 giu 2024, 15:48');
  });

  it('should handle missing timestamp by returning a blank space', () => {
    expect(timeAgo(0)).toBe(' ');
  });

  it('should return the correct formatted date and time for a different date', () => {
    const testDate = new Date('2024-12-31T09:30:00').getTime();
    const microseconds = testDate * 1000; // Convert to microseconds
    expect(timeAgo(microseconds)).toBe('31 dic 2024, 9:30');
  });
});
