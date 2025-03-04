import { describe, it, expect } from 'vitest';

import { formatLatency } from '../src/core/utils/formatLatency';

describe('formatLatency', () => {
  // Test zero value
  it('should return "0 µs" when time is 0 with default options', () => {
    expect(formatLatency(0)).toBe('0 µs');
  });

  it('should return "0 ms" when time is 0 with startSize ms', () => {
    expect(formatLatency(0, { startSize: 'ms' })).toBe('0 ms');
  });

  it('should return "0 sec" when time is 0 with startSize sec', () => {
    expect(formatLatency(0, { startSize: 'sec' })).toBe('0 sec');
  });

  // Test small values
  it('should format small values correctly with default options', () => {
    expect(formatLatency(0.5)).toBe('0.5 µs');
  });

  // Test when time < 1 and startSize is 'µs'
  it('should return value in µs when time < 1 and startSize is µs', () => {
    expect(formatLatency(0.123)).toBe('0.1 µs');
  });

  it('should respect decimals parameter for small values', () => {
    expect(formatLatency(0.123, { decimals: 3 })).toBe('0.123 µs');
  });

  // Test time >= 1 with various magnitudes
  it('should convert to ms when time >= 1000 µs', () => {
    expect(formatLatency(1000)).toBe('1 ms');
    expect(formatLatency(1234)).toBe('1.2 ms');
  });

  it('should convert to sec when time >= 1000000 µs', () => {
    expect(formatLatency(1000000)).toBe('1 sec');
    expect(formatLatency(1234567)).toBe('1.2 sec');
  });

  // Test with startSize = 'ms'
  it('should respect startSize = ms', () => {
    expect(formatLatency(0.5, { startSize: 'ms' })).toBe('0.5 ms');
    expect(formatLatency(1, { startSize: 'ms' })).toBe('1 ms');
    expect(formatLatency(1000, { startSize: 'ms' })).toBe('1 sec');
  });

  // Test with startSize = 'sec'
  it('should respect startSize = sec', () => {
    expect(formatLatency(0.001, { startSize: 'sec' })).toBe('0 sec');
    expect(formatLatency(0.000001, { startSize: 'sec' })).toBe('0 sec');
    expect(formatLatency(1, { startSize: 'sec' })).toBe('1 sec');
  });

  // Test when time < 0.001 and startSize is 'ms'
  it('should convert to µs when time < 0.001 and startSize is ms', () => {
    expect(formatLatency(0.0005, { startSize: 'ms' })).toBe('500 µs');
  });

  // Test the condition where timeSized would be NaN
  it('should return empty string when result would be NaN', () => {
    expect(formatLatency(NaN)).toBe('');
  });

  it('should handle case when invalid startSize is provided explicitly', () => {
    expect(formatLatency(500, { startSize: 'unknown' as any })).toBe('500 µs');
  });

  // Test the edge cases for the else branch
  it('should handle the condition where time < 1 but currentIndex > 0', () => {
    expect(formatLatency(0.5, { startSize: 'ms' })).toBe('0.5 ms');
    expect(formatLatency(0.0005, { startSize: 'sec' })).toBe('0 sec');
  });

  // Test custom decimals
  it('should respect custom decimals parameter', () => {
    expect(formatLatency(1234, { decimals: 3 })).toBe('1.234 ms');
    expect(formatLatency(1234, { decimals: 0 })).toBe('1 ms');
  });

  // Combined options tests
  it('should correctly apply both custom decimals and startSize', () => {
    expect(formatLatency(0.12345, { decimals: 4, startSize: 'ms' })).toBe('0.1235 ms');
    expect(formatLatency(1234, { decimals: 3, startSize: 'sec' })).toBe('1.234 sec');
  });

  // Edge case with very large numbers
  it('should handle very large numbers correctly', () => {
    expect(formatLatency(10000000000)).toBe('10 sec');
  });

  // Edge case with very small numbers
  it('should handle very small numbers correctly', () => {
    expect(formatLatency(0.000000001, { decimals: 9 })).toBe('0.000000001 µs');
  });
});
