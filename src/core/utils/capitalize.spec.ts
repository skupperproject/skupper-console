import { capitalizeFirstLetter } from './capitalize';

describe('capitalizeFirstLetter', () => {
  it('should return a capitalized string', () => {
    const result = capitalizeFirstLetter('hello');
    expect(result).toEqual('Hello');
  });

  it('should return an empty string if given an empty string', () => {
    const result = capitalizeFirstLetter('');
    expect(result).toEqual('');
  });

  it('should return a capitalized string with one character', () => {
    const result = capitalizeFirstLetter('a');
    expect(result).toEqual('A');
  });

  it('should return a capitalized string with special characters', () => {
    const result = capitalizeFirstLetter('#hello');
    expect(result).toEqual('#hello');
  });

  it('should return a capitalized string with spaces', () => {
    const result = capitalizeFirstLetter(' hello');
    expect(result).toEqual(' hello');
  });
});
