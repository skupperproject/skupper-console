import React from 'react';

import { Card, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import SectionTitle from '@core/components/SectionTitle';
import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { AvailableProtocols } from 'API/REST.enum';
import { AddressResponse } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import { addressesComponentsTables } from '../Addresses.constants';
import { AddressesColumnsNames, AddressesLabels } from '../Addresses.enum';
import { QueriesAddresses } from '../services/services.enum';

const Addresses = function () {
  const navigate = useNavigate();

  const { data: addresses, isLoading } = useQuery([QueriesAddresses.GetAddresses], () => RESTApi.fetchAddresses(), {
    onError: handleError
  });

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    navigate(route);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!addresses) {
    return null;
  }

  const sortedAddressesTCP = addresses.filter(({ protocol }) => protocol === AvailableProtocols.Tcp);
  const sortedAddressesHTTP = addresses.filter(({ protocol }) => protocol !== AvailableProtocols.Tcp);

  return (
    <TransitionPage>
      <>
        <SectionTitle title={AddressesLabels.Section} description={AddressesLabels.Description} />

        <Grid hasGutter data-cy="sk-addresses">
          <GridItem span={6}>
            <Card isFullHeight>
              <SkTable
                title={AddressesLabels.TCP}
                columns={generateColumns(AvailableProtocols.Tcp)}
                rows={sortedAddressesTCP}
                pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                components={addressesComponentsTables}
              />
            </Card>
          </GridItem>

          <GridItem span={6}>
            <Card isFullHeight>
              <SkTable
                title={AddressesLabels.HTTP}
                columns={generateColumns(AvailableProtocols.Http)}
                pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                rows={sortedAddressesHTTP}
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

function isTcp(protocolSelected: AvailableProtocols) {
  return protocolSelected === AvailableProtocols.Tcp;
}

function generateColumns(protocol: AvailableProtocols) {
  const columns = [
    {
      name: AddressesColumnsNames.Name,
      prop: 'name' as keyof AddressResponse,
      component: 'AddressNameLinkCell'
    }
  ];

  if (!isTcp(protocol)) {
    return [
      ...columns,
      {
        name: AddressesColumnsNames.Protocol,
        prop: 'protocol' as keyof AddressResponse,
        width: 15
      }
    ];
  }

  return columns;
}
