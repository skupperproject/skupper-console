import { QueryParams, QueryFilters, PairsResponse } from '@sk-types/REST.interfaces';

import { Protocols, SortDirection } from './REST.enum';

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

// Composes a path from an array of elements.
export function composePath(elements: string[]): string {
  return elements.join('/');
}

// Function to aggregate the pairs by sourceId and destinationId, updating only the protocol
export const aggregateDistinctPairs = <T extends PairsResponse>(pairs: T[]): T[] => {
  const map = new Map<string, T>();

  pairs
    .filter(({ sourceId, destinationId }) => sourceId !== destinationId)
    // We assure that the transport protocols are the first to be iterated during the following forEach/
    // At the moment we support only TCP as a transport protocol
    .sort((a, b) =>
      a.protocol === Protocols.Tcp ? -1 : b.protocol === Protocols.Tcp ? 1 : a.protocol.localeCompare(b.protocol)
    )
    .forEach((pair) => {
      const { sourceId, destinationId, protocol } = pair;

      const key = `${sourceId}-${destinationId}`;
      const entry = map.get(key);

      if (entry) {
        // always catch application protocols
        entry.observedApplicationProtocols = [entry.observedApplicationProtocols, protocol].filter(Boolean).join(', ');
      } else {
        const observedApplicationProtocols = protocol !== Protocols.Tcp ? protocol : '';
        // protocol always TCP because the pairs are sorted by the transport protocol
        map.set(key, { ...pair, observedApplicationProtocols });
      }
    });

  return Array.from(map.values());
};
