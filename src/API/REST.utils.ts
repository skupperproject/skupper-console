import { QueryParams, QueryFilters } from '@sk-types/REST.interfaces';

import { SortDirection } from './REST.enum';

export function mapQueryFiltersToQueryParams({
  filter,
  offset,
  limit,
  sortDirection,
  sortName,
  timeRangeEnd,
  timeRangeStart,
  ...queryParams
}: QueryFilters): QueryParams {
  return {
    filter,
    offset,
    limit,
    timeRangeEnd,
    timeRangeStart,
    sortBy: sortName ? `${sortName}.${sortDirection || SortDirection.ASC}` : null,
    ...queryParams
  };
}

/**
 * Composes a path from an array of elements.
 * @param {string[]} elements - An array of elements that will be joined together to form the path.
 * @returns {string} - The composed path as a string.
 */
export function composePath(elements: string[]): string {
  return elements.join('/');
}
