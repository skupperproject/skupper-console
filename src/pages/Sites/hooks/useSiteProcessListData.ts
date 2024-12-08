import { useSuspenseQuery } from '@tanstack/react-query';

import { Role } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { QueriesSites } from '../Sites.enum';

const processQueryParams = { processRole: [Role.Remote, Role.External] };

export const useSiteProcessListData = (id: string) => {
  const { data: processes } = useSuspenseQuery({
    queryKey: [QueriesSites.GetProcessesBySiteId, { ...processQueryParams, parent: id }],
    queryFn: () => RESTApi.fetchProcesses({ ...processQueryParams, parent: id }),
    refetchInterval: UPDATE_INTERVAL
  });

  return { processes: processes.results };
};
