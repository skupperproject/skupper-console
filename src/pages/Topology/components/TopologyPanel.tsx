import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

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

import { TopologyEdges, TopologyNode } from '../Topology.interfaces';
import TopologySVG from './TopologySVG';

const TopologyPanel: FC<{
    nodes: TopologyNode[];
    links: TopologyEdges[];
    onGetSelectedNode?: Function;
    children: React.ReactNode;
}> = function ({ nodes, links, onGetSelectedNode, children }) {
    const [topologyGraphInstance, setTopologyGraphInstance] = useState<TopologySVG>();
    const [areDetailsExpanded, setIsExpandedDetails] = useState(false);

    const selectedRef = useRef<string | null>(null);

    const handleExpandDetails = useCallback(
        (id: string) => {
            selectedRef.current = id;

            setIsExpandedDetails(!!selectedRef.current);

            if (onGetSelectedNode) {
                onGetSelectedNode(selectedRef.current);
            }
        },
        [onGetSelectedNode],
    );

    function handleCloseDetails() {
        setIsExpandedDetails(false);
        selectedRef.current = null;
    }

    // Create Graph
    const panelRef = useCallback(
        ($node: HTMLDivElement | null) => {
            if ($node && nodes.length && links.length && !topologyGraphInstance) {
                $node.replaceChildren();

                const topologyGraph = new TopologySVG(
                    $node,
                    nodes,
                    links,
                    $node.getBoundingClientRect().width,
                    $node.getBoundingClientRect().height,
                    handleExpandDetails,
                );
                topologyGraph.updateTopology(nodes, links);

                setTopologyGraphInstance(topologyGraph);
            }
        },
        [handleExpandDetails, links, nodes, topologyGraphInstance],
    );

    // Update topology
    useEffect(() => {
        if (topologyGraphInstance && !topologyGraphInstance?.isDragging()) {
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

    const PanelContent = (
        <DrawerPanelContent>
            {selectedRef.current && (
                <DrawerHead>
                    {children}
                    <DrawerActions>
                        <DrawerCloseButton onClick={handleCloseDetails} />
                    </DrawerActions>
                </DrawerHead>
            )}
        </DrawerPanelContent>
    );

    return (
        <Drawer isExpanded={areDetailsExpanded} position="right">
            <DrawerContent panelContent={PanelContent} style={{ overflow: 'hidden' }}>
                <DrawerPanelBody>
                    <TopologyView
                        controlBar={<TopologyControlBar controlButtons={ControlButtons} />}
                    >
                        <Panel ref={panelRef} style={{ width: '100%', height: '100%' }} />
                    </TopologyView>
                </DrawerPanelBody>
            </DrawerContent>
        </Drawer>
    );
};

export default TopologyPanel;
