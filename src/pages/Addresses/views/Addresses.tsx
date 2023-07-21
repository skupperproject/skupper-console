import { useCallback, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { RequestOptions } from '@API/REST.interfaces';
import { BIG_PAGINATION_SIZE, isPrometheusActive } from '@config/config';
import SkTable from '@core/components/SkTable';
import SkDefaultPage from '@layout/DefaultPage';
import LoadingPage from '@pages/shared/Loading';

import { addressesColumns, addressesColumnsWithFlowPairsCounters, customAddressCells } from '../Addresses.constants';
import { AddressesLabels } from '../Addresses.enum';
import { AddressesController } from '../services';
import { QueriesServices } from '../services/services.enum';

const initPaginatedOldConnectionsQueryParams: RequestOptions = {
  limit: BIG_PAGINATION_SIZE
};

const Services = function () {
  const [addressesQueryParamsPaginated, setAddressesQueryParamsPaginated] = useState<RequestOptions>(
    initPaginatedOldConnectionsQueryParams
  );

  const { data: addressesData, isLoading } = useQuery(
    [QueriesServices.GetAddresses, { ...initPaginatedOldConnectionsQueryParams, ...addressesQueryParamsPaginated }],
    () => RESTApi.fetchAddresses({ ...initPaginatedOldConnectionsQueryParams, ...addressesQueryParamsPaginated }),
    {
      keepPreviousData: true
    }
  );

  const { data: tcpActiveFlows, isLoading: isLoadingTcpActiveFlows } = useQuery(
    [QueriesServices.GetPrometheusActiveFlows],
    () => PrometheusApi.fetchActiveFlowsByAddress(),
    {
      enabled: isPrometheusActive
    }
  );

  const { data: httpTotalFlows, isLoading: isLoadingHttpTotalFlows } = useQuery(
    [QueriesServices.GetPrometheusTotalFlows],
    () => PrometheusApi.fetchFlowsByAddress(),
    {
      enabled: isPrometheusActive
    }
  );

  const handleGetFiltersAddressses = useCallback((params: RequestOptions) => {
    setAddressesQueryParamsPaginated(params);
  }, []);

  if (isLoading || ((isLoadingTcpActiveFlows || isLoadingHttpTotalFlows) && isPrometheusActive)) {
    return <LoadingPage />;
  }

  if (!addressesData) {
    return null;
  }

  const services = addressesData?.results || [];
  const addressesRowsCount = addressesData?.timeRangeCount;

  let servicesExtended = services;
  let columnsExtend = addressesColumns;

  if (httpTotalFlows && tcpActiveFlows) {
    servicesExtended = AddressesController.extendAddressesWithActiveAndTotalFlowPairs(services, {
      httpTotalFlows,
      tcpActiveFlows
    });

    columnsExtend = addressesColumnsWithFlowPairsCounters;
  }

  return (
    <SkDefaultPage
      title={AddressesLabels.Section}
      description={AddressesLabels.Description}
      secondaryChildren={
        <SkTable
          rows={servicesExtended}
          columns={columnsExtend}
          pagination={true}
          paginationPageSize={BIG_PAGINATION_SIZE}
          onGetFilters={handleGetFiltersAddressses}
          paginationTotalRows={addressesRowsCount}
          customCells={customAddressCells}
        />
      }
    />
  );
};

export default Services;
