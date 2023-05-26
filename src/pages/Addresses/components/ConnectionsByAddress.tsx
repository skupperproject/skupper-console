import { FC, MouseEvent as ReactMouseEvent, useMemo, useRef, useState } from 'react';

import { Card, Grid, GridItem, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { isPrometheusActive } from '@API/Prometheus.queries';
import { RESTApi } from '@API/REST';
import { AvailableProtocols } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import SkTitle from '@core/components/SkTitle';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { FlowPairsResponse } from 'API/REST.interfaces';

import { ConnectionsByAddressColumns, ConnectionsByAddressColumnsEnded } from '../Addresses.constants';
import { FlowPairsLabelsTcp, FlowPairsLabels, FlowPairsLabelsHttp, AddressesLabels } from '../Addresses.enum';
import { ConnectionsByAddressProps } from '../Addresses.interfaces';
import FlowPairsTable from '../components/FlowPairsTable';
import ServersTable from '../components/ServersTable';
import { QueriesAddresses } from '../services/services.enum';

const TAB_1_KEY = 'servers';
const TAB_2_KEY = 'liveConnections';
const TAB_3_KEY = 'connections';

const initServersQueryParams = {
  endTime: 0 // active servers
};

const ConnectionsByAddress: FC<ConnectionsByAddressProps> = function ({ addressId, addressName, protocol }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || TAB_1_KEY;

  const activeConnectionsDataRef = useRef<FlowPairsResponse[]>();
  const forceMetricUpdateNonceRef = useRef<number>(0);

  const [addressView, setAddressView] = useState<string>(type);

  const { data: activeConnectionsData, isLoading: isLoadingActiveConnections } = useQuery(
    [QueriesAddresses.GetFlowPairsByAddress, addressId],
    () => (addressId ? RESTApi.fetchFlowPairsByAddress(addressId) : undefined),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: serversByAddressData, isLoading: isLoadingServersByAddress } = useQuery(
    [QueriesAddresses.GetProcessesByAddress, addressId, initServersQueryParams],
    () => (addressId ? RESTApi.fetchServersByAddress(addressId, initServersQueryParams) : null),
    {
      keepPreviousData: true
    }
  );

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setAddressView(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

  const checkDataChanged = useMemo((): number => {
    activeConnectionsDataRef.current = activeConnectionsData?.results;

    return (forceMetricUpdateNonceRef.current += 1);
  }, [activeConnectionsData?.results]);

  if (isLoadingServersByAddress || isLoadingActiveConnections) {
    return <LoadingPage />;
  }

  const activeConnections = activeConnectionsData?.results.filter(({ endTime }) => !endTime) || [];
  const oldConnections = activeConnectionsData?.results.filter(({ endTime }) => endTime) || [];

  const servers = serversByAddressData?.results || [];
  const serversRowsCount = serversByAddressData?.timeRangeCount;

  const serverNames = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNamesIds = servers.map(({ name }) => name).join('|');
  const startTime = servers.reduce((acc, process) => Math.max(acc, process.startTime), 0);

  return (
    <Grid hasGutter>
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
            {!!serversRowsCount && (
              <Tab
                eventKey={TAB_1_KEY}
                title={<TabTitleText>{`${FlowPairsLabels.Servers} (${serversRowsCount})`}</TabTitleText>}
              >
                <ServersTable processes={servers} />
              </Tab>
            )}
            {!!activeConnections.length && (
              <Tab
                eventKey={TAB_2_KEY}
                title={
                  <TabTitleText>{`${FlowPairsLabelsTcp.ActiveConnections} (${activeConnections.length})`}</TabTitleText>
                }
              >
                <FlowPairsTable columns={ConnectionsByAddressColumns} connections={activeConnections} />
              </Tab>
            )}
            {!!oldConnections.length && (
              <Tab
                eventKey={TAB_3_KEY}
                title={<TabTitleText>{`${FlowPairsLabelsTcp.OldConnections} (${oldConnections.length})`}</TabTitleText>}
              >
                <FlowPairsTable columns={ConnectionsByAddressColumnsEnded} connections={oldConnections} />
              </Tab>
            )}
          </Tabs>
        </Card>
      </GridItem>

      {/* Process Metrics*/}
      {isPrometheusActive() && (
        <GridItem>
          <Metrics
            forceUpdate={checkDataChanged}
            selectedFilters={{ processIdSource: serverNamesIds, protocol: AvailableProtocols.Tcp }}
            startTime={startTime}
            sourceProcesses={serverNames}
            filterOptions={{
              protocols: { disabled: true, placeholder: protocol },
              sourceProcesses: { placeholder: AddressesLabels.MetricDestinationProcessFilter },
              destinationProcesses: { placeholder: FlowPairsLabelsHttp.Clients, disabled: true }
            }}
          />
        </GridItem>
      )}
    </Grid>
  );
};

export default ConnectionsByAddress;
