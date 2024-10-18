import { PrometheusLabelsV2 } from '../../config/prometheus';
import { PrometheusMetric } from '../../types/Prometheus.interfaces';
import { BasePairs, PairsWithMetrics } from '../../types/REST.interfaces';

export function combineInstantMetricsToPairs<T extends BasePairs>({
  processesPairs,
  metrics,
  prometheusKey,
  processPairsKey
}: PairsWithMetrics<T>) {
  const getPairsMap = (metricPairs: PrometheusMetric<'vector'>[] | undefined, key: string) =>
    (metricPairs || []).reduce(
      (acc, { metric, value }) => {
        {
          if (metric[PrometheusLabelsV2.SourceProcessName] === metric[PrometheusLabelsV2.DestProcessName]) {
            // When the source and destination are identical, we should avoid displaying the reverse metric. Instead, we should present the cumulative sum of all directions as a single value.
            acc[`${metric[key]}`] = (Number(acc[`${metric[key]}`]) || 0) + Number(value[1]);
          } else {
            acc[`${metric[key]}`] = Number(value[1]);
          }
        }

        return acc;
      },
      {} as Record<string, number>
    );

  const sourceToDestBytesMap = getPairsMap(metrics?.sourceToDestBytes, prometheusKey);
  const sourceToDestByteRateMap = getPairsMap(metrics?.sourceToDestByteRate, prometheusKey);
  const txLatencyByPairsMap = getPairsMap(metrics?.latencyByProcessPairs, prometheusKey);

  return processesPairs?.map((processPairsData) => ({
    ...processPairsData,
    bytes: sourceToDestBytesMap[processPairsData[processPairsKey]] || 0,
    byteRate: sourceToDestByteRateMap[processPairsData[processPairsKey]] || 0,
    latency: txLatencyByPairsMap[processPairsData[processPairsKey]] || 0
  }));
}
