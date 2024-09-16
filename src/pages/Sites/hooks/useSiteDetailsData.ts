import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { Direction } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';

import { QueriesSites } from '../Sites.enum';

const linkQueryParams = { direction: Direction.Outgoing };

export const useSiteDetailsData = (id: string) => {
  const [{ data: sites }, { data: links }] = useSuspenseQueries({
    queries: [
      { queryKey: [QueriesSites.GetSites], queryFn: () => RESTApi.fetchSites(), refetchInterval: UPDATE_INTERVAL },
      {
        queryKey: [QueriesSites.GetLinksBySiteId, id, linkQueryParams],
        queryFn: () => RESTApi.fetchLinksBySite(id, linkQueryParams),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { sites: sites.results, links: links.results };
};
