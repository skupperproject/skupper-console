import { expect } from '@jest/globals';

import { timeAgo } from '@core/utils/timeAgo';

describe('timeAgo', () => {
  test('returns an empty string when timestamp is falsy', () => {
    expect(timeAgo(0)).toBe(' ');
  });

  test('returns an empty string when timestamp is NaN', () => {
    expect(timeAgo(NaN)).toBe(' ');
  });
});
