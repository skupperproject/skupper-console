import { startTransition, useCallback, useState } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { UPDATE_INTERVAL } from '../../../config/config';
import { QueryFilters } from '../../../types/REST.interfaces';
import { QueriesServices } from '../Services.enum';

interface useServicesDataProps {
  limit: number;
}

const useServicesData = ({ limit }: useServicesDataProps) => {
  const [servicesQueryParams, setServicesQueryParams] = useState<QueryFilters>({ limit });

  const [{ data: services }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesServices.GetServices, { ...servicesQueryParams }],
        queryFn: () => RESTApi.fetchServices({ ...servicesQueryParams }),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const handleSetServiceFilters = useCallback((params: QueryFilters) => {
    startTransition(() => {
      setServicesQueryParams((previousQueryParams) => ({ ...previousQueryParams, ...params }));
    });
  }, []);

  return { services: services.results, summary: { serviceCount: services.timeRangeCount }, handleSetServiceFilters };
};

export default useServicesData;
