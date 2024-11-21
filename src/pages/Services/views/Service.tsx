import { FC, useState } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { getTestsIds } from '../../../config/testIds';
import { getIdAndNameFromUrlParams } from '../../../core/utils/getIdAndNameFromUrlParams';
import MainContainer from '../../../layout/MainContainer';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '../../Topology/Topology.enum';
import HttpRequests from '../components/HttpRequests';
import ListenerAndConnectorList from '../components/ListenerAndConnectorList';
import NavigationMenu from '../components/NavigationMenu';
import Overview from '../components/Overview';
import PairsList from '../components/PairsList';
import TcpConnections from '../components/TcpConnections';
import TcpTerminatedConnections from '../components/TcpTerminatedConnections';
import useServiceData from '../hooks/useServiceData';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, TAB_3_KEY, TAB_4_KEY, TAB_5_KEY } from '../Services.constants';

interface ServiceProps {
  id: string;
  defaultTab: string;
}

const ServiceComponent: FC<ServiceProps> = function ({ id, defaultTab }) {
  const [menuSelected, setMenuSelected] = useState(defaultTab);

  const {
    service: { name, observedApplicationProtocols },
    summary: {
      serverCount,
      requestsCount,
      activeConnectionCount,
      terminatedConnectionCount,
      listenerCount,
      connectorCount
    }
  } = useServiceData(id);

  return (
    <MainContainer
      dataTestId={getTestsIds.serviceView(id)}
      title={name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.ServiceId}=${id}`}
      navigationComponent={
        <NavigationMenu
          hasListenersOrConnectors={!!(listenerCount || connectorCount)}
          serverCount={serverCount}
          hasApplicationProtocol={!!observedApplicationProtocols.length}
          requestsCount={requestsCount}
          tcpActiveConnectionCount={activeConnectionCount}
          tcpTerminatedConnectionCount={terminatedConnectionCount}
          menuSelected={menuSelected}
          onMenuSelected={(index) => setMenuSelected(index)}
        />
      }
      mainContentChildren={
        <>
          {menuSelected === TAB_0_KEY && <Overview id={id} name={name} />}
          {menuSelected === TAB_5_KEY && <ListenerAndConnectorList id={id} name={name} />}
          {menuSelected === TAB_1_KEY && <PairsList id={id} name={name} />}
          {menuSelected === TAB_3_KEY && <TcpConnections routingKey={name} />}
          {menuSelected === TAB_4_KEY && <TcpTerminatedConnections routingKey={name} />}
          {menuSelected === TAB_2_KEY && <HttpRequests routingKey={name} />}
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
