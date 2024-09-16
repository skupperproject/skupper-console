import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';

import { QueriesSites } from '../Sites.enum';

export const useSiteData = (id: string) => {
  const { data } = useSuspenseQuery({
    queryKey: [QueriesSites.GetSite, id],
    queryFn: () => RESTApi.fetchSite(id),
    refetchInterval: UPDATE_INTERVAL
  });

  return { site: data.results };
};
