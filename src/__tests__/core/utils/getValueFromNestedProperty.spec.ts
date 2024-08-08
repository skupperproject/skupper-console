import { expect } from '@jest/globals';

import { getValueFromNestedProperty } from '@core/utils/getValueFromNestedProperty';

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
    expect(getValueFromNestedProperty(testObj, ['a', 'b', 'c'] as (keyof TestObject)[])).toEqual(42);
    expect(getValueFromNestedProperty(testObj, ['d', 'e'] as (keyof TestObject)[])).toEqual('hello');
    expect(getValueFromNestedProperty(testObj, ['f', '0'] as (keyof TestObject)[])).toEqual('foo');
  });

  it('should return undefined if the nested property does not exist', () => {
    expect(getValueFromNestedProperty(testObj, ['a', 'b', 'd'] as (keyof TestObject)[])).toBeUndefined();
    expect(getValueFromNestedProperty(testObj, ['d', 'f'] as (keyof TestObject)[])).toBeUndefined();
    expect(getValueFromNestedProperty(testObj, ['f', '3'] as (keyof TestObject)[])).toBeUndefined();
  });

  it('should handle empty keys array', () => {
    expect(getValueFromNestedProperty(testObj, [])).toBeUndefined();
  });

  it('should handle non-existent keys', () => {
    const keys = ['g'];
    expect(getValueFromNestedProperty(testObj, keys as (keyof TestObject)[])).toBeUndefined();
  });
});
