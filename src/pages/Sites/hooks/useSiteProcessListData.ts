import { useSuspenseQuery } from '@tanstack/react-query';

import { getAllProcesses } from '../../../API/REST.endpoints';
import { Role } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';

const processQueryParams = { role: [Role.Remote, Role.External] };

export const useSiteProcessListData = (id: string) => {
  const { data: processes } = useSuspenseQuery({
    queryKey: [getAllProcesses(), { ...processQueryParams, siteId: id }],
    queryFn: () => RESTApi.fetchProcesses({ ...processQueryParams, siteId: id }),
    refetchInterval: UPDATE_INTERVAL
  });

  return { processes: processes.results };
};
