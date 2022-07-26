import React, { FC, useCallback, useMemo, useState } from 'react';

import { TopologyView } from '@patternfly/react-topology';

import { formatBytes } from '@core/utils/formatBytes';

import FlowTopologyContent from './FlowsTopologyContent';
import { FlowsConnectionProps, MonitoringTopologyVanService } from './FlowTopology.interfaces';

const FlowTopology: FC<FlowsConnectionProps> = function ({ connection, routers }) {
    const [svgTopologyComponent, setSvgTopologyComponent] =
        useState<MonitoringTopologyVanService>();

    const routerNodes = useMemo(
        () =>
            routers.nodes
                ?.filter(
                    (node) =>
                        node.identity === connection.startFlow.router.identity ||
                        node.identity === connection.endFlow?.router.identity,
                )
                .map(({ identity, name }) => {
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
        [routers?.nodes, connection],
    );

    const connectionTopology = useMemo(
        () => [{ ...connection.startFlow.device, flow: connection?.startFlow }],
        [connection],
    );

    if (connection.endFlow) {
        connectionTopology.push({ ...connection.endFlow.device, flow: connection.endFlow });
    }

    const deviceNodes = useMemo(
        () =>
            connectionTopology.map(({ identity, address, recType, protocol, flow }) => {
                const positions = localStorage.getItem(identity || '');
                const node = {
                    identity,
                    name: address,
                    type: 'flow',
                    recType,
                    protocol,
                    sourceHost: flow.sourceHost,
                    sourcePort: flow.sourcePort,
                    bytes: formatBytes(flow.octets),
                    x: 0,
                    y: 0,
                    fx: positions ? JSON.parse(positions).fx : null,
                    fy: positions ? JSON.parse(positions).fy : null,
                };

                return node;
            }),
        [connectionTopology],
    );

    const deviceLinks = useMemo(
        () =>
            connectionTopology.flatMap(({ identity, recType, parent, protocol }) => {
                const bytes = 0;

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
        [connectionTopology],
    );

    const panelRef = useCallback(
        ($node: HTMLDivElement) => {
            const routerNodesIds = routerNodes?.map(({ identity }) => identity);
            const routerLinks =
                routers?.links.filter(
                    (link) =>
                        routerNodesIds?.includes(link.source) &&
                        routerNodesIds?.includes(link.target),
                ) || [];

            if (
                $node &&
                deviceLinks?.length &&
                deviceNodes?.length &&
                routerNodes?.length &&
                routerLinks?.length &&
                !svgTopologyComponent
            ) {
                $node.replaceChildren();
                const topologyServiceRef = FlowTopologyContent(
                    $node,
                    [...routerNodes, ...deviceNodes],
                    [...routerLinks, ...deviceLinks],
                    $node.getBoundingClientRect().width,
                    $node.getBoundingClientRect().height,
                );

                setSvgTopologyComponent(topologyServiceRef);
            }
        },
        [deviceLinks, deviceNodes, routerNodes, routers?.links, svgTopologyComponent],
    );

    return (
        <TopologyView>
            <div ref={panelRef} style={{ width: '100%', height: '100%' }} />
        </TopologyView>
    );
};

export default FlowTopology;
