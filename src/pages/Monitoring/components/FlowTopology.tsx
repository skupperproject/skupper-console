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
import FlowTopologyContent from './FlowsTopologyContent';
import { MonitoringTopologyVanService } from './FlowTopology.interfaces';

const FlowTopology = function () {
    const navigate = useNavigate();
    const { id: vanId, idFlow } = useParams();

    const [refetchInterval, setRefetchInterval] = useState(0);
    const [svgTopologyComponent, setSvgTopologyComponent] =
        useState<MonitoringTopologyVanService>();

    const { data: devices, isLoading } = useQuery(
        [QueriesMonitoring.GetMonitoringTopologyFlows, vanId],
        () => (vanId ? MonitorServices.fetchFlowsByVanId(vanId) : null),
        {
            refetchOnWindowFocus: false,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: routers, isLoading: isLoadingTopologyRoutersLinks } = useQuery(
        [QueriesMonitoring.GetMonitoringTopologyNetwork],
        () => MonitorServices.fetchFlowsTopology(),
        {
            refetchOnWindowFocus: false,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: connection, isLoading: isLoadingRecords } = useQuery(
        [QueriesMonitoring.GetMonitoringConnection],
        () => (idFlow ? MonitorServices.fetchConnectionByFlowId(idFlow) : null),
        {
            cacheTime: 0,
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
            routers?.nodes?.map(({ identity, name }) => {
                const positions = localStorage.getItem(identity);

                return {
                    identity,
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

    const getConnectionTopology = () =>
        devices?.filter(({ identity }) => {
            if (connection) {
                if (identity === connection.startFlow?.parent) {
                    return true;
                }

                if (identity === connection.endFlow?.parent) {
                    return true;
                }

                return false;
            }
        });

    const connectionTopology = getConnectionTopology();

    const deviceNodes = useMemo(
        () =>
            connectionTopology?.map(({ identity, name, recType, flows, protocol }) => {
                const totalLatency = flows.reduce((acc, flow) => acc + flow.latency, 0);
                const avgLatency = totalLatency / flows.length;

                const positions = localStorage.getItem(identity);

                const node = {
                    identity,
                    name,
                    type: 'flow',
                    recType,
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
            connectionTopology?.flatMap(({ identity, recType, parent, flows, protocol }) => {
                const bytes = flows.reduce((acc, flow) => acc + (flow.octets || 0), 0);

                return [
                    {
                        source: parent,
                        target: identity,
                        type: recType,
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
            if (
                node &&
                deviceLinks?.length &&
                deviceNodes?.length &&
                routerNodes?.length &&
                routerLinks?.length
            ) {
                const topologyServiceRef = FlowTopologyContent(
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

    if (isLoading || isLoadingTopologyRoutersLinks || isLoadingRecords) {
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

export default FlowTopology;
