import { FC, memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Combo, ComboEvent, Edge, EdgeEvent, Graph, GraphOptions, IPointerEvent, Node, NodeEvent } from '@antv/g6';
import { debounce } from '@patternfly/react-core';
import { GraphCombo, GraphEdge, GraphNode, SkGraphProps, LocalStorageData } from 'types/Graph.interfaces';

import ControlBar from './components/ControlBar';
import { registerElements } from './components/CustomElements';
import { options, theme } from './config';
import { GraphLabels } from './enum';
import { LAYOUT_MAP } from './layout';
import { GraphController } from './services';

import './SkGraph.css';

registerElements();

const SkGraph: FC<SkGraphProps> = memo(
  ({
    nodes: nodesWithoutPosition,
    edges,
    combos,
    onClickEdge,
    onClickNode,
    itemsToHighlight,
    forceFitView = false,
    itemSelected,
    layout = 'default',
    savePositions = true,
    excludeBehaviors = []
  }) => {
    const [isGraphLoaded, setIsGraphLoaded] = useState(false);
    const topologyGraphRef = useRef<Graph>(null);

    const prevNodesRef = useRef<GraphNode[]>(nodesWithoutPosition);
    const prevEdgesRef = useRef<GraphEdge[]>(edges);
    const prevCombosRef = useRef<GraphCombo[] | undefined>(combos);

    const save = useCallback(() => {
      const graphInstance = topologyGraphRef.current;

      if (!graphInstance?.getNodeData() || !savePositions) {
        return;
      }

      const updatedNodes = GraphController.fromNodesToLocalStorageData(
        graphInstance.getNodeData(),
        ({ id, x, y }: LocalStorageData) => ({ id, x, y })
      );

      GraphController.saveAllNodePositions(updatedNodes);
    }, [savePositions]);

    const toggleHover = useCallback((enable: boolean = false) => {
      const graphInstance = topologyGraphRef.current as Graph;

      graphInstance.updateBehavior({ key: 'zoom-canvas', enable });

      graphInstance.updateBehavior({
        key: 'hover-activate',
        enable: ({ targetType }: IPointerEvent) => (enable ? targetType === 'node' : false)
      });

      graphInstance.updateBehavior({
        key: 'click-select',
        enable: ({ targetType }: IPointerEvent) => (enable ? targetType === 'node' || targetType === 'edge' : false)
      });
    }, []);

    const setLabelText = (id: string, labelKey: string) => {
      const graphInstance = topologyGraphRef.current!;

      const { data } = graphInstance.getNodeData(id);

      graphInstance.updateNodeData([
        { id, style: { labelText: data![labelKey] as 'fullLabelText' | 'partialLabelText' } }
      ]);
      graphInstance.draw();
    };

    /** Creates network topology instance */
    const graphRef = useCallback(($node: HTMLDivElement) => {
      if (nodesWithoutPosition && !topologyGraphRef.current) {
        const nodes = savePositions ? GraphController.addPositionsToNodes(nodesWithoutPosition) : nodesWithoutPosition;
        // Filter the `options.behaviors` array, removing any behaviors that match an entry in the `excludeBehaviors` array.
        const filteredBehaviors = options.behaviors?.filter(
          (behavior) => behavior.key && !(excludeBehaviors as string[]).includes(behavior.key)
        );

        const configuration: GraphOptions = {
          ...options,
          behaviors: filteredBehaviors,
          container: $node,
          layout: LAYOUT_MAP[layout],
          data: GraphController.transformData({ edges, nodes, combos })
        };

        const graph = new Graph(configuration);

        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_ENTER, (e) => setLabelText(e.target.id, 'fullLabelText'));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_LEAVE, (e) => setLabelText(e.target.id, 'partialLabelText'));
        // Enable the graphic behavior ActivateNodeRelation for the drag and drop event
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_DOWN, () => toggleHover(false));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_UP, () => toggleHover(true));
        graph.on<IPointerEvent<Combo>>(ComboEvent.DRAG_START, () => toggleHover(false));
        graph.on<IPointerEvent<Combo>>(ComboEvent.DRAG_END, () => toggleHover(true));

        graph.on<IPointerEvent<Node>>(NodeEvent.CLICK, ({ target }) => {
          // if the node is already selected , set id = undefined to deleselect it
          const selected = graph.getElementDataByState('node', GraphLabels.Select);
          const data = graph.getElementData(target.id).data as unknown as GraphNode;

          onClickNode?.(target.id === (selected.length && selected[0].id) ? null : data);
        });
        graph.on<IPointerEvent<Edge>>(EdgeEvent.CLICK, ({ target }) => {
          // if the edge is already selected , set id = undefined to deleselect it
          const selected = graph.getElementDataByState('edge', GraphLabels.Select);
          const data = graph.getElementData(target.id).data as unknown as GraphEdge;

          onClickEdge?.(target.id === (selected.length && selected[0].id) ? null : data);
        });

        graph.render().then(() => {
          graph.fitView(); // Fit the view after render

          // Store the graph instance and set the state
          topologyGraphRef.current = graph;
          setIsGraphLoaded(true); // Mark the graph as loaded
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateData = useCallback(async () => {
      if (!isGraphLoaded) {
        return;
      }

      save();

      const graphInstance = topologyGraphRef.current!;
      const nodes = GraphController.addPositionsToNodes(nodesWithoutPosition, graphInstance.getNodeData());

      graphInstance.setData(GraphController.transformData({ edges, nodes, combos }));

      const newNodesIds = nodesWithoutPosition.map((node) => node.id).join(',');
      const prevNodeIds = prevNodesRef.current.map((node) => node.id).join(',');

      await graphInstance.render();

      if (JSON.stringify(newNodesIds) !== JSON.stringify(prevNodeIds) || forceFitView) {
        graphInstance.fitView({ when: 'overflow' });
      }

      save();

      prevNodesRef.current = nodesWithoutPosition;
      prevEdgesRef.current = edges;
      prevCombosRef.current = combos;
    }, [combos, edges, forceFitView, isGraphLoaded, nodesWithoutPosition, save]);

    // This effect updates the topology when there are changes to the nodes, edges.
    useEffect(() => {
      updateData();
    }, [updateData]);

    // highlight nodes
    useEffect(() => {
      if (!isGraphLoaded) {
        return;
      }

      const graphInstance = topologyGraphRef.current!;

      const allElemetsStateMap: Record<string, string[]> = {};
      [...graphInstance.getNodeData(), ...graphInstance.getEdgeData()].forEach(({ id, states }) => {
        const filteredStates =
          states?.filter((state) => state !== GraphLabels.HighlightNode && state !== GraphLabels.Exclude) || [];

        if (id) {
          const selectedState = itemsToHighlight?.length
            ? itemsToHighlight.includes(id)
              ? GraphLabels.HighlightNode
              : GraphLabels.Exclude
            : '';
          allElemetsStateMap[id] = selectedState ? [selectedState, ...filteredStates] : filteredStates;
        }
      });

      graphInstance.setElementState(allElemetsStateMap);
    }, [isGraphLoaded, itemsToHighlight]);

    // select node
    useEffect(() => {
      if (!isGraphLoaded) {
        return;
      }

      const graphInstance = topologyGraphRef.current!;

      if (itemSelected) {
        graphInstance.setElementState(itemSelected, GraphLabels.Select);

        return;
      }

      const nodes = graphInstance?.getElementDataByState('node', GraphLabels.Select);
      if (nodes.length) {
        graphInstance.setElementState(
          nodes[0].id,
          nodes[0].states?.filter((state) => state !== GraphLabels.Select) || []
        );

        return;
      }

      const activeEdges = graphInstance?.getElementDataByState('edge', GraphLabels.Select);

      if (activeEdges.length && activeEdges[0].id) {
        graphInstance.setElementState(
          activeEdges[0].id,
          activeEdges[0].states?.filter((state) => state !== GraphLabels.Select) || []
        );
      }
    }, [isGraphLoaded, itemSelected]);

    useEffect(() => () => save(), [save]);

    // handle resize from the Graph parent.
    useLayoutEffect(() => {
      if (!isGraphLoaded) {
        return;
      }

      const graphInstance = topologyGraphRef.current!;
      const container = GraphController.getParent();

      const handleTranslateGraph = () => {
        const containerDimensions = container!.getBoundingClientRect();
        const selectedNodes = graphInstance.getElementDataByState('node', GraphLabels.Select);

        if (selectedNodes?.length) {
          const selectedNodePosition = graphInstance.getElementPosition(selectedNodes[0].id);
          // Translate the selected node's position to canvas coordinates, which accounts for zoom.
          const selectedNodeCanvasPosition = graphInstance.getViewportByCanvas(selectedNodePosition);
          // Check if node is out of view to the right
          const isNodeOutOfViewRight = containerDimensions.width < selectedNodeCanvasPosition[0];

          if (isNodeOutOfViewRight) {
            const deltaX = containerDimensions.width - selectedNodeCanvasPosition[0] - 50 * graphInstance.getZoom();
            graphInstance.translateBy([deltaX, 0]);
          }
        }

        try {
          graphInstance?.resize(containerDimensions.width, containerDimensions.height);
        } catch {
          return;
        }
      };

      const debouncedHandleResize = debounce(handleTranslateGraph, 350);
      const resizeObserver = new ResizeObserver((entries) => debouncedHandleResize(entries));

      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    }, [isGraphLoaded]);

    return (
      <div
        id={GraphController.getParentName()}
        ref={graphRef}
        style={{
          overflow: 'hidden',
          height: '99%',
          borderStyle: 'solid',
          borderWidth: theme.graph.borderWidth,
          borderRadius: theme.graph.borderRadius,
          borderColor: theme.graph.borderColor
        }}
      >
        {topologyGraphRef.current && <ControlBar graphInstance={topologyGraphRef.current} />}
      </div>
    );
  }
);

export default SkGraph;
