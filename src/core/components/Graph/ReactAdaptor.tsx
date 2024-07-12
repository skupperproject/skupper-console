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
  GraphEdge,
  GraphCombo,
  GraphNode,
  GraphReactAdaptorProps,
  LocalStorageData
} from '@core/components/Graph/Graph.interfaces';

import { registerElements } from './CustomElements';
import { DEFAULT_GRAPH_CONFIG, GRAPH_BG_COLOR, GRAPH_CONTAINER_ID, LAYOUT_MAP } from './Graph.constants';
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
    itemSelected,
    layout = 'default',
    moveToSelectedNode = false,
    savePositions = true
  }) => {
    const [isGraphLoaded, setIsGraphLoaded] = useState(false);

    const itemSelectedRef = useRef<string | undefined>();
    const prevNodesRef = useRef<GraphNode[]>(nodesWithoutPosition);
    const prevEdgesRef = useRef<GraphEdge[]>(edges);
    const prevCombosRef = useRef<GraphCombo[] | undefined>(combos);
    const topologyGraphRef = useRef<Graph>();

    const save = () => {
      const graphInstance = topologyGraphRef.current;

      if (!graphInstance?.getNodeData()) {
        return;
      }

      const updatedNodes = GraphController.fromNodesToLocalStorageData(
        graphInstance.getNodeData(),
        ({ id, x, y }: LocalStorageData) => ({ id, x, y })
      );

      GraphController.saveAllNodePositions(updatedNodes);
    };

    const toggleHover = useCallback((enable: boolean = false) => {
      const graphInstance = topologyGraphRef.current as Graph;

      graphInstance.updateBehavior({
        key: 'hover-activate',
        enable: ({ targetType }: IPointerEvent) => (enable ? targetType === 'node' || targetType === 'edge' : false)
      });

      graphInstance.updateBehavior({
        key: 'click-select',
        enable: ({ targetType }: IPointerEvent) => (enable ? targetType === 'node' || targetType === 'edge' : false)
      });
    }, []);

    /** Simulate a Select event, regardless of whether a node or edge is preselected */
    const handleItemSelected = useCallback(
      (id?: string) => {
        const graphInstance = topologyGraphRef.current;

        if (graphInstance) {
          if (!id) {
            GraphController.cleanAllRelations(graphInstance);

            return;
          }
          //disable the hover effect of the graph if an item is selected
          toggleHover(!itemSelectedRef.current);
          const type = graphInstance.getElementType(id);

          if (type === 'node') {
            GraphController.activateNodeRelations(graphInstance, id);
          }

          if (type === 'edge') {
            GraphController.activateEdgeRelations(graphInstance, id);
          }
        }
      },
      [toggleHover]
    );

    // const afterLayout = useCallback(() => {
    //   if (itemSelectedRef.current) {
    //     handleItemSelected(itemSelectedRef.current);
    //   }
    //   save();
    // }, [handleItemSelected]);

    const handleResize = async () => {
      const graphInstance = topologyGraphRef.current;
      //await graphInstance?.fitView();
      graphInstance?.resize();
    };

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

        graph.on<IDragEvent<Combo>>(ComboEvent.DRAG_END, ({ target: { id } }) => {
          graph.setElementZIndex(id, 0);
        });
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_ENTER, ({ target: { id } }) =>
          setLabelText(id, 'fullLabelText')
        );
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_LEAVE, ({ target: { id } }) =>
          setLabelText(id, 'partialLabelText')
        );
        // Enable the graphic behavior ActivateNodeRelation for the drag and drop event
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_DOWN, () => toggleHover(false));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_UP, () => toggleHover(!itemSelectedRef.current));

        graph.on<IPointerEvent<Node>>(NodeEvent.CLICK, ({ target: { id } }) => onClickNode?.(id));
        graph.on<IPointerEvent<Edge>>(EdgeEvent.CLICK, ({ target: { id } }) => onClickEdge?.(id));
        // graph.on<IGraphLifeCycleEvent>(GraphEvent.AFTER_SIZE_CHANGE, () => graph.fitCenter());
        //graph.on<IGraphLifeCycleEvent>(GraphEvent.AFTER_LAYOUT, afterLayout);

        await graph.render();
        graph.fitView();

        setIsGraphLoaded(true);
        topologyGraphRef.current = graph;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateData = useCallback(async () => {
      const graphInstance = topologyGraphRef.current;

      if (!graphInstance || !isGraphLoaded) {
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

      const shoulDraw = graphInstance.getNodeData().length === nodesWithoutPosition.length;
      const nodes = GraphController.addPositionsToNodes(nodesWithoutPosition, graphInstance.getNodeData());

      graphInstance.setData(GraphController.transformData({ edges, nodes, combos }));

      if (shoulDraw) {
        await graphInstance.draw();
      } else {
        await graphInstance.render();
        graphInstance.fitView();
      }

      // updated the prev values with the new ones
      prevNodesRef.current = nodesWithoutPosition;
      prevEdgesRef.current = edges;
      prevCombosRef.current = combos;

      save();
    }, [combos, edges, isGraphLoaded, nodesWithoutPosition]);

    // This effect updates the topology when there are changes to the nodes, edges.
    useEffect(() => {
      updateData();
    }, [updateData]);

    // Center the node selected
    useEffect(() => {
      if (itemSelected && moveToSelectedNode) {
        topologyGraphRef.current?.focusElement(itemSelected);
      }
    }, [itemSelected, moveToSelectedNode]);

    // Select the node or edge
    useEffect(() => {
      if (isGraphLoaded && itemSelectedRef.current !== itemSelected) {
        itemSelectedRef.current = itemSelected;
        handleItemSelected(itemSelectedRef.current);
      }
    }, [handleItemSelected, itemSelected, isGraphLoaded]);

    useEffect(() => () => save(), []);

    useLayoutEffect(() => {
      const container = document.querySelector(`#${GRAPH_CONTAINER_ID}`) as Element;
      const resizeObserver = new ResizeObserver((entries) => {
        debouncedHandleResize(entries);
      });

      const debouncedHandleResize = debounce(handleResize, 250);
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
          height: '99.9%',
          background: GRAPH_BG_COLOR
        }}
      >
        {topologyGraphRef.current && <MenuControl graphInstance={topologyGraphRef.current} />}
      </div>
    );
  }
);

export default GraphReactAdaptor;
