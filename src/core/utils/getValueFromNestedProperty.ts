type NonNullableValue<T> = T extends null | undefined ? never : T;

export function getValueFromNestedProperty<T, K extends keyof T>(
  obj: NonNullableValue<T>,
  keys: K[]
): T[K] | undefined {
  // Return undefined if prop is falsy or prop is not a string
  if (!keys.length) {
    return undefined;
  }

  let nestedObject = obj as T;
  for (const key of keys) {
    // Add a type guard to ensure the nested object is not null or undefined
    if (nestedObject == null) {
      return undefined;
    }

    nestedObject = nestedObject[key] as T;
  }

  return nestedObject as T[K];
}
