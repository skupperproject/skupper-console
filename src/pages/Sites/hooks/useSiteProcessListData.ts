import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { Role } from '../../../API/REST.enum';
import { UPDATE_INTERVAL } from '../../../config/config';
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
