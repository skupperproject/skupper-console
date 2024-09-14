import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';

import { QueriesProcesses } from '../Processes.enum';

export const useProcessOverviewData = (id: string) => {
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

  return { pairsTx, pairsRx };
};
