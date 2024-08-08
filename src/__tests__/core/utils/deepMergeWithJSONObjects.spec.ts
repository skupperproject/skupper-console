import { deepMergeJSONObjects } from '@core/utils/deepMergeWithJSONObjects';

describe('deepMergeJSONObjects', () => {
  it('should merge two objects with shallow properties', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 3, c: 4 };

    const result = deepMergeJSONObjects(obj1, obj2);

    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should merge two objects with nested properties', () => {
    const obj1 = {
      a: 1,
      b: { c: 2, d: 6 }
    };
    const obj2 = {
      a: 0,
      b: { c: 1 }
    };

    const result = deepMergeJSONObjects<{ a: number; b: { c: number; d?: number } }>(obj1, obj2);

    expect(result).toEqual({
      a: 0,
      b: { c: 1, d: 6 }
    });
  });

  it('should handle empty objects', () => {
    const obj1 = {};
    const obj2 = { a: 1, b: { c: 2 } };

    const result = deepMergeJSONObjects(obj1, obj2);

    expect(result).toEqual({ a: 1, b: { c: 2 } });
  });
});
