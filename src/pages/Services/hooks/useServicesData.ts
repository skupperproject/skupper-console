import { startTransition, useCallback, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { UPDATE_INTERVAL } from '../../../config/config';
import { QueryFilters } from '../../../types/REST.interfaces';
import { QueriesServices } from '../Services.enum';

interface useServicesDataProps {
  limit: number;
}

const useServicesData = ({ limit }: useServicesDataProps) => {
  const [servicesQueryParams, setServicesQueryParams] = useState<QueryFilters>({ limit });

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
    services: services.results.filter(({ listenerCount }) => listenerCount > 0),
    summary: { serviceCount: services.timeRangeCount },
    handleSetServiceFilters
  };
};

export default useServicesData;
