import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { LinkResponse } from '@sk-types/REST.interfaces';

import { QueriesSites } from '../Sites.enum';

export const useSiteDetailsData = (id: string) => {
  const queryParams = (idKey: keyof LinkResponse) => ({ [idKey]: id });

  const [{ data: sites }, { data: links }] = useSuspenseQueries({
    queries: [
      { queryKey: [QueriesSites.GetSites], queryFn: () => RESTApi.fetchSites(), refetchInterval: UPDATE_INTERVAL },
      {
        queryKey: [QueriesSites.GetLinksBySiteId, queryParams('sourceSiteId')],
        queryFn: () => RESTApi.fetchLinks(queryParams('sourceSiteId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { sites: sites.results, links: links.results };
};
