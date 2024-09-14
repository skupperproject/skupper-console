import { startTransition, useCallback, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { Role } from '@API/REST.enum';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { RemoteFilterOptions } from '@sk-types/REST.interfaces';

import { QueriesProcesses } from '../Processes.enum';

const defaultQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  processRole: [Role.Remote, Role.External],
  endTime: 0
};

export const useProcessesData = () => {
  const [queryParams, setQueryParams] = useState<RemoteFilterOptions>(defaultQueryParams);

  const { data } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetProcessesPaginated, queryParams],
    queryFn: () => RESTApi.fetchProcesses(queryParams),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleGetFilters = useCallback((filters: RemoteFilterOptions) => {
    startTransition(() => {
      setQueryParams((prevQueryParams) => ({ ...prevQueryParams, ...filters }));
    });
  }, []);

  return { processes: data.results, summary: { processCount: data.timeRangeCount }, handleGetFilters };
};
