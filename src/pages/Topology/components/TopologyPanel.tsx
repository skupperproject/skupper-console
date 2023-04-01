import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import { Button, Card } from '@patternfly/react-core';
import { ExpandIcon, SearchMinusIcon, SearchPlusIcon } from '@patternfly/react-icons';

import Graph from '@core/components/Graph';
import { GraphEvents } from '@core/components/Graph/Graph.enum';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import TransitionPage from '@core/components/TransitionPages/Slide';

import { savePositionInLocalStorage } from '../services';
import { TopologyPanelProps } from '../Topology.interfaces';

const TopologyPanel: FC<TopologyPanelProps> = function ({
  nodes,
  edges,
  onGetSelectedNode,
  onGetSelectedEdge,
  options,
  nodeSelected
}) {
  const [topologyGraphInstance, setTopologyGraphInstance] = useState<Graph>();
  const prevNodesRef = useRef<GraphNode[]>();
  const prevEdgesRef = useRef<GraphEdge<string>[]>();

  const handleOnClickNode = useCallback(
    ({ data: { id, name } }: { data: GraphNode }) => {
      if (onGetSelectedNode) {
        onGetSelectedNode({ id, name });
      }
    },
    [onGetSelectedNode]
  );

  const handleOnClickEdge = useCallback(
    ({ data }: { data: GraphNode }) => {
      if (onGetSelectedEdge) {
        onGetSelectedEdge(data);
      }
    },
    [onGetSelectedEdge]
  );

  const handleSaveNodesPositions = useCallback((topologyNodes: GraphNode[]) => {
    topologyNodes.forEach((node) => {
      if (node.x && node.y) {
        savePositionInLocalStorage(node);
      }
    });
  }, []);

  // Creates topology
  const graphRef = useCallback(
    ($node: HTMLDivElement | null) => {
      if ($node && nodes.length && !topologyGraphInstance) {
        const { width, height } = $node.getBoundingClientRect();

        const topologyGraph = new Graph($node, width, height, options, nodeSelected);

        topologyGraph.EventEmitter.on(GraphEvents.NodeClick, handleOnClickNode);
        topologyGraph.EventEmitter.on(GraphEvents.EdgeClick, handleOnClickEdge);
        topologyGraph.run(nodes, sanitizeEdges(nodes, edges));

        setTopologyGraphInstance(topologyGraph);
      }
    },
    [nodes, topologyGraphInstance, edges, options, nodeSelected, handleOnClickNode, handleOnClickEdge]
  );

  // Updates topology
  useEffect(() => {
    if (
      topologyGraphInstance &&
      nodes &&
      (JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes) ||
        JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges))
    ) {
      topologyGraphInstance.updateModel(nodes, sanitizeEdges(nodes, edges));

      prevNodesRef.current = nodes;
      prevEdgesRef.current = edges;
    }
  }, [nodes, edges, topologyGraphInstance, options?.showGroup, handleSaveNodesPositions]);

  const saveNodesPositions = useCallback(() => {
    const topologyNodes = topologyGraphInstance?.getNodes();

    if (topologyNodes) {
      handleSaveNodesPositions(topologyNodes);
    }
  }, [handleSaveNodesPositions, topologyGraphInstance]);

  // Save topology positions in the local storage before exit
  useEffect(() => {
    // handle events like browser refresh, close tab, back button
    window.addEventListener('beforeunload', saveNodesPositions);

    return () => {
      // handle switch tab
      saveNodesPositions();
      window.removeEventListener('beforeunload', saveNodesPositions);
    };
  }, [handleSaveNodesPositions, saveNodesPositions, topologyGraphInstance]);

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
};

export default TopologyPanel;

// TODO: remove this function when Backend sanitize the old process pairs
function sanitizeEdges(nodes: GraphNode[], edges: GraphEdge<string>[]) {
  const availableNodesMap = nodes.reduce((acc, node) => {
    acc[node.id] = node.id;

    return acc;
  }, {} as Record<string, string>);

  return edges.filter(({ source, target }) => availableNodesMap[source] && availableNodesMap[target]);
}
