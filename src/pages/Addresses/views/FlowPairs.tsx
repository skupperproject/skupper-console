import { useState, MouseEvent as ReactMouseEvent } from 'react';

import { Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, TcpStatus } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import MainContainer from '@layout/MainContainer';
import LoadingPage from '@pages/shared/Loading';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';

import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, TAB_3_KEY } from '../Addresses.constants';
import { ConnectionLabels, FlowPairsLabels, RequestLabels } from '../Addresses.enum';
import ConnectionsByAddress from '../components/ConnectionsByAddress';
import RequestsByAddress from '../components/RequestsByAddress';
import { QueriesServices } from '../services/services.enum';

const initServersQueryParams = {
  limit: 0
};

const activeConnectionsQueryParams = {
  limit: 0,
  state: TcpStatus.Active
};

const terminatedConnectionsQueryParams = {
  limit: 0,
  state: TcpStatus.Terminated
};

const FlowsPairs = function () {
  const { service } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const addressName = service?.split('@')[0];
  const addressId = service?.split('@')[1] as string;
  const protocol = service?.split('@')[2];

  const type = searchParams.get('type') || TAB_0_KEY;
  const [tabSelected, setTabSelected] = useState(type);

  const { data: serversData, isLoading: isLoadingServers } = useQuery(
    [QueriesServices.GetProcessesByAddress, addressId, initServersQueryParams],
    () => RESTApi.fetchServersByAddress(addressId, initServersQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: requestsData, isLoading: isLoadingRequests } = useQuery(
    [QueriesServices.GetFlowPairsByAddress, addressId, initServersQueryParams],
    () => RESTApi.fetchFlowPairsByAddress(addressId, initServersQueryParams),
    {
      enabled: protocol !== AvailableProtocols.Tcp,
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: activeConnectionsData, isLoading: isLoadingActiveConnections } = useQuery(
    [QueriesServices.GetFlowPairsByAddress, addressId, activeConnectionsQueryParams],
    () => RESTApi.fetchFlowPairsByAddress(addressId, activeConnectionsQueryParams),
    {
      enabled: protocol === AvailableProtocols.Tcp,
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: terminatedConnectionsData, isLoading: isLoadingTerminatedConnections } = useQuery(
    [QueriesServices.GetFlowPairsByAddress, addressId, terminatedConnectionsQueryParams],
    () => RESTApi.fetchFlowPairsByAddress(addressId, terminatedConnectionsQueryParams),
    {
      enabled: protocol === AvailableProtocols.Tcp,
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

  const serverCount = serversData?.timeRangeCount;
  const requestsCount = requestsData?.timeRangeCount;
  const tcpActiveConnectionCount = activeConnectionsData?.timeRangeCount;
  const tcpTerminatedConnectionCount = terminatedConnectionsData?.timeRangeCount;

  if (
    isLoadingServers ||
    (protocol === AvailableProtocols.Tcp && (isLoadingActiveConnections || isLoadingTerminatedConnections)) ||
    (protocol !== AvailableProtocols.Tcp && isLoadingRequests)
  ) {
    return <LoadingPage />;
  }

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={TAB_0_KEY} title={<TabTitleText>{`${FlowPairsLabels.Overview}`}</TabTitleText>} />
        <Tab
          isDisabled={!serverCount}
          eventKey={TAB_1_KEY}
          title={<TabTitleText>{`${FlowPairsLabels.Servers} (${serverCount})`}</TabTitleText>}
        />
        {protocol !== AvailableProtocols.Tcp && (
          <Tab
            isDisabled={!requestsCount}
            eventKey={TAB_2_KEY}
            title={<TabTitleText>{`${RequestLabels.Requests} (${requestsCount})`}</TabTitleText>}
          />
        )}
        {protocol === AvailableProtocols.Tcp && (
          <Tab
            isDisabled={!tcpActiveConnectionCount}
            eventKey={TAB_2_KEY}
            title={<TabTitleText>{`${ConnectionLabels.ActiveConnections} (${tcpActiveConnectionCount})`}</TabTitleText>}
          />
        )}

        {protocol === AvailableProtocols.Tcp && (
          <Tab
            isDisabled={!tcpTerminatedConnectionCount}
            eventKey={TAB_3_KEY}
            title={
              <TabTitleText>{`${ConnectionLabels.OldConnections} (${tcpTerminatedConnectionCount})`}</TabTitleText>
            }
          />
        )}
      </Tabs>
    );
  };

  return (
    <MainContainer
      isPlain
      title={addressName || ''}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.AddressId}=${addressId}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {protocol === AvailableProtocols.Tcp && (
            <ConnectionsByAddress
              addressName={addressName || ''}
              addressId={addressId || ''}
              protocol={protocol}
              viewSelected={tabSelected}
            />
          )}
          {(protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2) && (
            <RequestsByAddress
              addressName={addressName || ''}
              addressId={addressId || ''}
              protocol={protocol}
              viewSelected={tabSelected}
            />
          )}
        </>
      }
    />
  );
};
export default FlowsPairs;
