import { describe, expect, it } from 'vitest';

import { formatLatency } from '../src/core/utils/formatLatency';

describe('formatLatency', () => {
  it('should format latency correctly with default options', () => {
    expect(formatLatency(100)).toEqual('100 µs');
    expect(formatLatency(5000)).toEqual('5 ms');
    expect(formatLatency(1500000)).toEqual('1.5 sec');
  });

  it('should format latency with custom start size', () => {
    expect(formatLatency(100, { startSize: 'ms' })).toEqual('100 ms');
  });

  it('should format latency with custom decimal places', () => {
    expect(formatLatency(1234567, { decimals: 4 })).toEqual('1.2346 sec');
    expect(formatLatency(1234567, { decimals: 0 })).toEqual('1 sec');
  });

  it('should handle time of 0', () => {
    expect(formatLatency(0)).toEqual('0 µs');
  });

  it('should handle NaN values', () => {
    expect(formatLatency(NaN)).toEqual('');
    expect(formatLatency(123, { decimals: NaN })).toEqual('123 µs');
  });
});
