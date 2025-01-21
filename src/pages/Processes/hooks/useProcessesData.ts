import { startTransition, useCallback, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { getAllProcesses } from '../../../API/REST.endpoints';
import { Role } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { BIG_PAGINATION_SIZE } from '../../../config/app';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { QueryFilters } from '../../../types/REST.interfaces';

const defaultQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  role: [Role.Remote, Role.External],
  endTime: 0
};

export const useProcessesData = () => {
  const [queryParams, setQueryParams] = useState<QueryFilters>(defaultQueryParams);

  const { data } = useSuspenseQuery({
    queryKey: [getAllProcesses(), queryParams],
    queryFn: () => RESTApi.fetchProcesses(queryParams),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleGetFilters = useCallback((filters: QueryFilters) => {
    startTransition(() => {
      setQueryParams((prevQueryParams) => ({ ...prevQueryParams, ...filters }));
    });
  }, []);

  return { processes: data.results, summary: { processCount: data.timeRangeCount }, handleGetFilters };
};
