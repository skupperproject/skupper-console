import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { gePrometheusQueryPATH } from '../../../API/Prometheus.utils';
import { getProcessPairsByServiceId } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { TopologyController } from '../../Topology/services';

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` },
  fetchLatency: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` }
};

export const useServersData = (id: string, name: string) => {
  const { data: processPairs } = useSuspenseQuery({
    queryKey: [getProcessPairsByServiceId(id), id],
    queryFn: () => RESTApi.fetchProcessPairsByService(id),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: metrics } = useQuery({
    queryKey: [gePrometheusQueryPATH('single'), id, { service: name }],
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
