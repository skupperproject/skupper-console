import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/app';
import { PairsResponse } from '../../../types/REST.interfaces';
import { QueriesComponent } from '../Components.enum';

export const useComponentOverviewData = (id: string) => {
  const queryParams = (idKey: keyof PairsResponse) => ({ [idKey]: id });

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesComponent.GetComponentPairs, queryParams('sourceId')],
        queryFn: () => RESTApi.fetchComponentsPairs(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesComponent.GetComponentPairs, queryParams('destinationId')],
        queryFn: () => RESTApi.fetchComponentsPairs(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { pairsTx: pairsTx.results, pairsRx: pairsRx.results };
};
