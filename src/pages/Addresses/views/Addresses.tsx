import React from 'react';

import { Card, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import SectionTitle from '@core/components/SectionTitle';
import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { PrometheusApi } from 'API/Prometheus';
import { isPrometheusActive } from 'API/Prometheus.constant';
import { RESTApi } from 'API/REST';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import {
  addressesColumns,
  addressesColumnsWithFlowPairsCounters,
  addressesComponentsTables
} from '../Addresses.constants';
import { AddressesLabels } from '../Addresses.enum';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const Addresses = function () {
  const navigate = useNavigate();

  const { data: addresses, isLoading } = useQuery([QueriesAddresses.GetAddresses], () => RESTApi.fetchAddresses(), {
    onError: handleError
  });

  const { data: tcpActiveFlows, isLoading: isLoadingTcpActiveFlows } = useQuery(
    ['QueriesAddresses.GetFlowsByProtocol'],
    () => PrometheusApi.fetchFlowsByAddress({ onlyActive: true }),
    {
      enabled: isPrometheusActive(),
      onError: handleError
    }
  );

  const { data: httpTotalFlows, isLoading: isLoadingHttpTotalFlows } = useQuery(
    ['QueriesAddresses.GetHttpFlowsByProtocol'],
    () => PrometheusApi.fetchFlowsByAddress({}),
    {
      enabled: isPrometheusActive(),
      onError: handleError
    }
  );

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    navigate(route);
  }

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
        <SectionTitle title={AddressesLabels.Section} description={AddressesLabels.Description} />
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
