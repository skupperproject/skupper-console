import { QueryParams, QueryFilters, PairsResponse, ProcessPairsResponse } from '@sk-types/REST.interfaces';

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
export const aggregatePairs = (
  pairs: PairsResponse[] | ProcessPairsResponse[]
): PairsResponse[] | ProcessPairsResponse[] => {
  const map = new Map<string, PairsResponse | ProcessPairsResponse>();

  pairs.forEach((pair) => {
    const { sourceId, destinationId, protocol } = pair;

    const key = `${sourceId}-${destinationId}`;
    const entry = map.get(key);

    if (entry) {
      // If entry exists, update the protocol if not already present
      if (!entry.protocol.split(', ').includes(protocol)) {
        entry.protocol = [entry.protocol, protocol].sort().join(', ') as Protocols;
      }
    } else {
      // If no entry exists, create a new one and retain all original properties
      map.set(key, { ...pair });
    }
  });

  return Array.from(map.values());
};
