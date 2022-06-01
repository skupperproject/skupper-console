import React, { useCallback, useMemo, useState } from 'react';

import {
    createTopologyControlButtons,
    defaultControlButtonsOptions,
    TopologyControlBar,
    TopologyView,
} from '@patternfly/react-topology';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';
import TopologyMonitoringService from './FlowsTopology';
import { MonitoringTopologyVanService } from './Topology.interfaces';

const MonitoringTopology = function () {
    const navigate = useNavigate();
    const { id: vanId } = useParams();
    const [refetchInterval, setRefetchInterval] = useState(0);
    const [svgTopologyComponent, setSvgTopologyComponent] =
        useState<MonitoringTopologyVanService>();

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
        () => MonitorServices.fetchMonitoringTopology(),
        {
            refetchOnWindowFocus: false,
            refetchInterval,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    const routerNodes = useMemo(
        () =>
            routers?.nodes?.map(({ id, name }) => {
                const positions = localStorage.getItem(id);

                return {
                    id,
                    name,
                    width: 50,
                    type: 'router',
                    x: 0,
                    y: 0,
                    fx: positions ? JSON.parse(positions).fx : null,
                    fy: positions ? JSON.parse(positions).fy : null,
                };
            }),
        [routers?.nodes],
    );

    const deviceNodes = useMemo(
        () =>
            devices?.map(({ id, name, rtype, flows, protocol }) => {
                const totalLatency = flows.reduce((acc, flow) => acc + flow.latency, 0);
                const avgLatency = totalLatency / flows.length;

                const positions = localStorage.getItem(id);

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
                    fx: positions ? JSON.parse(positions).fx : null,
                    fy: positions ? JSON.parse(positions).fy : null,
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
        (node: HTMLDivElement) => {
            const routerLinks = routers?.links || [];
            if (node && deviceLinks && deviceNodes && routerNodes && routerLinks) {
                const topologyServiceRef = TopologyMonitoringService(
                    node,
                    [...routerNodes, ...deviceNodes],
                    [...routerLinks, ...deviceLinks],
                    node.getBoundingClientRect().width,
                    node.getBoundingClientRect().height,
                );

                setSvgTopologyComponent(topologyServiceRef);
            }
        },
        [deviceLinks, deviceNodes, routerNodes, routers?.links],
    );

    if (isLoading || isLoadingTopologyRoutersLinks) {
        return <LoadingPage />;
    }

    function handleZoomIn() {
        svgTopologyComponent?.zoomIn();
    }

    function handleZoomOut() {
        svgTopologyComponent?.zoomOut();
    }

    function handleResetView() {
        svgTopologyComponent?.reset();
    }

    const controlButtons = createTopologyControlButtons({
        ...defaultControlButtonsOptions,
        zoomInCallback: handleZoomIn,
        zoomOutCallback: handleZoomOut,
        resetViewCallback: handleResetView,
        fitToScreenHidden: true,
        legendHidden: true,
    });

    return (
        <TopologyView controlBar={<TopologyControlBar controlButtons={controlButtons} />}>
            <div ref={panelRef} style={{ width: '100%', height: '100%' }} />
        </TopologyView>
    );
};

export default MonitoringTopology;
