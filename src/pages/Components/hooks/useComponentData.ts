import { useSuspenseQueries } from '@tanstack/react-query';

import { getAllComponents, getAllProcesses } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';

export const useComponentData = (id: string) => {
  const [{ data: processes }, { data: component }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [getAllProcesses(), { groupIdentity: id }],
        queryFn: () => RESTApi.fetchProcesses({ endTime: 0, groupIdentity: id }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [getAllComponents(), id],
        queryFn: () => RESTApi.fetchComponent(id),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return {
    component: component.results,
    processes: processes.results,
    summary: { processCount: component.results.processCount || 0 }
  };
};
