import { FC, memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  Combo,
  ComboEvent,
  Edge,
  EdgeEvent,
  Graph,
  GraphOptions,
  IDragEvent,
  IPointerEvent,
  Node,
  NodeEvent
} from '@antv/g6';
import { debounce } from '@patternfly/react-core';

import { GraphCombo, GraphEdge, GraphNode, SkGraphProps, LocalStorageData } from 'types/Graph.interfaces';

import ControlBar from './components/ControlBar';
import { registerElements } from './components/CustomElements';
import { DEFAULT_GRAPH_CONFIG } from './Graph.config';
import { GRAPH_BG_COLOR } from './Graph.constants';
import { GraphElementStates } from './Graph.enum';
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
    itemSelected,
    layout = 'default',
    moveToSelectedNode = false,
    savePositions = true
  }) => {
    const [isGraphLoaded, setIsGraphLoaded] = useState(false);
    const topologyGraphRef = useRef<Graph>();

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
    const graphRef = useCallback(async ($node: HTMLDivElement) => {
      if (nodesWithoutPosition && !topologyGraphRef.current) {
        const nodes = savePositions ? GraphController.addPositionsToNodes(nodesWithoutPosition) : nodesWithoutPosition;

        const options: GraphOptions = {
          ...DEFAULT_GRAPH_CONFIG,
          container: $node,
          layout: LAYOUT_MAP[layout],
          data: GraphController.transformData({ edges, nodes, combos })
        };

        const graph = new Graph(options);

        graph.on<IDragEvent<Combo>>(ComboEvent.DRAG_END, (e) => graph.setElementZIndex(e.target.id, 0));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_ENTER, (e) => setLabelText(e.target.id, 'fullLabelText'));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_LEAVE, (e) => setLabelText(e.target.id, 'partialLabelText'));
        // Enable the graphic behavior ActivateNodeRelation for the drag and drop event
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_DOWN, () => toggleHover(false));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_UP, (e) => {
          toggleHover(true);
          // fix an issue with drop events where node labels are positioned behind edges
          graph.setElementZIndex(e.target.id, 1);
        });

        graph.on<IPointerEvent<Node>>(NodeEvent.CLICK, ({ target }) => {
          // if the node is already selected , set id = undefined to deleselect it
          const selected = graph.getElementDataByState('node', GraphElementStates.Select);
          const data = graph.getElementData(target.id).data as unknown as GraphNode;

          onClickNode?.(target.id === (selected.length && selected[0].id) ? null : data);
        });
        graph.on<IPointerEvent<Edge>>(EdgeEvent.CLICK, ({ target }) => {
          // if the edge is already selected , set id = undefined to deleselect it
          const selected = graph.getElementDataByState('edge', GraphElementStates.Select);
          const data = graph.getElementData(target.id).data as unknown as GraphEdge;

          onClickEdge?.(target.id === (selected.length && selected[0].id) ? null : data);
        });

        await graph.render();
        graph.fitView();

        topologyGraphRef.current = graph;
        save();
        setIsGraphLoaded(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateData = useCallback(async () => {
      if (!isGraphLoaded) {
        return;
      }

      if (
        JSON.stringify(prevNodesRef.current) === JSON.stringify(nodesWithoutPosition) &&
        JSON.stringify(prevEdgesRef.current) === JSON.stringify(edges) &&
        JSON.stringify(prevCombosRef.current) === JSON.stringify(combos)
      ) {
        return;
      }

      save();

      const graphInstance = topologyGraphRef.current!;
      const nodes = GraphController.addPositionsToNodes(nodesWithoutPosition, graphInstance.getNodeData());

      graphInstance.setData(GraphController.transformData({ edges, nodes, combos }));

      const newNodesIds = nodesWithoutPosition.map((node) => node.id).join(',');
      const prevNodeIds = prevNodesRef.current.map((node) => node.id).join(',');

      if (JSON.stringify(newNodesIds) !== JSON.stringify(prevNodeIds)) {
        await graphInstance.render();
        graphInstance.fitView({ when: 'overflow' });
      } else {
        await graphInstance.draw();
      }

      save();

      prevNodesRef.current = nodesWithoutPosition;
      prevEdgesRef.current = edges;
      prevCombosRef.current = combos;
    }, [combos, edges, isGraphLoaded, nodesWithoutPosition, save]);

    // This effect updates the topology when there are changes to the nodes, edges.
    useEffect(() => {
      updateData();
    }, [updateData]);

    // Center the node selected
    useEffect(() => {
      if (isGraphLoaded && itemSelected && moveToSelectedNode) {
        topologyGraphRef.current?.focusElement(itemSelected);
      }
    }, [isGraphLoaded, itemSelected, moveToSelectedNode]);

    // highlight nodes
    useEffect(() => {
      const graphInstance = topologyGraphRef.current!;

      if (isGraphLoaded) {
        const allElemetsStateMap: Record<string, string[]> = {};
        [...graphInstance.getNodeData(), ...graphInstance.getEdgeData()].forEach(({ id, states }) => {
          const filteredStates =
            states?.filter(
              (state) => state !== GraphElementStates.HighlightNode && state !== GraphElementStates.Exclude
            ) || [];

          if (id) {
            const selectedState = itemsToHighlight?.length
              ? itemsToHighlight.includes(id)
                ? GraphElementStates.HighlightNode
                : GraphElementStates.Exclude
              : '';
            allElemetsStateMap[id] = selectedState ? [selectedState, ...filteredStates] : filteredStates;
          }
        });

        graphInstance.setElementState(allElemetsStateMap);
      }
    }, [isGraphLoaded, itemsToHighlight]);

    // select node
    useEffect(() => {
      const graphInstance = topologyGraphRef.current!;

      if (isGraphLoaded) {
        if (itemSelected) {
          graphInstance.setElementState(itemSelected, GraphElementStates.Select);

          return;
        }

        const nodes = graphInstance?.getElementDataByState('node', GraphElementStates.Select);
        if (nodes.length) {
          graphInstance.setElementState(
            nodes[0].id,
            nodes[0].states?.filter((state) => state !== GraphElementStates.Select) || []
          );

          return;
        }

        const activeEdges = graphInstance?.getElementDataByState('edge', GraphElementStates.Select);

        if (activeEdges.length && activeEdges[0].id) {
          graphInstance.setElementState(
            activeEdges[0].id,
            activeEdges[0].states?.filter((state) => state !== GraphElementStates.Select) || []
          );
        }
      }
    }, [isGraphLoaded, itemSelected]);

    useEffect(() => () => save(), [save]);

    // handle the resize from the  browers window
    useLayoutEffect(() => {
      const handleResizeGraph = async () => {
        const graphInstance = topologyGraphRef.current;
        const container = GraphController.getParent();

        try {
          graphInstance?.resize(container.clientWidth, container.clientHeight);
        } catch {
          return;
        }
      };

      const debouncedHandleResize = debounce(handleResizeGraph, 350);
      window.addEventListener('resize', debouncedHandleResize);

      return () => {
        window.removeEventListener('resize', debouncedHandleResize);
      };
    }, []);

    // handle resize from the Graph parent.
    useLayoutEffect(() => {
      const handleTranslateGraph = () => {
        const graphInstance = topologyGraphRef.current;
        if (!graphInstance) {
          return;
        }

        const container = GraphController.getParent()!.getBoundingClientRect();
        const nodes = graphInstance.getElementDataByState('node', GraphElementStates.Select);
        if (nodes?.length) {
          const itemSelectedPos = graphInstance.getElementPosition(nodes[0].id);
          // we need to keep in consideration scaling from zoom
          const itemSelectedPosCanvas = graphInstance.getViewportByCanvas(itemSelectedPos);

          if (container.width < itemSelectedPosCanvas[0]) {
            graphInstance.translateBy([container.width - itemSelectedPosCanvas[0] - 50 * graphInstance.getZoom(), 0]);
          }
        }
      };

      const container = GraphController.getParent();
      const resizeObserver = new ResizeObserver((entries) => debouncedHandleResize(entries));

      const debouncedHandleResize = debounce(handleTranslateGraph, 350);
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <div
        id={GraphController.getParentName()}
        ref={graphRef}
        style={{
          overflow: 'hidden',
          height: '99.5%',
          background: GRAPH_BG_COLOR
        }}
      >
        {topologyGraphRef.current && <ControlBar graphInstance={topologyGraphRef.current} />}
      </div>
    );
  }
);

export default SkGraph;
