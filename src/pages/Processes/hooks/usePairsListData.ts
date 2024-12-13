import { useQueries, useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.resources';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { ProcessPairsResponse } from '../../../types/REST.interfaces';
import { TopologyController } from '../../Topology/services';
import { QueriesPairs } from '../../Topology/Topology.enum';
import { QueriesProcesses } from '../Processes.enum';

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` },
  fetchLatency: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` }
};

export const useProcessPairsListData = (id: string, name: string) => {
  const queryParams = (idKey: keyof ProcessPairsResponse) => ({ [idKey]: id });

  const [{ data: metricsTx }, { data: metricsRx }] = useQueries({
    queries: [
      {
        queryKey: [QueriesPairs.GetMetricsByPairs, { sourceProcess: name }],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            metricQueryParams: {
              ...metricQueryParams,
              filterBy: { sourceProcess: name }
            }
          }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesPairs.GetMetricsByPairs, { destProcess: name }],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            metricQueryParams: {
              ...metricQueryParams,
              filterBy: { destProcess: name }
            }
          }),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessPairs, queryParams('sourceId')],
        queryFn: () => RESTApi.fetchProcessesPairs(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcesses.GetProcessPairs, queryParams('destinationId')],
        queryFn: () => RESTApi.fetchProcessesPairs(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { pairsTx: pairsTx.results, pairsRx: pairsRx.results, metricsTx, metricsRx };
};
