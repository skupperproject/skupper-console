import { useSuspenseQueries } from '@tanstack/react-query';

import { getAllComponentPairs } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { PairsResponse } from '../../../types/REST.interfaces';

export const useComponentOverviewData = (id: string) => {
  const queryParams = (idKey: keyof PairsResponse) => ({ [idKey]: id });

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [getAllComponentPairs(), queryParams('sourceId')],
        queryFn: () => RESTApi.fetchComponentsPairs(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [getAllComponentPairs(), queryParams('destinationId')],
        queryFn: () => RESTApi.fetchComponentsPairs(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { pairsTx: pairsTx.results, pairsRx: pairsRx.results };
};
