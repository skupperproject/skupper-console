import { useSuspenseQueries } from '@tanstack/react-query';

import { gePrometheusQueryPATH } from '../../../API/Prometheus.utils';
import { getAllProcesses, getAllProcessPairs } from '../../../API/REST.endpoints';
import { Role } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { TopologyController } from '../services';

const processesQueryParams = {
  role: [Role.Remote, Role.External],
  endTime: 0
};

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` }
};

const useTopologyProcessData = () => {
  const [{ data: processes }, { data: processesPairs }, { data: metrics }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [getAllProcesses(), processesQueryParams],
        queryFn: () => RESTApi.fetchProcesses(processesQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },

      {
        queryKey: [getAllProcessPairs()],
        queryFn: () => RESTApi.fetchProcessesPairs(),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [gePrometheusQueryPATH('single'), metricQueryParams],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            metricQueryParams
          }),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return {
    processes: processes.results,
    processesPairs: processesPairs.results,
    metrics
  };
};

export default useTopologyProcessData;
