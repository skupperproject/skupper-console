import React, { useState } from 'react';

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
import { UPDATE_INTERVAL } from 'config';

import TopologyTest from './services';

const MonitoringTopology = function () {
  const navigate = useNavigate();
  const { id: vanId } = useParams();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

  const { data, isLoading } = useQuery(
    [QueriesMonitoring.GetFlows, vanId],
    () => MonitorServices.fetchFlowsByVanId(vanId),
    {
      refetchInterval,
      onError: handleError,
    },
  );

  const { data: routersLinks, isLoading: isLoadingTopologyRoutersLinks } = useQuery(
    [QueriesMonitoring.GetTolopologyRoutersLinks],
    () => MonitorServices.fetchTopologyRoutersLinks(),
    {
      refetchInterval,
      onError: handleError,
    },
  );

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  if (isLoading || isLoadingTopologyRoutersLinks) {
    return <LoadingPage />;
  }

  const controlButtons = createTopologyControlButtons();

  const sideBar = <div>sidebar</div>;

  const routerNodes = routersLinks?.nodes?.map((node, index) => ({
    id: node.id,
    name: node.name,
    x: index === 0 ? 400 : index * 300,
    y: index === 0 ? 100 : 150 + index * 150,
    width: 60,
    type: 'router',
  }));

  const nodes = data?.reduce((acc, service, index) => {
    const router = routerNodes?.find(({ name }) => name === service.siteName);

    acc[service.id] = {
      id: service.id,
      name: service.name,
      x: (router?.x || 0) - 30 + index * 30,
      y: (router?.y || 0) + 80,
      width: 20,
      height: 20,
      type: 'flow',
    };

    // service.flows.forEach((flow, index2) => {
    //   const bb = routerNodes?.find(a => a.name === service.siteName);

    //   acc[flow.id] = {
    //     id: flow.id,
    //     x: (bb?.x || 0) - 40 + index2 * 30,
    //     y: (bb?.y || 0) + 80,
    //     r: 7,
    //     name: flow.source_port,
    //     type: 'flow',
    //   };
    // });

    return acc;
  }, {} as any);

  const links = data?.flatMap((service) => {
    const flows = service.flows.map((flow) => ({
      target: service.id,
      octets: flow?.connected_to?.octets,
      type: 'flow',
    }));

    return [{ source: service.parent, target: flows[0].target, type: 'device' }];
  });

  return (
    <TopologyView
      controlBar={<TopologyControlBar controlButtons={controlButtons} />}
      sideBar={sideBar}
      sideBarOpen={false}
    >
      <TopologyTest
        nodesData={Object.values(nodes)}
        linksData={links}
        routersNodes={routerNodes}
        routersLinks={routersLinks?.links}
      />
    </TopologyView>
  );
};

export default MonitoringTopology;
