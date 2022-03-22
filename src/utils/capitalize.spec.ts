import { capitalizeAllFirstLetters, capitalizeFirstLetter } from './capitalize';

describe('capitalize capitalizeFirstLetter', () => {
  it('Should return a text message with the first letter Uppercase', () => {
    const mockText = 'this is a test';
    const mockTextExpected = 'This is a test';

    expect(capitalizeFirstLetter(mockText)).toBe(mockTextExpected);
  });

  it('Should fail to return a text message with the first letter Uppercase', () => {
    const mockText = 'this is a test';
    const mockTextExpected = 'This s a Test';

    expect(capitalizeFirstLetter(mockText)).not.toBe(mockTextExpected);
  });
});

describe('capitalize capitalizeAllFirstLetters', () => {
  it('Should return a text message with the ALL first letters Uppercase', () => {
    const mockText = 'this is a test';
    const mockTextExpected = 'This Is A Test';

    expect(capitalizeAllFirstLetters(mockText)).toBe(mockTextExpected);
  });

  it('Should fail to return a text message with the ALL first letters Uppercase', () => {
    const mockText = 'this is a test';
    const mockTextExpected = 'This is A Test';

    expect(capitalizeAllFirstLetters(mockText)).not.toBe(mockTextExpected);
  });
});
