import { startTransition, useCallback, useState } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { QueryFilters } from '@sk-types/REST.interfaces';

import { ServicesController } from '../services';
import { QueriesServices } from '../Services.enum';

interface useServicesDataProps {
  limit: number;
}

const useServicesData = ({ limit }: useServicesDataProps) => {
  const [servicesQueryParams, setServicesQueryParams] = useState<QueryFilters>({ limit });

  const [{ data: services }, { data: tcpActiveFlows }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesServices.GetServices, servicesQueryParams],
        queryFn: () => RESTApi.fetchServices(servicesQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesServices.GetPrometheusActiveFlows],
        queryFn: () => PrometheusApi.fetchOpenConnectionsByService(),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const handleSetServiceFilters = useCallback((params: QueryFilters) => {
    startTransition(() => {
      setServicesQueryParams((previousQueryParams) => ({ ...previousQueryParams, ...params }));
    });
  }, []);

  const servicesExtended = ServicesController.extendServicesWithActiveAndTotalFlowPairs(services.results, {
    tcpActiveFlows
  });

  return { services: servicesExtended, summary: { serviceCount: services.timeRangeCount }, handleSetServiceFilters };
};

export default useServicesData;
