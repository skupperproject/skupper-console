import { SortDirection } from './REST.enum';
import { QueryParams, RemoteFilterOptions } from './REST.interfaces';

/**
 * Extracts the "results" property from an Axios HTTP response data object with a "results" property.
 */
export function getApiResults<T>(data: { results: T }) {
  return data?.results;
}

/**
 * Maps an options object to query parameters for an HTTP request.
 */
export function mapOptionsToQueryParams({
  filter,
  offset,
  limit,
  sortDirection,
  sortName,
  timeRangeEnd,
  timeRangeStart,
  ...queryParams
}: RemoteFilterOptions): QueryParams {
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
