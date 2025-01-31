import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { getAllProcesses, getAllSites } from '../../../API/REST.endpoints';
import { Role } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';

const processQueryParams = {
  limit: 0,
  role: [Role.Remote, Role.External]
};

export const useSiteData = (id: string) => {
  const { data } = useSuspenseQuery({
    queryKey: [getAllSites(), id],
    queryFn: () => RESTApi.fetchSite(id),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: processes } = useQuery({
    queryKey: [getAllProcesses(), { ...processQueryParams, siteId: id }],
    queryFn: () => RESTApi.fetchProcesses({ ...processQueryParams, siteId: id }),
    refetchInterval: UPDATE_INTERVAL
  });

  return { site: data.results, summary: { processCount: processes?.timeRangeCount || 0 } };
};
