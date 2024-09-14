import { useQuery, useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import { TopologyController } from '@pages/Topology/services';
import { QueriesTopology } from '@pages/Topology/Topology.enum';

import { QueriesProcesses } from '../Processes.enum';

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceProcess},${PrometheusLabelsV2.DestProcess}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceProcess},${PrometheusLabelsV2.DestProcess}` },
  fetchLatency: { groupBy: `${PrometheusLabelsV2.SourceProcess},${PrometheusLabelsV2.DestProcess}` }
};

export const useProcessPairsListData = (id: string, name: string) => {
  const queryParams = (idKey: 'sourceId' | 'destinationId') => ({ [idKey]: id });

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessPairsResult, queryParams('sourceId')],
        queryFn: () => RESTApi.fetchProcessesPairsResult(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcesses.GetProcessPairsResult, queryParams('destinationId')],
        queryFn: () => RESTApi.fetchProcessesPairsResult(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const { data: metricsTx } = useQuery({
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
  });

  const { data: metricsRx } = useQuery({
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
  });

  return { pairsTx, pairsRx, metricsTx, metricsRx };
};
