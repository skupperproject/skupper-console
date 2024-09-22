import { useQueries, useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import { TopologyController } from '@pages/Topology/services';
import { QueriesPairs } from '@pages/Topology/Topology.enum';
import { PairsResponse } from '@sk-types/REST.interfaces';

import { QueriesSites } from '../Sites.enum';

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceSiteName},${PrometheusLabelsV2.DestSiteName}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceSiteName},${PrometheusLabelsV2.DestSiteName}` },
  fetchLatency: { groupBy: `${PrometheusLabelsV2.SourceSiteName},${PrometheusLabelsV2.DestSiteName}` }
};

export const useSitePairsListData = (id: string, name: string) => {
  const queryParams = (idKey: keyof PairsResponse) => ({ [idKey]: id });

  const [{ data: metricsTx }, { data: metricsRx }] = useQueries({
    queries: [
      {
        queryKey: [QueriesPairs.GetMetricsByPairs, { sourceSite: name }],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            metricQueryParams: {
              ...metricQueryParams,
              filterBy: { sourceSite: name }
            }
          }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesPairs.GetMetricsByPairs, { destSite: name }],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            metricQueryParams: {
              ...metricQueryParams,
              filterBy: { destSite: name }
            }
          }),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesSites.GetSitesPairs, queryParams('sourceId')],
        queryFn: () => RESTApi.fetchSitesPairs(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesSites.GetSitesPairs, queryParams('destinationId')],
        queryFn: () => RESTApi.fetchSitesPairs(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { pairsTx: pairsTx.results, pairsRx: pairsRx.results, metricsTx, metricsRx };
};
