import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesProcesses } from '@pages/Processes/Processes.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../Topology.enum';

interface UseSiteTopologyProcessDataProps {
  idSelected?: string;
  showBytes: boolean;
  showByteRate: boolean;
  showLatency: boolean;
}

const processesQueryParams = {
  processRole: ['remote', 'external'],
  endTime: 0
};

const metricQueryParams = {
  fetchBytes: { groupBy: 'destProcess, sourceProcess, direction' },
  fetchByteRate: { groupBy: 'destProcess, sourceProcess, direction' },
  fetchLatency: { groupBy: 'sourceProcess, destProcess' }
};

const useTopologyProcessData = ({
  idSelected,
  showBytes,
  showByteRate,
  showLatency
}: UseSiteTopologyProcessDataProps) => {
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
        queryKey: [QueriesTopology.GetBytesByProcessPairs, showBytes, showByteRate, showLatency],
        queryFn: () =>
          TopologyController.getTopologyMetrics({
            showBytes,
            showByteRate,
            showLatency,
            params: metricQueryParams
          }),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  //transform data
  let filteredPairs = processesPairs;
  let filteredProcesses = processes;

  // check if in the UI we are displaying data links and the option "show only neighbours" is selected
  if (idSelected) {
    if (filteredPairs && idSelected) {
      filteredPairs = filteredPairs.filter((edge) => edge.sourceId === idSelected || edge.destinationId === idSelected);

      const ids = filteredPairs.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
      //It retrieves process neighbours and the process selected himself
      filteredProcesses = processes.filter(({ identity }) => ids.includes(identity));
    }
  }

  return {
    processes: filteredProcesses,
    processesPairs: filteredPairs,
    metrics
  };
};

export default useTopologyProcessData;
