import { describe, expect, it } from 'vitest';

import { formatNumber } from '../src/core/utils/formatNumber';

describe('formatNumber', () => {
  it('should format numbers less than 1000 correctly', () => {
    expect(formatNumber(123)).toBe('123');
    expect(formatNumber(456.78)).toBe('456.78');
    expect(formatNumber(999.999)).toBe('999.999');
  });

  it('should format numbers in thousands', () => {
    expect(formatNumber(1000)).toBe('1 K');
    expect(formatNumber(2450)).toBe('2.45 K');
    expect(formatNumber(999950)).toBe('999.95 K');
  });

  it('should format numbers in millions', () => {
    expect(formatNumber(1000000)).toBe('1 Mil.');
    expect(formatNumber(24500000)).toBe('24.5 Mil.');
    expect(formatNumber(999999999)).toBe('1000 Mil.');
  });

  it('should format numbers in billions', () => {
    expect(formatNumber(1000000000)).toBe('1 Bil.');
    expect(formatNumber(245000000000)).toBe('245 Bil.');
    expect(formatNumber(999999999999)).toBe('1000 Bil.');
  });

  it('should format numbers in trillions', () => {
    expect(formatNumber(1000000000000)).toBe('1 Tril.');
    expect(formatNumber(245000000000000)).toBe('245 Tril.');
    expect(formatNumber(999999999999999)).toBe('1000 Tril.');
  });

  it('should format numbers with custom decimal precision', () => {
    expect(formatNumber(1234567.89, 0)).toBe('1 Mil.');
    expect(formatNumber(1234567.89, 1)).toBe('1.2 Mil.');
    expect(formatNumber(1234567.89, 3)).toBe('1.235 Mil.');
    expect(formatNumber(1234567.89, 6)).toBe('1.234568 Mil.');
  });
});
