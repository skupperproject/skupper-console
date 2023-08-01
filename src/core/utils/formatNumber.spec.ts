import { formatNumber } from './formatNumber';

describe('formatNumber', () => {
  it('should format numbers less than 1000 correctly', () => {
    expect(formatNumber(123)).toBe('123');
    expect(formatNumber(456.78)).toBe('456.78');
    expect(formatNumber(999.999)).toBe('999.999');
  });

  it('should format numbers in thousands', () => {
    expect(formatNumber(1000)).toBe('1 thousand');
    expect(formatNumber(2450)).toBe('2.45 thousand');
    expect(formatNumber(999950)).toBe('999.95 thousand');
  });

  it('should format numbers in millions', () => {
    expect(formatNumber(1000000)).toBe('1 million');
    expect(formatNumber(24500000)).toBe('24.5 million');
    expect(formatNumber(999999999)).toBe('1000 million');
  });

  it('should format numbers in billions', () => {
    expect(formatNumber(1000000000)).toBe('1 billion');
    expect(formatNumber(245000000000)).toBe('245 billion');
    expect(formatNumber(999999999999)).toBe('1000 billion');
  });

  it('should format numbers in trillions', () => {
    expect(formatNumber(1000000000000)).toBe('1 trillion');
    expect(formatNumber(245000000000000)).toBe('245 trillion');
    expect(formatNumber(999999999999999)).toBe('1000 trillion');
  });

  it('should format numbers with custom decimal precision', () => {
    expect(formatNumber(1234567.89, 0)).toBe('1 million');
    expect(formatNumber(1234567.89, 1)).toBe('1.2 million');
    expect(formatNumber(1234567.89, 3)).toBe('1.235 million');
    expect(formatNumber(1234567.89, 6)).toBe('1.234568 million');
  });
});
