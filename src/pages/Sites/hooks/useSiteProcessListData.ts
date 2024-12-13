import { useSuspenseQuery } from '@tanstack/react-query';

import { Role } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { QueriesProcesses } from '../../Processes/Processes.enum';

const processQueryParams = { processRole: [Role.Remote, Role.External] };

export const useSiteProcessListData = (id: string) => {
  const { data: processes } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetProcesses, { ...processQueryParams, parent: id }],
    queryFn: () => RESTApi.fetchProcesses({ ...processQueryParams, parent: id }),
    refetchInterval: UPDATE_INTERVAL
  });

  return { processes: processes.results };
};
