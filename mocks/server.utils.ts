import { ApiResponse } from '../src/types/REST.interfaces';

import { DataMap, dataMap } from './dataMao';

export const loadData = <T>(fileName: keyof DataMap): ApiResponse<T[]> => dataMap[fileName];

export function extractQueryParams(url?: string): Record<string, string[]> | null {
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

// server.utils.ts
export const paginateResults = (
  results: any[],
  queryParams: Record<string, string | number | string[] | null | undefined>
) => {
  const offset = Number(queryParams.offset || 0);
  const limit = Number(queryParams.limit || results.length);
  return results.slice(offset, offset + limit);
};

export const filterResults = (results: any[], filters: Record<string, any>) => {
  return results.filter((result) => {
    return Object.entries(filters).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.some((v) => result[key]?.toString().includes(v.toString()));
      } else if (value && result[key]) {
        return result[key].toString().includes(value.toString());
      }
      return true;
    });
  });
};

export function sortData<T extends Record<string, any>>(data: T[], sortBy: string[]): T[] {
  if (!Array.isArray(sortBy) || sortBy.length === 0) {
    return data;
  }

  return data.sort((a, b) => {
    for (let criterion of sortBy) {
      const [field, order] = criterion.split('.');

      if (!field || !order || (order !== 'asc' && order !== 'desc')) {
        continue;
      }

      // Ensure field is a valid key on a and b
      if (!(field in a) || !(field in b)) {
        continue;
      }

      const compareValue = a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0;

      if (order === 'asc') {
        if (compareValue !== 0) return compareValue;
      } else if (order === 'desc') {
        if (compareValue !== 0) return -compareValue;
      }
    }
    return 0;
  });
}

export const getMockData = <T>(data: T[], isPerformanceTest: boolean, mockData: T[] = []) => {
  return isPerformanceTest ? [...data, ...mockData] : data;
};
