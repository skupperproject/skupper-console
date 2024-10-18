import { PairsWithInstantMetrics } from '../../types/REST.interfaces';

export function invertPairs<T extends PairsWithInstantMetrics>(pairs: T[]): T[] {
  return pairs.map((pair) => ({
    ...pair,
    sourceId: pair.destinationId,
    sourceName: pair.destinationName,
    destinationId: pair.sourceId,
    destinationName: pair.sourceName
  }));
}
