import { describe, expect, it } from 'vitest';

import { ellipsisInTheMiddle } from '../src/core/utils/EllipsisInTheMiddle';

describe('ellipsisInTheMiddle', () => {
  it('returns the original string if its length is less than or equal to maxLength', () => {
    expect(ellipsisInTheMiddle('short string')).toBe('short string');
    expect(ellipsisInTheMiddle('short string', { maxLength: 20 })).toBe('short string');
  });

  it('returns the original string if its length is equal to maxLength', () => {
    expect(ellipsisInTheMiddle('12345678901234567890', { maxLength: 20 })).toBe('12345678901234567890');
  });

  it('returns the string with ellipsis in the middle if its length is greater than maxLength', () => {
    expect(
      ellipsisInTheMiddle('1234567890123456789012345', { maxLength: 20, leftPartLenth: 10, rightPartLength: 5 })
    ).toBe('1234567890...12345');
    expect(ellipsisInTheMiddle('123456789012345678901234567890', { maxLength: 20 })).toBe('123456789012345...67890');
  });

  it('uses default values for options if not provided', () => {
    expect(ellipsisInTheMiddle('123456789012345678901234567890')).toBe('123456789012345...67890');
  });

  it('handles edge cases with empty string', () => {
    expect(ellipsisInTheMiddle('')).toBe('');
  });

  it('handles edge cases with string length equal to maxLength', () => {
    expect(ellipsisInTheMiddle('12345678901234567890', { maxLength: 20 })).toBe('12345678901234567890');
  });

  it('handles edge cases with string length less than maxLength', () => {
    expect(ellipsisInTheMiddle('short', { maxLength: 20 })).toBe('short');
  });
});
