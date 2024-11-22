import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { UPDATE_INTERVAL } from '../../../config/config';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { TopologyController } from '../../Topology/services';
import { QueriesPairs } from '../../Topology/Topology.enum';
import { QueriesServices } from '../Services.enum';

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` },
  fetchLatency: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` }
};

export const useServersData = (id: string, name: string) => {
  const { data: processPairs } = useSuspenseQuery({
    queryKey: [QueriesServices.GetProcessPairsByService, id],
    queryFn: () => RESTApi.fetchProcessPairsByService(id),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: metrics } = useQuery({
    queryKey: [QueriesPairs.GetMetricsByPairs, { sourceSite: name }],
    queryFn: () =>
      TopologyController.getAllTopologyMetrics({
        showBytes: true,
        showByteRate: true,
        showLatency: true,
        metricQueryParams: {
          ...metricQueryParams,
          filterBy: { service: name }
        }
      }),
    refetchInterval: UPDATE_INTERVAL
  });

  return { processPairs: processPairs.results, metrics };
};
