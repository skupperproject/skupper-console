/**
 * Creates a deep clone of an array of objects using JSON.
 */
export function deepCloneArray<T>(array: T[]): T[] {
  return JSON.parse(JSON.stringify(array));
}
