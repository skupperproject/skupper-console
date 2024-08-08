import { startTransition, useCallback, useState } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { RemoteFilterOptions } from '@API/REST.interfaces';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { getTestsIds } from '@config/testIds';
import SkTable from '@core/components/SkTable';
import SkSearchFilter from '@core/components/SkTable/SkSearchFilter';
import MainContainer from '@layout/MainContainer';

import { ServicesController } from '../services';
import { ServiceColumns, customServiceCells, servicesSelectOptions } from '../Services.constants';
import { ServicesLabels, QueriesServices } from '../Services.enum';

const initOldConnectionsQueryParams: RemoteFilterOptions = {
  limit: BIG_PAGINATION_SIZE
};

const Services = function () {
  const [servicesQueryParams, setServicesQueryParams] = useState<RemoteFilterOptions>(initOldConnectionsQueryParams);

  const [{ data: servicesData }, { data: tcpActiveFlows }] = useSuspenseQueries({
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

  const services = servicesData?.results || [];
  const serviceCount = servicesData?.timeRangeCount || 0;

  const serviceRows = ServicesController.extendServicesWithActiveAndTotalFlowPairs(services, {
    tcpActiveFlows
  });

  return (
    <MainContainer
      dataTestId={getTestsIds.servicesView()}
      title={ServicesLabels.Section}
      description={ServicesLabels.Description}
      mainContentChildren={
        <>
          <SkSearchFilter onSearch={handleSetServiceFilters} selectOptions={servicesSelectOptions} />

          <SkTable
            rows={serviceRows}
            columns={ServiceColumns}
            pagination={true}
            paginationPageSize={initOldConnectionsQueryParams.limit}
            onGetFilters={handleSetServiceFilters}
            paginationTotalRows={serviceCount}
            customCells={customServiceCells}
          />
        </>
      }
    />
  );
};

export default Services;
