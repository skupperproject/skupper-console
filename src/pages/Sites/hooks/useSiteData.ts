import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { Role } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';

import { QueriesSites } from '../Sites.enum';

const processQueryParams = {
  limit: 0,
  processRole: [Role.Remote, Role.External]
};

export const useSiteData = (id: string) => {
  const { data } = useSuspenseQuery({
    queryKey: [QueriesSites.GetSite, id],
    queryFn: () => RESTApi.fetchSite(id),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: processes } = useQuery({
    queryKey: [QueriesSites.GetProcessesBySiteId, { ...processQueryParams, parent: id }],
    queryFn: () => RESTApi.fetchProcesses({ ...processQueryParams, parent: id }),
    refetchInterval: UPDATE_INTERVAL
  });

  return { site: data.results, summary: { processCount: processes?.timeRangeCount || 0 } };
};
