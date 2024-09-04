import { useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import { AvailableProtocols } from '@API/REST.enum';
import { getTestsIds } from '@config/testIds';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';

import HttpRequests from '../components/HttpRequests';
import NavigationMenu from '../components/NavigationMenu';
import TcpConnections from '../components/TcpConnections';
import useServiceData from '../hooks/useServiceData';
import { TAB_0_KEY } from '../Services.constants';

const Service = function () {
  const [searchParams] = useSearchParams();
  const [menuSelected, setMenuSelected] = useState(searchParams.get('type') || TAB_0_KEY);

  const {
    serviceName,
    serviceId,
    protocol,
    serverCount,
    // requestsCount,
    tcpActiveConnectionCount,
    tcpTerminatedConnectionCount
  } = useServiceData();

  return (
    <MainContainer
      dataTestId={getTestsIds.serviceView(serviceId)}
      isPlain
      title={serviceName || ''}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.ServiceId}=${serviceId}`}
      navigationComponent={
        <NavigationMenu
          protocol={protocol}
          serverCount={serverCount}
          //requestsCount={requestsCount}
          tcpActiveConnectionCount={tcpActiveConnectionCount}
          tcpTerminatedConnectionCount={tcpTerminatedConnectionCount}
          menuSelected={menuSelected}
          onMenuSelected={(index) => setMenuSelected(index)}
        />
      }
      mainContentChildren={
        <>
          {protocol === AvailableProtocols.Tcp && (
            <TcpConnections
              serviceName={serviceName || ''}
              serviceId={serviceId || ''}
              protocol={protocol}
              viewSelected={menuSelected}
            />
          )}
          {(protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2) && (
            <HttpRequests
              serviceName={serviceName || ''}
              serviceId={serviceId || ''}
              protocol={protocol}
              viewSelected={menuSelected}
            />
          )}
        </>
      }
    />
  );
};

export default Service;
