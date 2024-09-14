import { FC, useState } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { AvailableProtocols } from '@API/REST.enum';
import { getTestsIds } from '@config/testIds';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import MainContainer from '@layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';

import HttpRequests from '../components/HttpRequests';
import NavigationMenu from '../components/NavigationMenu';
import TcpConnections from '../components/TcpConnections';
import useServiceData from '../hooks/useServiceData';
import { TAB_0_KEY } from '../Services.constants';

interface ServiceProps {
  id: string;
  defaultTab: string;
}

const ServiceComponent: FC<ServiceProps> = function ({ id, defaultTab }) {
  const [menuSelected, setMenuSelected] = useState(defaultTab);

  const {
    service: { name, protocol },
    serverCount,
    requestsCount,
    tcpActiveConnectionCount,
    tcpTerminatedConnectionCount
  } = useServiceData(id);

  return (
    <MainContainer
      dataTestId={getTestsIds.serviceView(id)}
      isPlain
      title={name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.ServiceId}=${id}`}
      navigationComponent={
        <NavigationMenu
          protocol={protocol}
          serverCount={serverCount}
          requestsCount={requestsCount}
          tcpActiveConnectionCount={tcpActiveConnectionCount}
          tcpTerminatedConnectionCount={tcpTerminatedConnectionCount}
          menuSelected={menuSelected}
          onMenuSelected={(index) => setMenuSelected(index)}
        />
      }
      mainContentChildren={
        <>
          {protocol === AvailableProtocols.Tcp && (
            <TcpConnections serviceName={name} serviceId={id} protocol={protocol} viewSelected={menuSelected} />
          )}
          {(protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2) && (
            <HttpRequests serviceName={name} serviceId={id} protocol={protocol} viewSelected={menuSelected} />
          )}
        </>
      }
    />
  );
};

const Service = function () {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || TAB_0_KEY;

  const { id: paramId } = useParams();
  const { id } = getIdAndNameFromUrlParams(paramId as string);

  return <ServiceComponent id={id} defaultTab={type} />;
};

export default Service;
