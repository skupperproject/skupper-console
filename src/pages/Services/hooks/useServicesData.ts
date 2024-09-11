import { startTransition, useCallback, useState } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { RemoteFilterOptions } from '@sk-types/REST.interfaces';

import { ServicesController } from '../services';
import { QueriesServices } from '../Services.enum';

interface useServicesDataProps {
  limit: number;
}

const useServicesData = ({ limit }: useServicesDataProps) => {
  const [servicesQueryParams, setServicesQueryParams] = useState<RemoteFilterOptions>({ limit });

  const [
    {
      data: { timeRangeCount, results }
    },
    { data: tcpActiveFlows }
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesServices.GetServices, servicesQueryParams],
        queryFn: () => RESTApi.fetchServices(servicesQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesServices.GetPrometheusActiveFlows],
        queryFn: () => PrometheusApi.fetchTcpActiveFlowsByService(),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const handleSetServiceFilters = useCallback((params: RemoteFilterOptions) => {
    startTransition(() => {
      setServicesQueryParams((previousQueryParams) => ({ ...previousQueryParams, ...params }));
    });
  }, []);

  const serviceRows = ServicesController.extendServicesWithActiveAndTotalFlowPairs(results, { tcpActiveFlows });

  return {
    serviceRows,
    timeRangeCount,
    handleSetServiceFilters
  };
};

export default useServicesData;
