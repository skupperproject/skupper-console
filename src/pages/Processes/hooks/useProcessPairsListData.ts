import { useQueries, useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import { TopologyController } from '@pages/Topology/services';
import { QueriesTopology } from '@pages/Topology/Topology.enum';
import { ProcessPairsResponse } from '@sk-types/REST.interfaces';

import { QueriesProcesses } from '../Processes.enum';

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceProcess},${PrometheusLabelsV2.DestProcess}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceProcess},${PrometheusLabelsV2.DestProcess}` },
  fetchLatency: { groupBy: `${PrometheusLabelsV2.SourceProcess},${PrometheusLabelsV2.DestProcess}` }
};

export const useProcessPairsListData = (id: string, name: string) => {
  const queryParams = (idKey: keyof ProcessPairsResponse) => ({ [idKey]: id });

  const [{ data: metricsTx }, { data: metricsRx }] = useQueries({
    queries: [
      {
        queryKey: [QueriesTopology.GetBytesByProcessPairs, { sourceProcess: name }],
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
        queryKey: [QueriesTopology.GetBytesByProcessPairs, { destProcess: name }],
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
        queryKey: [QueriesProcesses.GetProcessPairsResult, queryParams('sourceId')],
        queryFn: () => RESTApi.fetchProcessesPairs(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcesses.GetProcessPairsResult, queryParams('destinationId')],
        queryFn: () => RESTApi.fetchProcessesPairs(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { pairsTx: pairsTx.results, pairsRx: pairsRx.results, metricsTx, metricsRx };
};
