import { useSuspenseQueries } from '@tanstack/react-query';

import { Role } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { QueriesProcesses } from '../../Processes/Processes.enum';
import { TopologyController } from '../services';
import { QueriesPairs } from '../Topology.enum';

const processesQueryParams = {
  processRole: [Role.Remote, Role.External],
  endTime: 0
};

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName}` },
  fetchLatency: {
    groupBy: `${PrometheusLabelsV2.SourceProcessName},${PrometheusLabelsV2.DestProcessName},${PrometheusLabelsV2.Direction}`
  }
};

const useTopologyProcessData = () => {
  const [{ data: processes }, { data: processesPairs }, { data: metrics }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcesses, processesQueryParams],
        queryFn: () => RESTApi.fetchProcesses(processesQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },

      {
        queryKey: [QueriesProcesses.GetProcessPairs],
        queryFn: () => RESTApi.fetchProcessesPairs(),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesPairs.GetMetricsByPairs],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
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
