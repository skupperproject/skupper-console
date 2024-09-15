import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';

import { QueriesServices } from '../Services.enum';

const initServersQueryParams = { limit: BIG_PAGINATION_SIZE };

export const useServersData = (id: string) => {
  const { data: servers } = useSuspenseQuery({
    queryKey: [QueriesServices.GetProcessesByService, { ...initServersQueryParams, addresses: [id] }],
    queryFn: () => RESTApi.fetchProcesses({ ...initServersQueryParams, addresses: [id] }),
    refetchInterval: UPDATE_INTERVAL
  });

  return { servers: servers.results };
};
