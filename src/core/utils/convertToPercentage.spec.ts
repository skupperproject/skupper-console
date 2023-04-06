import { convertToPercentage } from './convertToPercentage';

describe('convertToPercentage', () => {
  it('should return a percentage string removing the cents', () => {
    expect(convertToPercentage(3, 10)).toBe('30%');
    expect(convertToPercentage(2, 7)).toBe('29%');
    expect(convertToPercentage(0, 100)).toBe('0%');
    expect(convertToPercentage(10, 0)).toBe('Infinity%');
    expect(convertToPercentage(NaN, 100)).toBeNull();
  });

  it('should return null when the input is invalid', () => {
    expect(convertToPercentage(3, NaN)).toBeNull();
    expect(convertToPercentage(NaN, NaN)).toBeNull();
  });

  it('should handle values that are too large for Number.MAX_SAFE_INTEGER', () => {
    expect(convertToPercentage(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)).toBe('100%');
  });

  it('should handle negative values', () => {
    expect(convertToPercentage(-5, 20)).toBe('-25%');
    expect(convertToPercentage(5, -20)).toBe('-25%');
    expect(convertToPercentage(-5, -20)).toBe('25%');
  });

  it('should handle decimal values', () => {
    expect(convertToPercentage(3.14, 10)).toBe('31%');
    expect(convertToPercentage(2, 7.5)).toBe('27%');
    expect(convertToPercentage(1, 3.33)).toBe('30%');
    expect(convertToPercentage(0.1, 10)).toBe('1%');
    expect(convertToPercentage(0.001, 100)).toBe('0%');
  });
});
