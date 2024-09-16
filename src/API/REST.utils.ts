import { QueryParams, QueryFilters } from '@sk-types/REST.interfaces';

import { SortDirection } from './REST.enum';

/**
 * Maps an options object to query parameters for an HTTP request.
 */
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
