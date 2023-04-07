import { FC, MouseEvent as ReactMouseEvent, useCallback, useState } from 'react';

import { Card, Grid, GridItem, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST';
import { DEFAULT_TABLE_PAGE_SIZE } from '@config/config';
import SkTitle from '@core/components/SkTitle';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { isPrometheusActive } from 'API/Prometheus.constant';
import { AvailableProtocols } from 'API/REST.enum';
import { RequestOptions } from 'API/REST.interfaces';

import { ConnectionsByAddressColumns } from '../Addresses.constants';
import { FlowPairsLabelsTcp, FlowPairsLabels, FlowPairsLabelsHttp, AddressesLabels } from '../Addresses.enum';
import { ConnectionsByAddressProps } from '../Addresses.interfaces';
import FlowPairsTable from '../components/FlowPairsTable';
import ServersTable from '../components/ServersTable';
import { QueriesAddresses } from '../services/services.enum';

const initConnectionsQueryParamsPaginated = {
  offset: 0,
  limit: DEFAULT_TABLE_PAGE_SIZE,
  filter: 'endTime.0' // open connections
};

const ConnectionsByAddress: FC<ConnectionsByAddressProps> = function ({ addressId, addressName, protocol }) {
  const [addressView, setAddressView] = useState<number>(0);
  const [connectionsQueryParamsPaginated, setConnectionsQueryParamsPaginated] = useState<RequestOptions>(
    initConnectionsQueryParamsPaginated
  );

  const { data: activeConnectionsData, isLoading: isLoadingActiveConnections } = useQuery(
    [QueriesAddresses.GetFlowPairsByAddress, addressId, connectionsQueryParamsPaginated],
    () => (addressId ? RESTApi.fetchFlowPairsByAddress(addressId, connectionsQueryParamsPaginated) : undefined),
    {
      keepPreviousData: true
    }
  );

  const { data: serversByAddressData, isLoading: isLoadingServersByAddress } = useQuery(
    [QueriesAddresses.GetProcessesByAddress, addressId, connectionsQueryParamsPaginated],
    () => (addressId ? RESTApi.fetchServersByAddress(addressId, connectionsQueryParamsPaginated) : null),
    {
      keepPreviousData: true
    }
  );

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setConnectionsQueryParamsPaginated(connectionsQueryParamsPaginated);
    setAddressView(tabIndex as number);
  }

  const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
    setConnectionsQueryParamsPaginated(params);
  }, []);

  if (isLoadingServersByAddress || isLoadingActiveConnections) {
    return <LoadingPage />;
  }

  const activeConnections = activeConnectionsData?.results.filter(({ endTime }) => !endTime) || [];
  const activeConnectionsCount = activeConnectionsData?.timeRangeCount;

  const servers = serversByAddressData?.results || [];
  const serversRowsCount = serversByAddressData?.timeRangeCount;

  const serverNames = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNamesId = servers.map(({ name }) => name).join('|');
  const startTime = servers.reduce((acc, process) => Math.max(acc, process.startTime), 0);

  return (
    <Grid hasGutter data-cy="sk-address">
      <GridItem>
        <SkTitle
          title={addressName}
          icon="address"
          link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.AddressId}=${addressId}`}
        />
      </GridItem>

      {/* connection table*/}
      <GridItem>
        <Card isRounded className="pf-u-pt-md">
          <Tabs activeKey={addressView} onSelect={handleTabClick}>
            {serversRowsCount && (
              <Tab eventKey={0} title={<TabTitleText>{FlowPairsLabels.Servers}</TabTitleText>}>
                <ServersTable processes={servers} />
              </Tab>
            )}
            {activeConnections && (
              <Tab eventKey={1} title={<TabTitleText>{FlowPairsLabelsTcp.ActiveConnections}</TabTitleText>}>
                <FlowPairsTable
                  columns={ConnectionsByAddressColumns}
                  connections={activeConnections}
                  onGetFilters={handleGetFiltersConnections}
                  rowsCount={activeConnectionsCount}
                />
              </Tab>
            )}
          </Tabs>
        </Card>
      </GridItem>

      {/* Process Metrics*/}
      {isPrometheusActive() && (
        <GridItem>
          <Metrics
            parent={{ id: serverNamesId, name: serverNamesId, startTime }}
            sourceProcesses={serverNames}
            protocolDefault={AvailableProtocols.Tcp}
            customFilters={{
              protocols: { disabled: true, name: protocol },
              sourceProcesses: { name: AddressesLabels.MetricDestinationProcessFilter },
              destinationProcesses: { name: FlowPairsLabelsHttp.Clients, disabled: true }
            }}
          />
        </GridItem>
      )}
    </Grid>
  );
};

export default ConnectionsByAddress;
