import { ResponseWrapper } from '../src/types/REST.interfaces';

const DATA_PATH = './data';
export const loadData = <T>(fileName: string): ResponseWrapper<T[]> => require(`${DATA_PATH}/${fileName}.json`);

export function getQueryParams(url?: string): Record<string, string[]> | null {
  if (!url) return null;

  const params = new URLSearchParams(new URL(url).search);
  const queryParams: Record<string, string[]> = {};

  for (const [key, value] of params.entries()) {
    if (!queryParams[key]) {
      queryParams[key] = [];
    }

    queryParams[key].push(value);
  }

  return queryParams;
}
