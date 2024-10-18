import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { UPDATE_INTERVAL } from '../../../config/config';
import { ProcessPairsResponse } from '../../../types/REST.interfaces';
import { QueriesProcesses } from '../Processes.enum';

export const useProcessOverviewData = (id: string) => {
  const queryParams = (idKey: keyof ProcessPairsResponse) => ({ [idKey]: id });

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessPairsResult, queryParams('sourceId')],
        queryFn: () => RESTApi.fetchProcessesPairs(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcesses.GetProcessPairsResult, queryParams('destinationId')],
        queryFn: () => RESTApi.fetchProcessesPairs(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { pairsTx: pairsTx.results, pairsRx: pairsRx.results };
};
