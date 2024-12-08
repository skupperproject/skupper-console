import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { QueryFilters } from '../../../types/REST.interfaces';
import { QueriesProcesses } from '../Processes.enum';

export const useRequestsData = (queryParams: QueryFilters, sourceProcessId: string, destProcessId: string) => {
  const { data } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetHttpRequests, queryParams, sourceProcessId, destProcessId],
    queryFn: () =>
      RESTApi.fetchApplicationFlows({
        ...queryParams,
        sourceProcessId,
        destProcessId
      }),
    refetchInterval: UPDATE_INTERVAL
  });

  return data;
};

export const useConnectionsData = (queryParams: QueryFilters, sourceProcessId: string, destProcessId: string) => {
  const biFlowsQuery = RESTApi.fetchTransportFlows;
  const { data } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetTcpConnections, queryParams, sourceProcessId, destProcessId],
    queryFn: () =>
      biFlowsQuery({
        ...queryParams,
        sourceProcessId,
        destProcessId
      }),
    refetchInterval: UPDATE_INTERVAL
  });

  return data;
};
