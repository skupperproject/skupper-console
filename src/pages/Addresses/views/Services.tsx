import { useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { RequestOptions } from '@API/REST.interfaces';
import { BIG_PAGINATION_SIZE, isPrometheusActive } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import SearchFilter from '@core/components/skSearchFilter';
import SkTable from '@core/components/SkTable';
import MainContainer from '@layout/MainContainer';

import { AddressesController } from '../services';
import { QueriesServices } from '../services/services.enum';
import { ServiceColumns, customServiceCells, servicesSelectOptions } from '../Services.constants';
import { AddressesLabels } from '../Services.enum';

const initOldConnectionsQueryParams: RequestOptions = {
  limit: BIG_PAGINATION_SIZE
};

const Services = function () {
  const [servicesQueryParams, setServicesQueryParams] = useState<RequestOptions>(initOldConnectionsQueryParams);

  const { data: servicesData } = useQuery(
    [QueriesServices.GetAddresses, servicesQueryParams],
    () => RESTApi.fetchAddresses(servicesQueryParams),
    {
      keepPreviousData: true
    }
  );

  const { data: tcpActiveFlows } = useQuery(
    [QueriesServices.GetPrometheusActiveFlows],
    () => PrometheusApi.fetchActiveFlowsByAddress(),
    {
      enabled: isPrometheusActive
    }
  );

  const { data: httpTotalFlows } = useQuery(
    [QueriesServices.GetPrometheusHttpTotalFlows],
    () => PrometheusApi.fetchHttpFlowsByAddress(),
    {
      enabled: isPrometheusActive
    }
  );

  const { data: tcpTotalFlows } = useQuery(
    [QueriesServices.GetPrometheusTcpTotalFlows],
    () => PrometheusApi.fetchTcpFlowsByAddress(),
    {
      enabled: isPrometheusActive
    }
  );

  const handleSetServiceFilters = useCallback((params: RequestOptions) => {
    setServicesQueryParams((previousQueryParams) => ({ ...previousQueryParams, ...params }));
  }, []);

  const services = servicesData?.results || [];
  const serviceCount = servicesData?.timeRangeCount || 0;

  const serviceRows = AddressesController.extendAddressesWithActiveAndTotalFlowPairs(services, {
    httpTotalFlows,
    tcpTotalFlows,
    tcpActiveFlows
  });

  return (
    <MainContainer
      dataTestId={getTestsIds.servicesView()}
      title={AddressesLabels.Section}
      description={AddressesLabels.Description}
      mainContentChildren={
        <>
          <SearchFilter onSearch={handleSetServiceFilters} selectOptions={servicesSelectOptions} />

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
