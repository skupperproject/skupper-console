import React, { FC, useCallback, useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbHeading,
  BreadcrumbItem,
  Card,
  Flex,
  Grid,
  GridItem,
  Tab,
  Tabs,
  TabTitleText,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import Metrics from '@pages/Processes/components/Metrics';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { isPrometheusActive } from 'API/Prometheus.constant';
import { RESTApi } from 'API/REST';
import { AvailableProtocols } from 'API/REST.enum';
import { RequestOptions } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import { ConnectionsByAddressColumns } from '../Addresses.constants';
import { FlowPairsLabelsTcp, AddressesRoutesPathLabel, AddressesRoutesPaths, FlowPairsLabel } from '../Addresses.enum';
import { ConnectionsByAddressProps } from '../Addresses.interfaces';
import FlowPairsTable from '../components/FlowPairsTable';
import ServersTable from '../components/ServersTable';
import { QueriesAddresses } from '../services/services.enum';

const initConnectionsQueryParamsPaginated = {
  offset: 0,
  limit: DEFAULT_TABLE_PAGE_SIZE,
  filter: 'endTime.0' // open connections
};

const ConnectionsByAddress: FC<ConnectionsByAddressProps> = function ({ addressId, addressName }) {
  const navigate = useNavigate();

  const [addressView, setAddressView] = useState<number>(0);
  const [connectionsQueryParamsPaginated, setConnectionsQueryParamsPaginated] = useState<RequestOptions>(
    initConnectionsQueryParamsPaginated
  );

  const { data: activeConnectionsData, isLoading: isLoadingActiveConnections } = useQuery(
    [QueriesAddresses.GetFlowPairsByAddress, addressId],
    () => (addressId ? RESTApi.fetchFlowPairsByAddress(addressId, connectionsQueryParamsPaginated) : undefined),
    {
      keepPreviousData: true,
      onError: handleError
    }
  );

  const { data: serversByAddressData, isLoading: isLoadingServersByAddress } = useQuery(
    [QueriesAddresses.GetProcessesByAddress, addressId],
    () => (addressId ? RESTApi.fetchServersByAddress(addressId, connectionsQueryParamsPaginated) : null),
    {
      onError: handleError,
      keepPreviousData: true
    }
  );

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    navigate(route);
  }

  function handleTabClick(_: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setConnectionsQueryParamsPaginated(connectionsQueryParamsPaginated);
    setAddressView(tabIndex as number);
  }

  const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
    setConnectionsQueryParamsPaginated(params);
  }, []);

  const activeConnections = activeConnectionsData?.results.filter(({ endTime }) => !endTime) || [];
  const activeConnectionsCount = activeConnectionsData?.totalCount;

  const servers = serversByAddressData?.results || [];
  const serversRowsCount = serversByAddressData?.totalCount;

  const serverNameFilters = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNames = servers.map(({ name }) => name).join('|');

  return (
    <>
      <Grid hasGutter data-cy="sk-address">
        <GridItem>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to={AddressesRoutesPaths.Addresses}>{AddressesRoutesPathLabel.Addresses}</Link>
            </BreadcrumbItem>
            <BreadcrumbHeading to="#">{addressName}</BreadcrumbHeading>
          </Breadcrumb>
        </GridItem>

        <GridItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }}>
            <ResourceIcon type="address" />
            <TextContent>
              <Text component={TextVariants.h1}>{addressName}</Text>
            </TextContent>
            <Link
              to={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.AddressId}=${addressId}`}
            >
              {FlowPairsLabel.GoToTopology}
            </Link>
          </Flex>
        </GridItem>

        {/* connection table*/}
        <GridItem>
          <Card isRounded className="pf-u-pt-md">
            <Tabs activeKey={addressView} onSelect={handleTabClick}>
              {activeConnections && (
                <Tab eventKey={0} title={<TabTitleText>{FlowPairsLabelsTcp.ActiveConnections}</TabTitleText>}>
                  <FlowPairsTable
                    columns={ConnectionsByAddressColumns}
                    connections={activeConnections}
                    onGetFilters={handleGetFiltersConnections}
                    rowsCount={activeConnectionsCount}
                  />
                </Tab>
              )}
              {serversRowsCount && (
                <Tab eventKey={1} title={<TabTitleText>{FlowPairsLabelsTcp.Servers}</TabTitleText>}>
                  <ServersTable processes={servers} />
                </Tab>
              )}
            </Tabs>
          </Card>
        </GridItem>

        {/* Process Metrics*/}
        {isPrometheusActive() && (
          <GridItem>
            <Metrics
              parent={{ id: serverNames, name: serverNames }}
              processesConnected={serverNameFilters}
              protocolDefault={AvailableProtocols.Tcp}
              filterOptions={{
                protocols: { disabled: true },
                destinationProcesses: { name: FlowPairsLabelsTcp.Servers }
              }}
            />
          </GridItem>
        )}
      </Grid>
      {(isLoadingServersByAddress || isLoadingActiveConnections) && <LoadingPage isFLoating={true} />}
    </>
  );
};

export default ConnectionsByAddress;
