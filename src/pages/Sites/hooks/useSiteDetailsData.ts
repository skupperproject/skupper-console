import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { RouterLinkResponse } from '@sk-types/REST.interfaces';

import { QueriesSites } from '../Sites.enum';

export const useSiteDetailsData = (id: string) => {
  const queryParams = (idKey: keyof RouterLinkResponse) => ({ [idKey]: id });

  const { data: links } = useSuspenseQuery({
    queryKey: [QueriesSites.GetLinks, queryParams('sourceSiteId')],
    queryFn: () => RESTApi.fetchLinks(queryParams('sourceSiteId')),
    refetchInterval: UPDATE_INTERVAL
  });

  return { links: links.results };
};
