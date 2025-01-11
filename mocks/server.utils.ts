import { DataMap, dataMap } from './dataMao';
import { ApiResponse } from '../src/types/REST.interfaces';

export const loadData = <T>(fileName: keyof DataMap): ApiResponse<T[]> => dataMap[fileName] as ApiResponse<T[]>;

export function extractQueryParams(url?: string): Record<string, string[]> | null {
  if (!url) {
    return null;
  }

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

// server.utils.ts
export const paginateResults = <T>(
  results: T[],
  queryParams: Record<string, string | number | string[] | null | undefined>
) => {
  const offset = Number(queryParams.offset || 0);
  const limit = Number(queryParams.limit || results.length);

  return results.slice(offset, offset + limit);
};

export const filterResults = <T>(results: T[], filters: Partial<Record<keyof T, string | string[]>>): T[] =>
  results.filter((result) =>
    Object.entries(filters).every(([key, value]) => {
      if (value === undefined) {
        return true; // Skip filtering for undefined values
      }

      const resultValue = result[key as keyof T];

      if (resultValue === undefined || resultValue === null) {
        return false; // Handle cases where the property doesn't exist
      }

      const resultString = resultValue.toString();

      if (Array.isArray(value)) {
        return value.some((v) => resultString.includes(v));
      } else if (typeof value === 'string') {
        return resultString.includes(value);
      }

      return true; // Should not happen, but added for safety
    })
  );

export function sortData<T extends object>(data: T[], sortBy: string[]): T[] {
  if (!Array.isArray(sortBy) || sortBy.length === 0) {
    return data;
  }

  return data.sort((a, b) => {
    for (const criterion of sortBy) {
      const [field, order] = criterion.split('.');

      if (!field || !order || (order !== 'asc' && order !== 'desc')) {
        continue;
      }

      // Ensure field is a valid key on a and b
      if (!(field in a) || !(field in b)) {
        continue;
      }

      const compareValue =
        a[field as keyof T] > b[field as keyof T] ? 1 : a[field as keyof T] < b[field as keyof T] ? -1 : 0;

      if (order === 'asc') {
        if (compareValue !== 0) {
          return compareValue;
        }
      } else if (order === 'desc') {
        if (compareValue !== 0) {
          return -compareValue;
        }
      }
    }

    return 0;
  });
}

export const getMockData = <T>(data: T[], isPerformanceTest: boolean, mockData: T[] = []) =>
  isPerformanceTest ? [...data, ...mockData] : data;
