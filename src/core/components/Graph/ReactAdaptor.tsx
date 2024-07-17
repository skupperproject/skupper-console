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

import {
  GraphCombo,
  GraphEdge,
  GraphNode,
  GraphReactAdaptorProps,
  LocalStorageData
} from '@core/components/Graph/Graph.interfaces';

import { registerElements } from './CustomElements';
import { DEFAULT_GRAPH_CONFIG, GRAPH_BG_COLOR, GRAPH_CONTAINER_ID, GraphStates, LAYOUT_MAP } from './Graph.constants';
import MenuControl from './MenuControl';
import { GraphController } from './services';

import './SkGraph.css';

const GraphReactAdaptor: FC<GraphReactAdaptorProps> = memo(
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

    /** Simulate a Select event, regardless of whether a node or edge is preselected */
    // const handleItemSelected = useCallback((id?: string) => {
    //   const graphInstance = topologyGraphRef.current!;

    //   if (graphInstance) {
    //     if (!id) {
    //       GraphController.cleanAllRelations(graphInstance);

    //       return;
    //     }

    //     const type = graphInstance.getElementType(id);

    //     if (type === 'node') {
    //       GraphController.activateNodeRelations(graphInstance, id);
    //     }

    //     if (type === 'edge') {
    //       GraphController.activateEdgeRelations(graphInstance, id);
    //     }
    //   }
    // }, []);

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
        registerElements();

        graph.on<IDragEvent<Combo>>(ComboEvent.DRAG_END, (e) => graph.setElementZIndex(e.target.id, 0));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_ENTER, (e) => setLabelText(e.target.id, 'fullLabelText'));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_LEAVE, (e) => setLabelText(e.target.id, 'partialLabelText'));
        // Enable the graphic behavior ActivateNodeRelation for the drag and drop event
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_DOWN, () => toggleHover(false));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_UP, () => toggleHover(true));

        graph.on<IPointerEvent<Node>>(NodeEvent.CLICK, ({ target }) => {
          // if the node is already selected , set id = undefined to deleselect it
          const node = graph.getElementDataByState('node', GraphStates.Select);
          onClickNode?.(target.id === (node.length && node[0].id) ? '' : target.id);
        });
        graph.on<IPointerEvent<Edge>>(EdgeEvent.CLICK, ({ target }) => {
          // if the edge is already selected , set id = undefined to deleselect it
          const edge = graph.getElementDataByState('edge', GraphStates.Select);
          onClickEdge?.(target.id === (edge.length && edge[0].id) ? '' : target.id);
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
      await graphInstance.render();

      const newNodesIds = nodes.map((node) => node.id).join(',');
      const prevNodeIds = prevNodesRef.current.map((node) => node.id).join(',');

      if (JSON.stringify(newNodesIds) !== JSON.stringify(prevNodeIds)) {
        graphInstance.fitView({ when: 'overflow' });
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
            states?.filter((state) => state !== GraphStates.Highlight && state !== GraphStates.Exclude) || [];

          if (id) {
            const selectedState = itemsToHighlight?.length
              ? itemsToHighlight.includes(id)
                ? GraphStates.Highlight
                : GraphStates.Exclude
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
          graphInstance.setElementState(itemSelected, GraphStates.Select);

          return;
        }

        const nodes = graphInstance?.getElementDataByState('node', GraphStates.Select);
        if (nodes.length) {
          graphInstance.setElementState(
            nodes[0].id,
            nodes[0].states?.filter((state) => state !== GraphStates.Select) || []
          );

          return;
        }

        const activeEdges = graphInstance?.getElementDataByState('edge', GraphStates.Select);

        if (activeEdges.length && activeEdges[0].id) {
          graphInstance.setElementState(
            activeEdges[0].id,
            activeEdges[0].states?.filter((state) => state !== GraphStates.Select) || []
          );
        }
      }
    }, [isGraphLoaded, itemSelected]);

    useEffect(() => () => save(), [save]);

    // handle size change from the browers
    useLayoutEffect(() => {
      const handleResizeGraph = async () => {
        const graphInstance = topologyGraphRef.current!;
        const container = document.querySelector(`#${GRAPH_CONTAINER_ID}`) as Element;

        try {
          graphInstance.resize(container.clientWidth, container.clientHeight);
        } catch {
          return;
        }
      };

      const debouncedHandleResize = debounce(handleResizeGraph, 0);
      window.addEventListener('resize', debouncedHandleResize);

      return () => {
        window.removeEventListener('resize', debouncedHandleResize);
      };
    }, []);

    // handle size change from the parent. ie open / close drawer
    useLayoutEffect(() => {
      const handleTranslateGraph = () => {
        const graphInstance = topologyGraphRef.current!;

        const container = document.getElementById(GRAPH_CONTAINER_ID)!.getBoundingClientRect();
        const nodes = graphInstance.getElementDataByState('node', GraphStates.Select);
        if (nodes?.length) {
          const itemSelectedPos = graphInstance.getElementPosition(nodes[0].id);
          // we need to keep in consideration scaling from zoom
          const itemSelectedPosCanvas = graphInstance.getViewportByCanvas(itemSelectedPos);

          if (container.width < itemSelectedPosCanvas[0]) {
            graphInstance.translateBy([container.width - itemSelectedPosCanvas[0] - 50 * graphInstance.getZoom(), 0]);
          }
        }
      };

      const container = document.querySelector(`#${GRAPH_CONTAINER_ID}`) as Element;
      const resizeObserver = new ResizeObserver((entries) => debouncedHandleResize(entries));

      const debouncedHandleResize = debounce(handleTranslateGraph, 350);
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <div
        id={GRAPH_CONTAINER_ID}
        ref={graphRef}
        style={{
          overflow: 'hidden',
          height: '99.5%',
          background: GRAPH_BG_COLOR
        }}
      >
        {topologyGraphRef.current && <MenuControl graphInstance={topologyGraphRef.current} />}
      </div>
    );
  }
);

export default GraphReactAdaptor;
