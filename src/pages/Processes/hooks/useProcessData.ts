import { useQueries, useSuspenseQuery } from '@tanstack/react-query';

import { getAllProcesses, getAllProcessPairs } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';

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
    queryKey: [getAllProcesses(), id],
    queryFn: () => RESTApi.fetchProcess(id)
  });

  const [{ data: clientPairs }, { data: serverPairs }] = useQueries({
    queries: [
      {
        queryKey: [getAllProcessPairs(), clientPairsQueryParams],
        queryFn: () => RESTApi.fetchProcessesPairs(clientPairsQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [getAllProcessPairs(), serverPairsQueryParams],
        queryFn: () => RESTApi.fetchProcessesPairs(serverPairsQueryParams),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const processPairsCount = (clientPairs?.timeRangeCount || 0) + (serverPairs?.timeRangeCount || 0);

  return { process: process.results, summary: { processPairsCount } };
};
