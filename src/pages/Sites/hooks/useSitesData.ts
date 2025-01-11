import { useSuspenseQuery } from '@tanstack/react-query';

import { getAllSites } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';

export const useSitesData = () => {
  const { data } = useSuspenseQuery({
    queryKey: [getAllSites()],
    queryFn: () => RESTApi.fetchSites(),
    refetchInterval: UPDATE_INTERVAL
  });

  return { sites: data.results, summary: { siteCount: data.timeRangeCount } };
};
