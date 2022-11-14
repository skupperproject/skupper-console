//topologypanel.tsx
import React, { FC, useCallback, useEffect, useState } from 'react';

import {
    Drawer,
    DrawerActions,
    DrawerCloseButton,
    DrawerContent,
    DrawerHead,
    DrawerPanelBody,
    DrawerPanelContent,
    Panel,
} from '@patternfly/react-core';
import {
    createTopologyControlButtons,
    defaultControlButtonsOptions,
    TopologyControlBar,
    TopologyView,
} from '@patternfly/react-topology';

import { GraphEvents } from '@core/components/Graph/Graph.enum';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';

import Graph from '../../../core/components/Graph/Graph';

const TopologyPanel: FC<{
    nodes: GraphNode[];
    links: GraphEdge[];
    options?: { showGroup: boolean };
    onGetSelectedNode?: Function;
    children: React.ReactNode;
}> = function ({ nodes, links, onGetSelectedNode, children, options }) {
    const [topologyGraphInstance, setTopologyGraphInstance] = useState<Graph>();
    const [areDetailsExpanded, setIsExpandedDetails] = useState(false);

    const handleExpandDetails = useCallback(
        ({ data: { id } }: { data: GraphNode }) => {
            setIsExpandedDetails(!!id);

            if (onGetSelectedNode) {
                onGetSelectedNode(id);
            }
        },
        [onGetSelectedNode],
    );

    function handleCloseDetails() {
        setIsExpandedDetails(false);
    }

    // Create Graph
    const graphRef = useCallback(
        ($node: HTMLDivElement | null) => {
            if ($node && nodes.length && links.length && !topologyGraphInstance) {
                $node.replaceChildren();

                const topologyGraph = new Graph(
                    $node,
                    nodes,
                    links,
                    $node.getBoundingClientRect().width,
                    $node.getBoundingClientRect().height,
                    options,
                );

                topologyGraph.EventEmitter.on(GraphEvents.NodeClick, handleExpandDetails);
                topologyGraph.updateTopology(nodes, links);

                setTopologyGraphInstance(topologyGraph);
            }
        },
        [handleExpandDetails, links, nodes, options, topologyGraphInstance],
    );

    // Update topology
    useEffect(() => {
        if (topologyGraphInstance && links && nodes) {
            topologyGraphInstance.updateTopology(nodes, links);
        }
    }, [links, nodes, topologyGraphInstance]);

    const ControlButtons = createTopologyControlButtons({
        ...defaultControlButtonsOptions,
        zoomInCallback: () => topologyGraphInstance?.zoomIn(),
        zoomOutCallback: () => topologyGraphInstance?.zoomOut(),
        resetViewCallback: () => topologyGraphInstance?.reset(),
        fitToScreenHidden: true,
        legendHidden: true,
    });

    const Details = (
        <DrawerPanelContent>
            <DrawerHead>
                {children}
                <DrawerActions>
                    <DrawerCloseButton onClick={handleCloseDetails} />
                </DrawerActions>
            </DrawerHead>
        </DrawerPanelContent>
    );

    return (
        <Drawer isExpanded={areDetailsExpanded} position="right">
            <DrawerContent panelContent={Details} style={{ overflow: 'hidden' }}>
                <DrawerPanelBody>
                    <TopologyView
                        controlBar={<TopologyControlBar controlButtons={ControlButtons} />}
                    >
                        <Panel ref={graphRef} style={{ width: '100%', height: '100%' }} />
                    </TopologyView>
                </DrawerPanelBody>
            </DrawerContent>
        </Drawer>
    );
};

export default TopologyPanel;
