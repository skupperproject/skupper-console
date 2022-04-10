import React, { useCallback, useMemo, useState } from 'react';

import { TopologyView } from '@patternfly/react-topology';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { QueriesMonitoring } from '@pages/Monitoring/Monitoring.enum';
import { MonitorServices } from '@pages/Monitoring/services';
import { formatBytes } from '@utils/formatBytes';

import TopologyMonitoringService from './FlowsTopology';

// import { UPDATE_INTERVAL } from 'config';

const MonitoringTopology = function () {
  const navigate = useNavigate();
  const { id: vanId } = useParams();
  const [refetchInterval, setRefetchInterval] = useState(0);

  const { data: devices, isLoading } = useQuery(
    [QueriesMonitoring.GetMonitoringTopologyFlows, vanId],
    () => MonitorServices.fetchFlowsByVanId(vanId),
    {
      refetchOnWindowFocus: false,
      refetchInterval,
      onError: handleError,
    },
  );

  const { data: routers, isLoading: isLoadingTopologyRoutersLinks } = useQuery(
    [QueriesMonitoring.GetMonitoringTopologyNetwork],
    () => MonitorServices.fetchMonitoringRoutersTopology(),
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

  const routerNodes = useMemo(
    () =>
      routers?.nodes?.map((node) => ({
        id: node.id,
        name: node.name,
        x: 0,
        y: 0,
        width: 50,
        type: 'router',
      })),
    [routers?.nodes],
  );

  const deviceNodes = useMemo(
    () =>
      devices?.map(({ id, name, rtype, flows, protocol }) => {
        const totalLatency = flows.reduce((acc, flow) => acc + flow.latency, 0);
        const avgLatency = totalLatency / flows.length;
        const node = {
          id,
          name,
          type: 'flow',
          rtype,
          avgLatency,
          protocol,
          numFlows: flows.length,
          x: 0,
          y: 0,
        };

        return node;
      }),
    [devices],
  );

  const deviceLinks = useMemo(
    () =>
      devices?.flatMap(({ id, rtype, parent, flows, protocol }) => {
        const bytes = flows.reduce((acc, flow) => acc + (flow.octets || 0), 0);

        return [
          {
            source: parent,
            target: id,
            type: rtype,
            pType: 'device',
            protocol,
            bytes: formatBytes(bytes),
          },
        ];
      }),
    [devices],
  );

  const panelRef = useCallback(
    (node) => {
      const routerLinks = routers?.links || [];
      if (node && deviceLinks && deviceNodes && routerNodes && routerLinks) {
        TopologyMonitoringService(
          node,
          [...routerNodes, ...deviceNodes],
          [...routerLinks, ...deviceLinks],
          node.getBoundingClientRect().width,
          node.getBoundingClientRect().height,
        );
      }
    },
    [deviceLinks, deviceNodes, routerNodes, routers?.links],
  );

  if (isLoading || isLoadingTopologyRoutersLinks) {
    return <LoadingPage />;
  }

  return (
    <TopologyView>
      <div ref={panelRef} style={{ width: '100%', height: '100%' }} />
    </TopologyView>
  );
};

export default MonitoringTopology;
