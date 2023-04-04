import { formatBytes } from './formatBytes';

describe('formatBytes', () => {
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
