import { formatByteRate, formatBytes } from './formatBytes';

describe('formatBytes', () => {
  it('should return an empty string if bytesSized is NaN', () => {
    const bytes = -1024;
    const result = formatBytes(bytes);

    expect(result).toBe('');
  });

  it('should return "1 B" for 1 byte', () => {
    const result = formatBytes(1);
    expect(result).toEqual('1 B');
  });

  it('should return "1 KB" for 1024 bytes', () => {
    const result = formatBytes(1024);
    expect(result).toEqual('1 KB');
  });

  it('should return "0 B" for 0 byte', () => {
    const result = formatBytes(0);
    expect(result).toEqual('0 B');
  });

  it('should return empty string for negative bytes', () => {
    const result = formatBytes(-1024);
    expect(result).toEqual('');
  });

  it('should return "1.12 MB" for 1171868 bytes with 2 decimal points', () => {
    const result = formatBytes(1171868, 2);
    expect(result).toEqual('1.12 MB');
  });

  it('should return "1023 B" for 1023 bytes', () => {
    const result = formatBytes(1023);
    expect(result).toEqual('1023 B');
  });

  it('should return "1023 B" for 1023 bytes with 2 decimal points', () => {
    const result = formatBytes(1023, 2);
    expect(result).toEqual('1023 B');
  });
});

describe('formatByteRate', () => {
  it('should format the byte rate correctly with default decimals', () => {
    const byteRate = 1024 * 5; // 5 KB/s
    const result = formatByteRate(byteRate);
    const expectedFormatted = '5 KB/s';

    expect(result).toBe(expectedFormatted);
  });

  it('should format the byte rate correctly removing 0 padding', () => {
    const byteRate = 1024 * 5;
    const decimals = 4;
    const result = formatByteRate(byteRate, decimals);
    const expectedFormatted = '5 KB/s';

    expect(result).toBe(expectedFormatted);
  });

  it('should format the byte rate correctly with custom decimals', () => {
    const byteRate = 1024 * 2.54321;
    const decimals = 3;
    const result = formatByteRate(byteRate, decimals);
    const expectedFormatted = '2.543 KB/s';

    expect(result).toBe(expectedFormatted);
  });

  it('should return an empty string for NaN input', () => {
    const result = formatByteRate(NaN);
    expect(result).toBe('');
  });

  it('should return an empty string for negative input', () => {
    const result = formatByteRate(-100);
    expect(result).toBe('');
  });

  it('should return "0 B/s" for input 0', () => {
    const result = formatByteRate(0);
    expect(result).toBe('0 B/s');
  });
});
