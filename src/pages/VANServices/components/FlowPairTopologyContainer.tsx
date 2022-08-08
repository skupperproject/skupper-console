import React, { FC, useCallback, useMemo, useState } from 'react';

import { TopologyView } from '@patternfly/react-topology';

import { formatBytes } from '@core/utils/formatBytes';

import { FlowPairProps, VanServicesTopologyVanService } from '../VANServices.interfaces';
import FlowPairTopologySVG from './FlowPairTopologySVG';

const FlowPairTopologyContainer: FC<FlowPairProps> = function ({ connection, routers }) {
    const [svgTopologyComponent, setSvgTopologyComponent] =
        useState<VanServicesTopologyVanService>();

    const routerNodes = useMemo(
        () =>
            routers.nodes.map(({ identity, siteName }) => {
                const positions = localStorage.getItem(identity);

                return {
                    identity,
                    name: siteName,
                    width: 50,
                    type: 'router',
                    x: 0,
                    y: 0,
                    fx: positions ? JSON.parse(positions).fx : null,
                    fy: positions ? JSON.parse(positions).fy : null,
                };
            }),
        [routers.nodes],
    );

    const flowPairTopology = useMemo(
        () => [{ ...connection.startFlow.device, flow: connection?.startFlow }],
        [connection],
    );

    if (connection.endFlow) {
        flowPairTopology.push({ ...connection.endFlow.device, flow: connection.endFlow });
    }

    const deviceNodes = useMemo(
        () =>
            flowPairTopology.map(({ identity, address, recType, protocol, flow }) => {
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
        [flowPairTopology],
    );

    const deviceLinks = useMemo(
        () =>
            flowPairTopology.flatMap(({ identity, recType, parent, protocol }) => {
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
        [flowPairTopology],
    );

    const panelRef = useCallback(
        ($node: HTMLDivElement) => {
            const routerLinks = routers?.links;

            if (
                $node &&
                deviceLinks.length &&
                deviceNodes.length &&
                routerNodes.length &&
                routers?.links.length &&
                !svgTopologyComponent
            ) {
                $node.replaceChildren();
                const topologyServiceRef = FlowPairTopologySVG(
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

export default FlowPairTopologyContainer;
