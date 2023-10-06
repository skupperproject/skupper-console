export function deepMergeJSONObjects<T>(obj1: T = {} as T, obj2: Partial<T>): T {
  const result = { ...obj1 };

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
        result[key] = deepMergeJSONObjects(obj1[key], obj2[key] as T[Extract<keyof T, string>]);
      } else {
        result[key] = obj2[key] as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}
