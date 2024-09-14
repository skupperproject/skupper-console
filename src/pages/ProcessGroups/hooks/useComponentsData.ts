import { startTransition, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { Role } from '@API/REST.enum';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { RemoteFilterOptions } from '@sk-types/REST.interfaces';

import { QueriesComponent } from '../Components.enum';

const defaultQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  processGroupRole: [Role.Remote, Role.External],
  endTime: 0
};

export const useComponentsData = () => {
  const [queryParams, setQueryParams] = useState<RemoteFilterOptions>(defaultQueryParams);

  const { data } = useSuspenseQuery({
    queryKey: [QueriesComponent.GetComponents, queryParams],
    queryFn: () => RESTApi.fetchComponents(queryParams),
    refetchInterval: UPDATE_INTERVAL
  });

  function handleGetFilters(filters: RemoteFilterOptions) {
    startTransition(() => {
      setQueryParams((prevQueryParams) => ({ ...prevQueryParams, ...filters }));
    });
  }

  return { components: data.results, summary: { componentCount: data.timeRangeCount }, handleGetFilters };
};
