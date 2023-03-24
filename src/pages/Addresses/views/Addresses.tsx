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
import { AddressResponse } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import { addressesComponentsTables } from '../Addresses.constants';
import { AddressesColumnsNames, AddressesLabels } from '../Addresses.enum';
import { AddressesController } from '../services';
import { QueriesAddresses } from '../services/services.enum';

const columns = [
  {
    name: AddressesColumnsNames.Name,
    prop: 'name' as keyof AddressResponse,
    component: 'AddressNameLinkCell'
  },
  {
    name: AddressesColumnsNames.Protocol,
    prop: 'protocol' as keyof AddressResponse,
    width: 10
  }
];

const columnsWithFlowPairsCounters = [
  ...columns,
  {
    name: AddressesColumnsNames.CurrentFlowPairs,
    columnDescription: 'Active connection or requests',

    prop: 'currentFlows' as keyof AddressResponse,
    width: 15
  },
  {
    name: AddressesColumnsNames.TotalFLowPairs,
    columnDescription: 'Total connection or requests',

    prop: 'totalFlows' as keyof AddressResponse,
    width: 15
  }
];

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
  let columnsExtend = columns;

  if (httpTotalFlows && tcpActiveFlows) {
    addressExtended = AddressesController.extendAddressesWithActiveAndTotalFlowPairs(addresses, {
      httpTotalFlows,
      tcpActiveFlows
    });

    columnsExtend = columnsWithFlowPairsCounters;
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
