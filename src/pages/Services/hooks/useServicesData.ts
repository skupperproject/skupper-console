import { startTransition, useCallback, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/app';
import { QueryFilters } from '../../../types/REST.interfaces';
import { QueriesServices } from '../Services.enum';

interface useServicesDataProps {
  limit: number;
}

const useServicesData = ({ limit }: useServicesDataProps) => {
  const [servicesQueryParams, setServicesQueryParams] = useState<QueryFilters>({ limit, hasListener: true });

  const { data: services } = useSuspenseQuery({
    queryKey: [QueriesServices.GetServices, { ...servicesQueryParams }],
    queryFn: () => RESTApi.fetchServices({ ...servicesQueryParams }),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleSetServiceFilters = useCallback((params: QueryFilters) => {
    startTransition(() => {
      setServicesQueryParams((previousQueryParams) => ({ ...previousQueryParams, ...params }));
    });
  }, []);

  return {
    // We consider services with more than one listener
    services: services.results,
    summary: { serviceCount: services.timeRangeCount },
    handleSetServiceFilters
  };
};

export default useServicesData;
