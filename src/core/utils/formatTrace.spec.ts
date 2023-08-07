import { formatTraceBySites } from './formatTrace';

describe('formatTraceBySites', () => {
  it('should return an empty string for empty input', () => {
    const result = formatTraceBySites('');
    expect(result).toBe('');
  });

  it('should return the site name for a single site trace', () => {
    const trace = 'private1-skupper-router-bcd8f5469-6z7k6@private1';
    const result = formatTraceBySites(trace);
    expect(result).toBe('private1');
  });

  it('should return the concatenated site names for a multi-site trace', () => {
    const trace = 'private1-skupper-router-bcd8f5469-6z7k6@private1|public1-skupper-router-7b45b6b8f4-52tjs@public1';
    const result = formatTraceBySites(trace);
    expect(result).toBe('private1 -> public1');
  });

  it('should return the site name for a single site trace with extra pipe', () => {
    const trace = 'private1-skupper-router-bcd8f5469-6z7k6@private1|';
    const result = formatTraceBySites(trace);
    expect(result).toBe('private1');
  });

  it('should return an empty string for a trace without site information', () => {
    const trace = 'private1-skupper-router-bcd8f5469-6z7k6';
    const result = formatTraceBySites(trace);
    expect(result).toBe('');
  });
});
