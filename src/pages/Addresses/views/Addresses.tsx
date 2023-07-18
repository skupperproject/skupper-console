import { useCallback, useState } from 'react';

import { Card, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { RequestOptions } from '@API/REST.interfaces';
import { BIG_PAGINATION_SIZE, isPrometheusActive } from '@config/config';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Fade';
import LoadingPage from '@pages/shared/Loading';

import { addressesColumns, addressesColumnsWithFlowPairsCounters, customAddressCells } from '../Addresses.constants';
import { AddressesLabels } from '../Addresses.enum';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const initPaginatedOldConnectionsQueryParams: RequestOptions = {
  limit: BIG_PAGINATION_SIZE
};

const Addresses = function () {
  const [addressesQueryParamsPaginated, setAddressesQueryParamsPaginated] = useState<RequestOptions>(
    initPaginatedOldConnectionsQueryParams
  );

  const { data: addressesData, isLoading } = useQuery(
    [QueriesAddresses.GetAddresses, { ...initPaginatedOldConnectionsQueryParams, ...addressesQueryParamsPaginated }],
    () => RESTApi.fetchAddresses({ ...initPaginatedOldConnectionsQueryParams, ...addressesQueryParamsPaginated }),
    {
      keepPreviousData: true
    }
  );

  const { data: tcpActiveFlows, isLoading: isLoadingTcpActiveFlows } = useQuery(
    [QueriesAddresses.GetPrometheusActiveFlows],
    () => PrometheusApi.fetchActiveFlowsByAddress(),
    {
      enabled: isPrometheusActive
    }
  );

  const { data: httpTotalFlows, isLoading: isLoadingHttpTotalFlows } = useQuery(
    [QueriesAddresses.GetPrometheusTotalFlows],
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

  const addresses = addressesData?.results || [];
  const addressesRowsCount = addressesData?.timeRangeCount;

  let addressExtended = addresses;
  let columnsExtend = addressesColumns;

  if (httpTotalFlows && tcpActiveFlows) {
    addressExtended = AddressesController.extendAddressesWithActiveAndTotalFlowPairs(addresses, {
      httpTotalFlows,
      tcpActiveFlows
    });

    columnsExtend = addressesColumnsWithFlowPairsCounters;
  }

  return (
    <TransitionPage>
      <>
        <SkTitle title={AddressesLabels.Section} description={AddressesLabels.Description} />
        {/* addresses table */}
        <Grid hasGutter>
          <GridItem>
            <Card isFullHeight>
              <SkTable
                rows={addressExtended}
                columns={columnsExtend}
                pagination={true}
                paginationPageSize={BIG_PAGINATION_SIZE}
                onGetFilters={handleGetFiltersAddressses}
                paginationTotalRows={addressesRowsCount}
                customCells={customAddressCells}
              />
            </Card>
          </GridItem>
        </Grid>
      </>
    </TransitionPage>
  );
};

export default Addresses;
