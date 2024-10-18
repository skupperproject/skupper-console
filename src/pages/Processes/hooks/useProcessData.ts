import { useQueries, useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { UPDATE_INTERVAL } from '../../../config/config';
import { QueriesProcesses } from '../Processes.enum';

export const useProcessData = (id: string) => {
  const clientPairsQueryParams = {
    limit: 0,
    sourceId: id
  };

  const serverPairsQueryParams = {
    limit: 0,
    destinationId: id
  };

  const { data: process } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetProcess, id],
    queryFn: () => RESTApi.fetchProcess(id)
  });

  const [{ data: clientPairs }, { data: serverPairs }] = useQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessPairs, clientPairsQueryParams],
        queryFn: () => RESTApi.fetchProcessesPairs(clientPairsQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcesses.GetProcessPairs, serverPairsQueryParams],
        queryFn: () => RESTApi.fetchProcessesPairs(serverPairsQueryParams),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const processPairsCount = (clientPairs?.timeRangeCount || 0) + (serverPairs?.timeRangeCount || 0);

  return { process: process.results, summary: { processPairsCount } };
};
