import { expect } from '@jest/globals';

import { getNestedProperty } from './getNestedProperties';

type TestObject = {
  a: {
    b: {
      c: number;
    };
  };
  d?: {
    e: string;
  };
  f: string[];
};

describe('getNestedProperty', () => {
  const testObj = {
    a: {
      b: {
        c: 42
      }
    },
    d: {
      e: 'hello'
    },
    f: ['foo', 'bar', 'baz']
  };

  it('should return the nested property if it exists', () => {
    expect(getNestedProperty(testObj, ['a', 'b', 'c'] as (keyof TestObject)[])).toEqual(42);
    expect(getNestedProperty(testObj, ['d', 'e'] as (keyof TestObject)[])).toEqual('hello');
    expect(getNestedProperty(testObj, ['f', '0'] as (keyof TestObject)[])).toEqual('foo');
  });

  it('should return undefined if the nested property does not exist', () => {
    expect(getNestedProperty(testObj, ['a', 'b', 'd'] as (keyof TestObject)[])).toBeUndefined();
    expect(getNestedProperty(testObj, ['d', 'f'] as (keyof TestObject)[])).toBeUndefined();
    expect(getNestedProperty(testObj, ['f', '3'] as (keyof TestObject)[])).toBeUndefined();
  });

  it('should handle empty keys array', () => {
    expect(getNestedProperty(testObj, [])).toBeUndefined();
  });

  it('should handle non-existent keys', () => {
    const keys = ['g'];
    expect(getNestedProperty(testObj, keys as (keyof TestObject)[])).toBeUndefined();
  });
});
