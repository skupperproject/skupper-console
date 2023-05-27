export function storeDataToSession<T>(key: string, data: T) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

export function getDataFromSession<T>(key: string): T | null {
  const data = sessionStorage.getItem(key);

  return data ? JSON.parse(data) : null;
}
