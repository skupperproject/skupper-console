import { Protocols, SortDirection } from './REST.enum';
import { backendToFrontendPropertydMapper } from '../config/api';
import { PairsResponse, RouterLinkResponse, QueryFilters, QueryParams } from '../types/REST.interfaces';

/* 
  Composes a path from an array of strings. 
  This function joins the elements of the provided array using '/' as a separator,
  typically used to create API endpoint paths.
*/
export function composePath(elements: string[]): string {
  return elements.join('/');
}

/* 
  Aggregates an array of PairsResponse objects by unique combinations of sourceId and destinationId,
  merging protocols for each pair. It ensures that transport protocols (e.g., TCP) are processed first,
  followed by application protocols.
  - The function filters out pairs with the same sourceId and destinationId.
  - It sorts the pairs by protocol, prioritizing TCP.
  - It combines application protocols for pairs with matching sourceId and destinationId, separating them by commas.
*/
export const aggregateDistinctPairs = <T extends PairsResponse>(pairs: T[]): T[] => {
  const map = new Map<string, T>();

  pairs
    .filter(({ sourceId, destinationId }) => sourceId !== destinationId)
    // Prioritize TCP protocol first, then application protocols
    .sort((a, b) =>
      a.protocol === Protocols.Tcp ? -1 : b.protocol === Protocols.Tcp ? 1 : a.protocol.localeCompare(b.protocol)
    )
    .forEach((pair) => {
      const { sourceId, destinationId, protocol } = pair;

      const key = `${sourceId}-${destinationId}`;
      const entry = map.get(key);

      if (entry) {
        // If the pair already exists, merge the protocols
        entry.observedApplicationProtocols = [entry.observedApplicationProtocols, protocol].filter(Boolean).join(', ');
      } else {
        const observedApplicationProtocols = protocol !== Protocols.Tcp ? protocol : '';
        // Initialize with the first pair, assuming TCP as the protocol
        map.set(key, { ...pair, observedApplicationProtocols });
      }
    });

  return Array.from(map.values());
};

/* 
  Aggregates RouterLinkResponse objects by their sourceSiteId and destinationSiteId, combining links with the same site pair.
  - It groups links by site combination and determines the overall status (up, down, partially_up) based on the individual link statuses.
  - Returns a new list of aggregated links, where each entry represents a unique site pair with its combined status.
*/
export const aggregateLinksBySite = (linksData: RouterLinkResponse[]): RouterLinkResponse[] =>
  linksData.length === 0
    ? []
    : Object.values(
        linksData.reduce(
          (acc, link) => {
            const key = `${link.sourceSiteId}-${link.destinationSiteId}`;
            acc[key] = acc[key] || [];
            acc[key].push(link);

            return acc;
          },
          {} as { [key: string]: RouterLinkResponse[] }
        )
      ).map((links) => {
        const referenceLink = { ...links[0] };
        const allStatuses = links.map(({ status }) => status);
        referenceLink.status = allStatuses.every((s) => s === 'up')
          ? 'up'
          : allStatuses.every((s) => s === 'down')
            ? 'down'
            : 'partially_up';

        return referenceLink;
      });

/**
 * Maps the data in the response object based on a provided field mapping.
 * Transforms the keys in the `results` array or object to align with the specified mapping.
 */
export function mapResponseProperties<T>(results: T): T {
  // Helper function to map a single item
  const mapItem = (item: Record<string, unknown>) => {
    const mappedItem = {} as Record<string, unknown>;
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const mappedKey = backendToFrontendPropertydMapper[key] || key;
        mappedItem[mappedKey] = item[key];
      }
    }

    return mappedItem;
  };

  // Check if results is an array
  if (Array.isArray(results)) {
    return results.map(mapItem) as T;
  }

  // If results is a single object (not an array), map it directly
  return mapItem(results as Record<string, unknown>) as T;
}

/* 
  Maps the Application filters object to QueryParams, adjusting and adding properties as needed for API requests.
  - Includes filter, pagination (offset, limit), time range (start, end), and sorting (sortName, sortDirection).
  - Returns a QueryParams object compatible with backend API query parameters.
*/
export function mapFiltersToRequestQueryParams({
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
