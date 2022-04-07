import React, { useCallback, useState } from 'react';

import {
  TopologyView,
  TopologyControlBar,
  createTopologyControlButtons,
} from '@patternfly/react-topology';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { QueriesMonitoring } from '@pages/Monitoring/Monitoring.enum';
import { MonitorServices } from '@pages/Monitoring/services';
import { formatBytes } from '@utils/formatBytes';
// import { UPDATE_INTERVAL } from 'config';

import TopologyMonitoringService from './services';

const MonitoringTopology = function () {
  const navigate = useNavigate();
  const { id: vanId } = useParams();
  const [refetchInterval, setRefetchInterval] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const [boxHeight, setBoxHeight] = useState(0);

  const { data: devices, isLoading } = useQuery(
    [QueriesMonitoring.GetFlows, vanId],
    () => MonitorServices.fetchFlowsByVanId(vanId),
    {
      refetchOnWindowFocus: false,
      refetchInterval,
      onError: handleError,
    },
  );

  const { data: routers, isLoading: isLoadingTopologyRoutersLinks } = useQuery(
    [QueriesMonitoring.GetTolopologyRoutersLinks],
    () => MonitorServices.fetchTopologyRoutersLinks(),
    {
      refetchOnWindowFocus: false,
      refetchInterval,
      onError: handleError,
    },
  );

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  const controlButtons = createTopologyControlButtons();
  const sideBar = <div>sidebar</div>;

  const routerNodes = routers?.nodes?.map((node) => ({
    id: node.id,
    name: node.name,
    x: 0,
    y: 0,
    width: 50,
    type: 'router',
  })) || [];

  const deviceNodes = devices?.map(({ id, name, rtype, flows }) => {
    const totalLatency = flows.reduce((acc, flow) => (acc + flow.latency), 0);
    const avgLatency = totalLatency / flows.length;
    const node = {
      id,
      name,
      type: 'flow',
      rtype,
      avgLatency,
      numFlows: flows.length,
      x: 0,
      y: 0,
    };

    return node;
  }) || [];

  const deviceLinks = devices?.flatMap(({ id, rtype, parent, flows }) => {
    const bytes = flows.reduce((acc, flow) => acc + (flow.octets || 0), 0);

    return [{
      source: parent,
      target: id,
      type: rtype,
      pType: 'device',
      bytes: formatBytes(bytes)
    }];
  }) || [];


  const panelRef = useCallback(node => {
    if (node !== null) {
      setBoxWidth(node.getBoundingClientRect().width);
      setBoxHeight(node.getBoundingClientRect().height);
    }
  }, []);


  if (isLoading || isLoadingTopologyRoutersLinks) {
    return <LoadingPage />;
  }


  const routerLinks = routers?.links || [];

  return (
    <div ref={panelRef} style={{ width: '100%', height: '100%' }}>
      <TopologyView
        className='cio'
        controlBar={<TopologyControlBar controlButtons={controlButtons} />}
        sideBar={sideBar}
        sideBarOpen={false}
      >
        {boxWidth && boxHeight && <TopologyMonitoringService
          nodes={[...routerNodes, ...deviceNodes]}
          links={[...routerLinks, ...deviceLinks]}
          boxWidth={boxWidth}
          boxHeight={boxHeight}
        />}
      </TopologyView>
    </div>
  );
};

export default MonitoringTopology;
