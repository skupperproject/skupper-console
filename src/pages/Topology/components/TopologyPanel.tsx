import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import { Button, Card } from '@patternfly/react-core';
import { ExpandIcon, SearchMinusIcon, SearchPlusIcon } from '@patternfly/react-icons';

import { GraphEvents } from '@core/components/Graph/Graph.enum';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import TransitionPage from '@core/components/TransitionPages/Slide';

import Graph from '../../../core/components/Graph/Graph';
import { TopologyPanelProps } from '../Topology.interfaces';

const TopologyPanel = forwardRef<{ deselectAll: () => void }, TopologyPanelProps>(
    ({ nodes, edges, onGetSelectedNode, onGetSelectedEdge, options, nodeSelected }, ref) => {
        const [topologyGraphInstance, setTopologyGraphInstance] = useState<Graph>();
        const prevNodesRef = useRef<GraphNode[]>();
        const prevEdgesRef = useRef<GraphEdge[]>();

        const handleOnClickNode = useCallback(
            ({ data: { id } }: { data: GraphNode }) => {
                if (onGetSelectedNode) {
                    onGetSelectedNode(id);
                }
            },
            [onGetSelectedNode],
        );

        const handleOnClickEdge = useCallback(
            ({ data }: { data: GraphNode }) => {
                if (onGetSelectedEdge) {
                    onGetSelectedEdge(data);
                }
            },
            [onGetSelectedEdge],
        );

        function handleCloseDetails() {
            topologyGraphInstance?.deselectAll();
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
                if ($node && nodes.length && !topologyGraphInstance) {
                    $node.replaceChildren();

                    const topologyGraph = new Graph(
                        $node,
                        nodes,
                        edges,
                        $node.getBoundingClientRect().width,
                        $node.getBoundingClientRect().height,
                        options,
                        nodeSelected,
                    );

                    topologyGraph.EventEmitter.on(GraphEvents.NodeClick, handleOnClickNode);
                    topologyGraph.EventEmitter.on(GraphEvents.EdgeClick, handleOnClickEdge);

                    topologyGraph.EventEmitter.on(GraphEvents.IsGraphLoaded, handleIsGraphLoaded);
                    topologyGraph.EventEmitter.on(
                        GraphEvents.IsDraggingNodesEnd,
                        handleSaveNodesPositions,
                    );
                    topologyGraph.EventEmitter.on(
                        GraphEvents.IsDraggingNodeEnd,
                        handleSaveNodePosition,
                    );

                    setTopologyGraphInstance(topologyGraph);
                }
            },
            [
                nodes,
                topologyGraphInstance,
                edges,
                options,
                nodeSelected,
                handleOnClickNode,
                handleOnClickEdge,
                handleIsGraphLoaded,
                handleSaveNodesPositions,
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
                edges &&
                nodes &&
                (JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes) ||
                    JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges))
            ) {
                topologyGraphInstance.updateTopology(nodes, edges, {
                    showGroup: !!options?.showGroup,
                });

                prevNodesRef.current = nodes;
                prevEdgesRef.current = edges;
            }
        }, [nodes, edges, topologyGraphInstance, options?.showGroup]);

        return (
            <Card isFullHeight style={{ position: 'relative' }}>
                <TransitionPage>
                    <div ref={graphRef} style={{ width: '100%', height: '100%' }} />
                </TransitionPage>
                <span style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
                    <Button
                        isActive={true}
                        className="pf-u-m-xs"
                        variant="primary"
                        onClick={() => topologyGraphInstance?.zoomIn()}
                        icon={<SearchPlusIcon />}
                    />

                    <Button
                        isActive={true}
                        className="pf-u-m-xs"
                        variant="primary"
                        onClick={() => topologyGraphInstance?.zoomOut()}
                        icon={<SearchMinusIcon />}
                    />

                    <Button
                        isActive={true}
                        className="pf-u-m-xs"
                        variant="primary"
                        onClick={() => topologyGraphInstance?.zoomReset()}
                        icon={<ExpandIcon />}
                    />
                </span>
            </Card>
        );
    },
);

export default TopologyPanel;
