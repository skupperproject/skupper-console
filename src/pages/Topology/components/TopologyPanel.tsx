import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

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
import { GraphNode } from '@core/components/Graph/Graph.interfaces';

import Graph from '../../../core/components/Graph/Graph';
import { TopologyPanelProps } from '../Topology.interfaces';

const TopologyPanel = forwardRef<{ deselectAll: () => void }, TopologyPanelProps>(
    ({ nodes, links, onGetSelectedNode, children, options }, ref) => {
        const [topologyGraphInstance, setTopologyGraphInstance] = useState<Graph>();
        const [areDetailsExpanded, setIsExpandedDetails] = useState(
            !!options?.shouldOpenDetails || false,
        );

        const prevNodesRef = useRef<GraphNode[]>();

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
            topologyGraphInstance?.deselectAll();
            setIsExpandedDetails(false);
        }

        const handleIsGraphLoaded = useCallback((topologyNodes: GraphNode[]) => {
            topologyNodes.forEach((node) => {
                if (!localStorage.getItem(node.id)) {
                    handleSaveNodePosition(node);
                }
            });
        }, []);

        const handleSaveNodesPositions = useCallback((topologyNodes: GraphNode[]) => {
            topologyNodes.forEach((node) => {
                handleSaveNodePosition(node);
            });
        }, []);

        function handleSaveNodePosition(node: GraphNode) {
            if (node.x && node.y) {
                localStorage.setItem(node.id, JSON.stringify({ fx: node.x, fy: node.y }));
            }
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
                    topologyGraph.EventEmitter.on(GraphEvents.IsGraphLoaded, handleIsGraphLoaded);
                    topologyGraph.EventEmitter.on(
                        GraphEvents.IsDraggingNodesEnd,
                        handleSaveNodesPositions,
                    );
                    topologyGraph.EventEmitter.on(
                        GraphEvents.IsDraggingNodeEnd,
                        handleSaveNodePosition,
                    );

                    topologyGraph.updateTopology(nodes, links);

                    setTopologyGraphInstance(topologyGraph);
                }
            },
            [
                handleExpandDetails,
                handleIsGraphLoaded,
                handleSaveNodesPositions,
                links,
                nodes,
                options,
                topologyGraphInstance,
            ],
        );

        useImperativeHandle(ref, () => ({
            deselectAll() {
                handleCloseDetails();
            },
        }));

        // Update topology
        useEffect(() => {
            if (
                topologyGraphInstance &&
                links &&
                nodes &&
                JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes)
            ) {
                topologyGraphInstance.updateTopology(nodes, links);
                prevNodesRef.current = nodes;
            }
        }, [nodes, links, topologyGraphInstance]);

        const ControlButtons = createTopologyControlButtons({
            ...defaultControlButtonsOptions,
            zoomInCallback: () => topologyGraphInstance?.zoomIn(),
            zoomOutCallback: () => topologyGraphInstance?.zoomOut(),
            resetViewCallback: () => topologyGraphInstance?.zoomReset(),
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
    },
);

export default TopologyPanel;
