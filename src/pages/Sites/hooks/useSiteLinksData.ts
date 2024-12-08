import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/app';
import { RouterLinkResponse } from '../../../types/REST.interfaces';
import { QueriesSites } from '../Sites.enum';

export const useSiteLinksData = (id: string) => {
  const queryParams = (idKey: keyof RouterLinkResponse) => ({ [idKey]: id });

  const [{ data: links }, { data: remoteLinks }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesSites.GetLinks, queryParams('sourceSiteId')],
        queryFn: () => RESTApi.fetchLinks(queryParams('sourceSiteId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesSites.GetLinks, queryParams('destinationSiteId')],
        queryFn: () => RESTApi.fetchLinks(queryParams('destinationSiteId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { links: links.results, remoteLinks: remoteLinks.results };
};
