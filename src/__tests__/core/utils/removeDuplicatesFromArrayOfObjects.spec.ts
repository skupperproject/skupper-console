import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';

describe('removeDuplicatesFromArrayOfObjects', () => {
  it('should handle an array with one element', () => {
    const input = [{ id: 1, name: 'A' }];
    const result = removeDuplicatesFromArrayOfObjects(input);

    expect(result).toEqual(input);
  });

  it('should handle an array with all duplicate elements', () => {
    const input = [
      { id: 1, name: 'A' },
      { id: 1, name: 'A' },
      { id: 1, name: 'A' }
    ];
    const expectedOutput = [{ id: 1, name: 'A' }];
    const result = removeDuplicatesFromArrayOfObjects(input);

    expect(result).toEqual(expectedOutput);
  });

  it('should handle objects with nested structures', () => {
    const input = [
      { id: 1, person: { name: 'A' } },
      { id: 2, person: { name: 'B' } },
      { id: 1, person: { name: 'A' } } // Duplicate
    ];
    const expectedOutput = [
      { id: 1, person: { name: 'A' } },
      { id: 2, person: { name: 'B' } }
    ];
    const result = removeDuplicatesFromArrayOfObjects(input);

    expect(result).toEqual(expectedOutput);
  });
});
