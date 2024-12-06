import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { UPDATE_INTERVAL } from '../../../config/config';
import { QueryFilters } from '../../../types/REST.interfaces';
import { QueriesProcesses } from '../Processes.enum';

export const useRequestsData = (queryParams: QueryFilters, sourceProcessId: string, destProcessId: string) => {
  const { data } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetBiFlows, queryParams, sourceProcessId, destProcessId],
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
    queryKey: [QueriesProcesses.GetBiFlows, queryParams, sourceProcessId, destProcessId],
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
