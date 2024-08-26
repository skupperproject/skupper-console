import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { Role } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesProcesses } from '@pages/Processes/Processes.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../Topology.enum';

const processesQueryParams = {
  processRole: [Role.Remote, Role.External],
  endTime: 0
};

const metricQueryParams = {
  fetchBytes: { groupBy: 'destProcess, sourceProcess, direction' },
  fetchByteRate: { groupBy: 'destProcess, sourceProcess, direction' },
  fetchLatency: { groupBy: 'sourceProcess, destProcess, direction' }
};

const useTopologyProcessData = () => {
  const [{ data: processes }, { data: processesPairs }, { data: metrics }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessResult, processesQueryParams],
        queryFn: () => RESTApi.fetchProcessesResult(processesQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },

      {
        queryKey: [QueriesTopology.GetProcessesPairs],
        queryFn: () => RESTApi.fetchProcessesPairsResult(),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesTopology.GetBytesByProcessPairs],
        queryFn: () =>
          TopologyController.getTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            params: metricQueryParams
          }),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return {
    processes,
    processesPairs,
    metrics
  };
};

export default useTopologyProcessData;
