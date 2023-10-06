export function removeDuplicatesFromArrayOfObjects<T>(arrOfObj: T[]): T[] {
  const dataArr = arrOfObj.map((item: T) => [JSON.stringify(item), item]) as [string, T][];
  const maparr = new Map(dataArr);

  return [...maparr.values()] as T[];
}
