import { useSuspenseQueries } from '@tanstack/react-query';

import { getAllLinks } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { RouterLinkResponse } from '../../../types/REST.interfaces';

export const useSiteLinksData = (id: string) => {
  const queryParams = (idKey: keyof RouterLinkResponse) => ({ [idKey]: id });

  const [{ data: links }, { data: remoteLinks }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [getAllLinks(), queryParams('sourceSiteId')],
        queryFn: () => RESTApi.fetchLinks(queryParams('sourceSiteId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [getAllLinks(), queryParams('destinationSiteId')],
        queryFn: () => RESTApi.fetchLinks(queryParams('destinationSiteId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { links: links.results, remoteLinks: remoteLinks.results };
};
