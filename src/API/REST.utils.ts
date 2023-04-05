import { QueryParams, RequestOptions } from './REST.interfaces';

/**
 * Extracts the "results" property from an Axios HTTP response data object with a "results" property.
 * @param {Object} data - The response data object to extract the results from.
 * @returns {T} The value of the "results" property.
 * @template T
 */
export function getApiResults<T>(data: { results: T }) {
  return data.results;
}

/**
 * Maps an options object to query parameters for an HTTP request.
 *
 * @param {RequestOptions} options - The options object to map to query parameters.
 * @returns {QueryParams} An object containing the mapped query parameters.
 */
export function mapOptionsToQueryParams({
  filter,
  offset,
  limit,
  sortDirection,
  sortName,
  timeRangeEnd,
  timeRangeStart
}: RequestOptions): QueryParams {
  return {
    filter,
    offset,
    limit,
    timeRangeEnd,
    timeRangeStart,
    sortBy: sortName ? `${sortName}.${sortDirection || 'asc'}` : null
  };
}
