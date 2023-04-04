import { deepCloneArray } from './deepCloneArray';

describe('deepCloneArray', () => {
  it('should return a deep clone of an array of primitives', () => {
    const arr = [1, 2, 3];
    const clone = deepCloneArray(arr);
    expect(clone).toEqual(arr);
    expect(clone).not.toBe(arr);
  });

  it('should return a deep clone of an array of objects', () => {
    const arr = [{ a: 1 }, { b: 2 }];
    const clone = deepCloneArray(arr);
    expect(clone).toEqual(arr);
    expect(clone).not.toBe(arr);
    expect(clone[0]).not.toBe(arr[0]);
  });

  it('should return an empty array if given an empty array', () => {
    const arr: unknown[] = [];
    const clone = deepCloneArray(arr);
    expect(clone).toEqual([]);
    expect(clone).not.toBe(arr);
  });

  it('should return a deep clone of an array containing null values', () => {
    const arr = [null, undefined];
    const clone = deepCloneArray(arr);
    expect(clone).toEqual([null, null]);
    expect(clone).not.toBe(arr);
  });
});
