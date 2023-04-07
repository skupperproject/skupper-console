import React from 'react';

import { Card, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST';
import { DEFAULT_TABLE_PAGE_SIZE } from '@config/config';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Slide';
import LoadingPage from '@pages/shared/Loading';
import { PrometheusApi } from 'API/Prometheus';
import { isPrometheusActive } from 'API/Prometheus.constant';

import {
  addressesColumns,
  addressesColumnsWithFlowPairsCounters,
  addressesComponentsTables
} from '../Addresses.constants';
import { AddressesLabels } from '../Addresses.enum';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const Addresses = function () {
  const { data: addresses, isLoading } = useQuery([QueriesAddresses.GetAddresses], () => RESTApi.fetchAddresses());

  const { data: tcpActiveFlows, isLoading: isLoadingTcpActiveFlows } = useQuery(
    ['QueriesAddresses.GetFlowsByProtocol'],
    () => PrometheusApi.fetchFlowsByAddress({ onlyActive: true }),
    {
      enabled: isPrometheusActive()
    }
  );

  const { data: httpTotalFlows, isLoading: isLoadingHttpTotalFlows } = useQuery(
    ['QueriesAddresses.GetHttpFlowsByProtocol'],
    () => PrometheusApi.fetchFlowsByAddress({}),
    {
      enabled: isPrometheusActive()
    }
  );

  if (isLoading || ((isLoadingTcpActiveFlows || isLoadingHttpTotalFlows) && isPrometheusActive())) {
    return <LoadingPage />;
  }

  if (!addresses) {
    return null;
  }

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
        <Grid hasGutter data-cy="sk-addresses">
          <GridItem>
            <Card isFullHeight>
              <SkTable
                rows={addressExtended}
                columns={columnsExtend}
                pageSizeStart={DEFAULT_TABLE_PAGE_SIZE * 5}
                components={addressesComponentsTables}
              />
            </Card>
          </GridItem>
        </Grid>
      </>
    </TransitionPage>
  );
};

export default Addresses;
