import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';

import { QueriesComponent } from '../Components.enum';

export const useComponentOverviewData = (id: string) => {
  const queryParams = (idKey: 'sourceId' | 'destinationId') => ({ [idKey]: id });

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesComponent.GetComponentPairs, queryParams('sourceId')],
        queryFn: () => RESTApi.fetchProcessGroupsPairs(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesComponent.GetComponentPairs, queryParams('destinationId')],
        queryFn: () => RESTApi.fetchProcessGroupsPairs(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { pairsTx, pairsRx };
};
