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

import { GraphReactAdaptorProps, LocalStorageData } from '@core/components/Graph/Graph.interfaces';

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
        enable: ({ targetType }: IPointerEvent) => (enable ? targetType === 'node' || targetType === 'edge' : false)
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

    const handleResize = () => {
      const graphInstance = topologyGraphRef.current;
      const dimensions = graphInstance?.getSize()!;
      const newDimension = document.getElementById(GRAPH_CONTAINER_ID)?.getBoundingClientRect()!;

      if (newDimension?.width > dimensions[0]) {
        graphInstance?.resize();
      }
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

        graph.on<IDragEvent<Combo>>(ComboEvent.DRAG_END, (e) => graph.setElementZIndex(e.target.id, 0));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_ENTER, (e) => setLabelText(e.target.id, 'fullLabelText'));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_LEAVE, (e) => setLabelText(e.target.id, 'partialLabelText'));
        // Enable the graphic behavior ActivateNodeRelation for the drag and drop event
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_DOWN, () => toggleHover(false));
        graph.on<IPointerEvent<Node>>(NodeEvent.POINTER_UP, () => toggleHover(true));

        graph.on<IPointerEvent<Node>>(NodeEvent.CLICK, ({ target }) => onClickNode?.(target.id));
        graph.on<IPointerEvent<Edge>>(EdgeEvent.CLICK, ({ target: { id } }) => onClickEdge?.(id));

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
      save();

      const graphInstance = topologyGraphRef.current!;
      const nodes = GraphController.addPositionsToNodes(nodesWithoutPosition, graphInstance.getNodeData());

      graphInstance.setData(GraphController.transformData({ edges, nodes, combos }));
      await graphInstance.render();

      save();
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
      if (isGraphLoaded && itemSelected) {
        topologyGraphRef.current?.setElementState(itemSelected, 'activeElement');

        //handleItemSelected(itemSelected);
      }
    }, [isGraphLoaded, itemSelected]);

    useEffect(() => () => save(), [save]);

    useLayoutEffect(() => {
      const container = document.querySelector(`#${GRAPH_CONTAINER_ID}`) as Element;
      const resizeObserver = new ResizeObserver((entries) => debouncedHandleResize(entries));

      const debouncedHandleResize = debounce(handleResize, 400);
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
