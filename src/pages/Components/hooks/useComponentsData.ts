import { startTransition, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { getAllComponents } from '../../../API/REST.endpoints';
import { Role } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { BIG_PAGINATION_SIZE } from '../../../config/app';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { QueryFilters } from '../../../types/REST.interfaces';

const defaultQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  processGroupRole: [Role.Remote, Role.External],
  endTime: 0
};

export const useComponentsData = () => {
  const [queryParams, setQueryParams] = useState<QueryFilters>(defaultQueryParams);

  const { data } = useSuspenseQuery({
    queryKey: [getAllComponents(), queryParams],
    queryFn: () => RESTApi.fetchComponents(queryParams),
    refetchInterval: UPDATE_INTERVAL
  });

  function handleGetFilters(filters: QueryFilters) {
    startTransition(() => {
      setQueryParams((prevQueryParams) => ({ ...prevQueryParams, ...filters }));
    });
  }

  return { components: data.results, summary: { componentCount: data.timeRangeCount }, handleGetFilters };
};
