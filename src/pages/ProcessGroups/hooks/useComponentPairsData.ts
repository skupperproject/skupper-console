import { useQueries, useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { Protocols } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import { TopologyController } from '@pages/Topology/services';
import { QueriesPairs } from '@pages/Topology/Topology.enum';
import { PairsResponse } from '@sk-types/REST.interfaces';

import { QueriesComponent } from '../Components.enum';

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceComponentName},${PrometheusLabelsV2.DestComponentName}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceComponentName},${PrometheusLabelsV2.DestComponentName}` },
  fetchLatency: { groupBy: `${PrometheusLabelsV2.SourceComponentName},${PrometheusLabelsV2.DestComponentName}` }
};

export const useComponensPairsListData = (id: string, name: string) => {
  const queryParams = (idKey: keyof PairsResponse) => ({ [idKey]: id, protocol: Protocols.Tcp });

  const [{ data: metricsTx }, { data: metricsRx }] = useQueries({
    queries: [
      {
        queryKey: [QueriesPairs.GetMetricsByPairs, { sourceComponent: name }],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            metricQueryParams: {
              ...metricQueryParams,
              filterBy: { sourceComponent: name }
            }
          }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesPairs.GetMetricsByPairs, { destComponent: name }],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            metricQueryParams: {
              ...metricQueryParams,
              filterBy: { destComponent: name }
            }
          }),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesComponent.GetComponentPairs, queryParams('sourceId')],
        queryFn: () => RESTApi.fetchComponentsPairs(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesComponent.GetComponentPairs, queryParams('destinationId')],
        queryFn: () => RESTApi.fetchComponentsPairs(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { pairsTx: pairsTx.results, pairsRx: pairsRx.results, metricsTx, metricsRx };
};
