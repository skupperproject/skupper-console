import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { PairsResponse } from '../../../types/REST.interfaces';
import { QueriesSites } from '../Sites.enum';

export const useSiteOverviewData = (id: string) => {
  const queryParams = (idKey: keyof PairsResponse) => ({ [idKey]: id });

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesSites.GetSitesPairs, queryParams('sourceId')],
        queryFn: () => RESTApi.fetchSitesPairs(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesSites.GetSitesPairs, queryParams('destinationId')],
        queryFn: () => RESTApi.fetchSitesPairs(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { pairsTx: pairsTx.results, pairsRx: pairsRx.results };
};
