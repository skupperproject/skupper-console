import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import { Button, Card } from '@patternfly/react-core';
import { ExpandIcon, SearchMinusIcon, SearchPlusIcon } from '@patternfly/react-icons';

import Graph from '@core/components/Graph/Graph';
import { GraphEvents } from '@core/components/Graph/Graph.enum';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import TransitionPage from '@core/components/TransitionPages/Slide';

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
        localStorage.setItem(node.id, JSON.stringify({ fx: node.x, fy: node.y }));
      }
    });
  }, []);

  // Creates topology
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
          nodeSelected
        );

        topologyGraph.EventEmitter.on(GraphEvents.NodeClick, handleOnClickNode);
        topologyGraph.EventEmitter.on(GraphEvents.EdgeClick, handleOnClickEdge);

        topologyGraph.run();
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
      const topologyNodes = topologyGraphInstance?.getNodes();

      if (topologyNodes) {
        handleSaveNodesPositions(topologyNodes);
      }

      topologyGraphInstance.updateTopology(nodes, edges, {
        showGroup: !!options?.showGroup
      });

      prevNodesRef.current = nodes;
      prevEdgesRef.current = edges;
    }
  }, [nodes, edges, topologyGraphInstance, options?.showGroup, handleSaveNodesPositions]);

  // Save topology positions to the local storage before exit
  useEffect(
    () => () => {
      const topologyNodes = topologyGraphInstance?.getNodes();

      if (topologyNodes) {
        handleSaveNodesPositions(topologyNodes);
      }
    },
    [handleSaveNodesPositions, topologyGraphInstance]
  );

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
