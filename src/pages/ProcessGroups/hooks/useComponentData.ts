import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { UPDATE_INTERVAL } from '../../../config/config';
import { QueriesComponent } from '../Components.enum';

export const useComponentData = (id: string) => {
  const [{ data: processes }, { data: component }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesComponent.GetProcessesByComponent, { groupIdentity: id }],
        queryFn: () => RESTApi.fetchProcesses({ endTime: 0, groupIdentity: id }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesComponent.GetComponent, id],
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
