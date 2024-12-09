import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { QueriesSites } from '../Sites.enum';

export const useSitesData = () => {
  const { data } = useSuspenseQuery({
    queryKey: [QueriesSites.GetSites],
    queryFn: () => RESTApi.fetchSites(),
    refetchInterval: UPDATE_INTERVAL
  });

  return { sites: data.results, summary: { siteCount: data.timeRangeCount } };
};
