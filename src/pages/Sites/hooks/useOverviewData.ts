import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';

import { QueriesSites } from '../Sites.enum';

export const useSiteProcessOverviewData = (id: string) => {
  const queryParams = (idKey: 'sourceId' | 'destinationId') => ({ [idKey]: id });

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

  return { pairsTx, pairsRx };
};
