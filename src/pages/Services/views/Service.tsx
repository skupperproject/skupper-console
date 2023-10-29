import { useState, MouseEvent as ReactMouseEvent } from 'react';

import { Badge, Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, TcpStatus } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { getTestsIds } from '@config/testIds';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';

import HttpService from './HttpService';
import ConnectionsByService from './TcpService';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, TAB_3_KEY } from '../Services.constants';
import { ServicesLabels, QueriesServices } from '../Services.enum';

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

const Service = function () {
  const { service } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceName = service?.split('@')[0];
  const serviceId = service?.split('@')[1] as string;
  const protocol = service?.split('@')[2];

  const type = searchParams.get('type') || TAB_0_KEY;
  const [tabSelected, setTabSelected] = useState(type);

  const { data: serversData } = useQuery(
    [QueriesServices.GetProcessesByService, serviceId, initServersQueryParams],
    () => RESTApi.fetchServersByService(serviceId, initServersQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: requestsData } = useQuery(
    [QueriesServices.GetFlowPairsByService, serviceId, initServersQueryParams],
    () => RESTApi.fetchFlowPairsByService(serviceId, initServersQueryParams),
    {
      enabled: protocol !== AvailableProtocols.Tcp,
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: activeConnectionsData } = useQuery(
    [QueriesServices.GetFlowPairsByService, serviceId, activeConnectionsQueryParams],
    () => RESTApi.fetchFlowPairsByService(serviceId, activeConnectionsQueryParams),
    {
      enabled: protocol === AvailableProtocols.Tcp,
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: terminatedConnectionsData } = useQuery(
    [QueriesServices.GetFlowPairsByService, serviceId, terminatedConnectionsQueryParams],
    () => RESTApi.fetchFlowPairsByService(serviceId, terminatedConnectionsQueryParams),
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

  const NavigationMenu = function () {
    const serverCount = serversData?.timeRangeCount;
    const requestsCount = requestsData?.timeRangeCount;
    const tcpActiveConnectionCount = activeConnectionsData?.timeRangeCount;
    const tcpTerminatedConnectionCount = terminatedConnectionsData?.timeRangeCount;

    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={TAB_0_KEY} title={<TabTitleText>{`${ServicesLabels.Overview}`}</TabTitleText>} />
        <Tab
          isDisabled={!serverCount}
          eventKey={TAB_1_KEY}
          title={
            <TabTitleText>
              {`${ServicesLabels.Servers} `}
              {!!serverCount && (
                <Badge isRead key={1}>
                  {serverCount}
                </Badge>
              )}
            </TabTitleText>
          }
        />
        {protocol !== AvailableProtocols.Tcp && (
          <Tab
            isDisabled={!requestsCount}
            eventKey={TAB_2_KEY}
            title={<TabTitleText>{ServicesLabels.Requests}</TabTitleText>}
          />
        )}
        {protocol === AvailableProtocols.Tcp && (
          <Tab
            isDisabled={!tcpActiveConnectionCount}
            eventKey={TAB_2_KEY}
            title={<TabTitleText>{ServicesLabels.ActiveConnections}</TabTitleText>}
          />
        )}

        {protocol === AvailableProtocols.Tcp && (
          <Tab
            isDisabled={!tcpTerminatedConnectionCount}
            eventKey={TAB_3_KEY}
            title={<TabTitleText>{ServicesLabels.OldConnections}</TabTitleText>}
          />
        )}
      </Tabs>
    );
  };

  return (
    <MainContainer
      dataTestId={getTestsIds.serviceView(serviceId)}
      isPlain
      title={serviceName || ''}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.ServiceId}=${serviceId}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {protocol === AvailableProtocols.Tcp && (
            <ConnectionsByService
              serviceName={serviceName || ''}
              serviceId={serviceId || ''}
              protocol={protocol}
              viewSelected={tabSelected}
            />
          )}
          {(protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2) && (
            <HttpService
              serviceName={serviceName || ''}
              serviceId={serviceId || ''}
              protocol={protocol}
              viewSelected={tabSelected}
            />
          )}
        </>
      }
    />
  );
};

export default Service;
