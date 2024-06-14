import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesProcesses } from '@pages/Processes/Processes.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../Topology.enum';

interface UseSiteTopologyProcessDataProps {
  idsSelected?: string[];
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
  idsSelected,
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

  let filteredPairs = processesPairs;
  let filteredProcesses = processes;

  if (idsSelected) {
    filteredPairs = filterPairsByIdsSelected(filteredPairs, idsSelected);
    const uniqueIds = getUniqueIdsFromFilteredPairs(filteredPairs, idsSelected);
    filteredProcesses = filterProcessesByUniqueIds(filteredProcesses, uniqueIds);
  }

  return {
    processes: filteredProcesses,
    processesPairs: filteredPairs,
    metrics
  };
};

export default useTopologyProcessData;

function filterPairsByIdsSelected(pairs: ProcessPairsResponse[], idsSelected: string[]) {
  return pairs.filter((edge) =>
    idsSelected.every((ids) => {
      const splitIds = ids.split('~');

      return splitIds.includes(edge.sourceId) || splitIds.includes(edge.destinationId);
    })
  );
}

// Function to extract unique IDs from filtered pairs
function getUniqueIdsFromFilteredPairs(filteredPairs: ProcessPairsResponse[], idsSelected: string[]) {
  const idsFromEdges = filteredPairs.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
  const allIds = idsSelected.flatMap((ids) => ids.split('~')).concat(idsFromEdges);

  return [...new Set(allIds)];
}

// Function to filter processes based on unique IDs using a Set for faster lookups
function filterProcessesByUniqueIds(processes: ProcessResponse[], uniqueIds: string[]) {
  const uniqueIdsSet = new Set(uniqueIds);

  return processes.filter(({ identity }) => uniqueIdsSet.has(identity));
}
