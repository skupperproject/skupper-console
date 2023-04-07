import { FC, useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@patternfly/react-core';
import { ExpandIcon, SearchMinusIcon, SearchPlusIcon } from '@patternfly/react-icons';

import { GraphEvents } from '@core/components/Graph/Graph.enum';
import { GraphEdge, GraphNode, GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import TransitionPage from '@core/components/TransitionPages/Slide';

import Graph from './Graph';

const GraphReactAdaptor: FC<GraphReactAdaptorProps> = function ({
  nodes,
  edges,
  groups,
  onClickEdge,
  onClickNode,
  nodeSelected
}) {
  const [topologyGraphInstance, setTopologyGraphInstance] = useState<Graph>();
  const prevNodesRef = useRef<GraphNode[]>();
  const prevEdgesRef = useRef<GraphEdge<string>[]>();

  const handleOnClickNode = useCallback(
    ({ data: { id, name } }: { data: GraphNode }) => {
      if (onClickNode) {
        onClickNode({ id, name });
      }
    },
    [onClickNode]
  );

  const handleOnClickEdge = useCallback(
    ({ data }: { data: GraphNode }) => {
      if (onClickEdge) {
        onClickEdge(data);
      }
    },
    [onClickEdge]
  );

  const handleSaveNodesPositions = useCallback((topologyNodes: GraphNode[]) => {
    topologyNodes.forEach((node) => {
      if (node.x && node.y) {
        //save the position of the node to the local storage
        localStorage.setItem(node.id, JSON.stringify({ fx: node.x, fy: node.y }));
      }
    });
  }, []);

  // Creates topology
  const graphRef = useCallback(
    ($node: HTMLDivElement | null) => {
      if ($node && nodes.length && !topologyGraphInstance) {
        const { width, height } = $node.getBoundingClientRect();

        const topologyGraph = new Graph({
          $node,
          width,
          height,
          nodeSelected
        });

        topologyGraph.EventEmitter.on(GraphEvents.NodeClick, handleOnClickNode);
        topologyGraph.EventEmitter.on(GraphEvents.EdgeClick, handleOnClickEdge);
        topologyGraph.run({ nodes, edges: sanitizeEdges(nodes, edges), groups });

        setTopologyGraphInstance(topologyGraph);
      }
    },
    [nodes, topologyGraphInstance, edges, groups, nodeSelected, handleOnClickNode, handleOnClickEdge]
  );

  // This effect updates the topology graph instance when there are changes to the nodes, edges or groups.
  useEffect(() => {
    if (
      topologyGraphInstance &&
      nodes &&
      (JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes) ||
        JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges))
    ) {
      topologyGraphInstance.updateModel({ nodes, edges: sanitizeEdges(nodes, edges), groups });

      prevNodesRef.current = nodes;
      prevEdgesRef.current = edges;
    }
  }, [nodes, edges, groups, topologyGraphInstance, handleSaveNodesPositions]);

  const saveNodesPositions = useCallback(() => {
    const topologyNodes = topologyGraphInstance?.getNodes();

    if (topologyNodes) {
      handleSaveNodesPositions(topologyNodes);
    }
  }, [handleSaveNodesPositions, topologyGraphInstance]);

  /**This useEffect function is responsible for saving the positions of the nodes on the topology to the local storage before the user exits the page.**/
  useEffect(() => {
    window.addEventListener('beforeunload', saveNodesPositions);

    // clean up function to remove the event listener when the component unmounts
    return () => {
      // call the saveNodesPositions function to save the nodes positions one last time
      saveNodesPositions();
      window.removeEventListener('beforeunload', saveNodesPositions);
    };
  }, [handleSaveNodesPositions, saveNodesPositions, topologyGraphInstance]);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <TransitionPage>
        <div ref={graphRef} style={{ width: '100%', height: '100%' }} />
      </TransitionPage>

      {topologyGraphInstance && <ZoomControls topologyGraphInstance={topologyGraphInstance} />}
    </div>
  );
};

export default GraphReactAdaptor;

// TODO: remove this function when Backend sanitize the old process pairs
function sanitizeEdges(nodes: GraphNode[], edges: GraphEdge<string>[]) {
  const availableNodesMap = nodes.reduce((acc, node) => {
    acc[node.id] = node.id;

    return acc;
  }, {} as Record<string, string>);

  return edges.filter(({ source, target }) => availableNodesMap[source] && availableNodesMap[target]);
}

type ZoomControlsProps = {
  topologyGraphInstance: Graph;
};

const ZoomControls = function ({ topologyGraphInstance }: ZoomControlsProps) {
  const handleIncreaseZoom = () => topologyGraphInstance?.increaseZoomLevel();
  const handleDecreaseZoom = () => topologyGraphInstance?.decreaseZoomLevel();
  const handleZoomToDefault = () => topologyGraphInstance?.zoomToDefaultPosition();

  return (
    <span style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
      <Button
        isActive={true}
        className="pf-u-m-xs"
        variant="primary"
        onClick={handleIncreaseZoom}
        icon={<SearchPlusIcon />}
      />

      <Button
        isActive={true}
        className="pf-u-m-xs"
        variant="primary"
        onClick={handleDecreaseZoom}
        icon={<SearchMinusIcon />}
      />

      <Button
        isActive={true}
        className="pf-u-m-xs"
        variant="primary"
        onClick={handleZoomToDefault}
        icon={<ExpandIcon />}
      />
    </span>
  );
};
