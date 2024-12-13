import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { QueriesProcesses } from '../../Processes/Processes.enum';
import { QueriesComponent } from '../Components.enum';

export const useComponentData = (id: string) => {
  const [{ data: processes }, { data: component }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessPairs, { groupIdentity: id }],
        queryFn: () => RESTApi.fetchProcesses({ endTime: 0, groupIdentity: id }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesComponent.GetComponents, id],
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
