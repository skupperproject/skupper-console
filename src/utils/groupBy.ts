export function groupBy<K extends keyof any, V>(array: V[], grouper: (item: V) => K) {
  return array.reduce((store, item) => {
    const key = grouper(item);
    (store[key] = store[key] || []).push(item);

    return store;
  }, {} as Record<K, V[]>);
}
