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

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  const controlButtons = createTopologyControlButtons();

  const sideBar = <div>sidebar</div>;

  const nodes = data?.reduce((acc, service, index) => {
    acc[service.id] = {
      id: service.id,
      name: service.name,
      x: 200 + index * 200,
      y: 330,
      width: 60,
      type: 'device',
    };

    service.flows.forEach((flow, index2) => {
      acc[flow.id] = {
        id: flow.id,
        x: index * 700 + 30,
        y: index2 * 30 + 150,
        r: 6,
        name: flow.source_port,
        type: 'flow',
      };
    });

    return acc;
  }, {} as any);

  const links = data?.flatMap((service) => {
    const flows = service.flows.map((flow) => ({
      source: flow.id,
      target: service.id,
      connectedTo: flow?.connected_to?.parent,
      octets: flow?.connected_to?.octets,
    }));

    return [{ source: service.id, target: flows[0].connectedTo }, ...flows];
  });

  return (
    <TopologyView
      controlBar={<TopologyControlBar controlButtons={controlButtons} />}
      sideBar={sideBar}
      sideBarOpen={false}
    >
      <div>
        <TopologyTest nodesData={Object.values(nodes)} linksData={links} />
      </div>
    </TopologyView>
  );
};

export default MonitoringTopology;
