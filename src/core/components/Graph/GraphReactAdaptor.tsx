import { FC, memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import G6, { G6GraphEvent, Graph, GraphOptions, ICombo, IEdge, INode, Item } from '@antv/g6';
import { debounce } from '@patternfly/react-core';

import {
  GraphEdge,
  GraphCombo,
  GraphNode,
  GraphReactAdaptorProps,
  LocalStorageData
} from '@core/components/Graph/Graph.interfaces';

import {
  DEFAULT_COMBO_CONFIG,
  DEFAULT_COMBO_STATE_CONFIG,
  DEFAULT_EDGE_CONFIG,
  DEFAULT_LAYOUT_COMBO_FORCE_CONFIG,
  DEFAULT_LAYOUT_FORCE_CONFIG,
  DEFAULT_MODE,
  DEFAULT_NODE_CONFIG,
  DEFAULT_NODE_STATE_CONFIG
} from './config';
import { registerCustomEdgeWithHover as registerDefaultEdgeWithHover, registerSiteEdge } from './customItems';
import GraphMenuControl from './GraphMenuControl';
import { GraphController } from './services';

const GraphReactAdaptor: FC<GraphReactAdaptorProps> = memo(
  ({
    nodes: nodesWithoutPosition,
    edges,
    combos,
    onClickEdge,
    onClickNode,
    onClickCombo,
    itemSelected,
    onGetZoom,
    onFitScreen,
    fitScreen,
    zoom
  }) => {
    const [isGraphLoaded, setIsGraphLoaded] = useState(false);
    const isHoverState = useRef<boolean>(false);
    const prevNodesRef = useRef<GraphNode[]>(nodesWithoutPosition);
    const prevEdgesRef = useRef<GraphEdge[]>(edges);
    const prevCombosRef = useRef<GraphCombo[] | undefined>(combos);
    const itemSelectedRef = useRef(itemSelected);
    const topologyGraphRef = useRef<Graph>();

    /** Simulate a MouseEnter event, regardless of whether a node or edge is preselected */
    function setTopologyStateByNodeSelected(nodeSelected?: string) {
      const graphInstance = topologyGraphRef.current;

      if (graphInstance && nodeSelected) {
        const item = graphInstance.findById(nodeSelected);

        if (item) {
          if (item.get('type') === 'node') {
            handleNodeMouseEnter({ currentTarget: graphInstance, item });
          }

          if (item.get('type') === 'edge') {
            handleEdgeMouseEnter({ currentTarget: graphInstance, item });
          }
        }
      }

      // handleNodeMouseEnter and handleEdgeMouseEnter set hoverState to true and block any update when we changeData in the useState
      isHoverState.current = false;
    }

    /** Topology events */

    // NODE EVENTS
    function handleNodeClick({ item }: G6GraphEvent) {
      if (onClickNode) {
        onClickNode(item.getModel());
      }
    }

    function handleNodeDragStart() {
      isHoverState.current = true;
    }

    function handleNodeDragEnd({ item }: G6GraphEvent) {
      const updatedNodes = GraphController.fromNodesToLocalStorageData(
        [item as INode],
        ({ id, x, y }: LocalStorageData) => ({ id, x, y })
      );

      GraphController.saveNodePositionsToLocalStorage(updatedNodes);
      isHoverState.current = false;
    }

    function handleNodeMouseEnter({ currentTarget, item }: { currentTarget: Graph; item: Item }) {
      isHoverState.current = true;

      const node = item as INode;
      const neighbors = node.getNeighbors();
      const neighborsIds = neighbors.map((neighbor) => neighbor.getID());

      currentTarget.getNodes().forEach((n: INode) => {
        if (node.getID() !== n.getID() && !neighborsIds.includes(n.getID())) {
          currentTarget.setItemState(n, 'hidden', true);
          n.toBack();
        } else {
          currentTarget.setItemState(n, 'hidden', false);
        }
      });

      currentTarget.getEdges().forEach((topologyEdge: IEdge) => {
        if (node.getID() !== topologyEdge.getSource().getID() && node.getID() !== topologyEdge.getTarget().getID()) {
          topologyEdge.hide();
        } else {
          topologyEdge.show();
        }
      });
    }

    function handleNodeMouseLeave({ currentTarget }: G6GraphEvent) {
      currentTarget.findAllByState('node', 'hidden').forEach((node: INode) => {
        currentTarget.setItemState(node, 'hidden', false);
      });

      // when we back from an other view and we leave a node we must erase links status
      currentTarget.getEdges().forEach((topologyEdge: IEdge) => {
        topologyEdge.show();
        currentTarget.setItemState(topologyEdge, 'hover', false);
      });

      itemSelectedRef.current = undefined;
      isHoverState.current = false;
    }

    // EDGE EVENTS
    function handleEdgeClick({ item }: G6GraphEvent) {
      if (onClickEdge) {
        onClickEdge(item.getModel());
      }
    }

    function handleEdgeMouseEnter({ currentTarget, item }: { currentTarget: Graph; item: Item }) {
      isHoverState.current = true;

      const edge = item as IEdge;
      const source = edge.getSource();
      const target = edge.getTarget();

      currentTarget.getNodes().forEach((node: INode) => {
        if (node.getID() !== source.getID() && node.getID() !== target.getID()) {
          currentTarget.setItemState(node, 'hidden', true);
        }
      });

      currentTarget.getEdges().forEach((topologyEdge: IEdge) => {
        if (edge.getID() !== topologyEdge.getID()) {
          topologyEdge.hide();
        } else {
          topologyEdge.show();
        }
      });

      currentTarget.setItemState(edge, 'hover', true);
      currentTarget.setItemState(source, 'hidden', false);
      currentTarget.setItemState(target, 'hidden', false);
    }

    function handleEdgeMouseLeave(e: G6GraphEvent) {
      handleNodeMouseLeave(e);
    }

    // COMBO EVENTS
    function handleComboClick({ item }: G6GraphEvent) {
      if (onClickCombo) {
        onClickCombo(item.getModel());
      }
    }

    function handleCombDragStart() {
      isHoverState.current = true;
    }

    function handleComboDragEnd({ item }: G6GraphEvent) {
      const combo = item as ICombo;
      // Retrieve the nodes contained within the combo box and store their positions in memory
      const updatedNodes = GraphController.fromNodesToLocalStorageData(
        combo.getNodes(),
        ({ id, x, y }: LocalStorageData) => ({ id, x, y })
      );

      GraphController.saveNodePositionsToLocalStorage(updatedNodes);
      isHoverState.current = false;
    }

    // CANVAS EVENTS
    function handleCanvasDragStart() {
      isHoverState.current = true;
    }

    function handleCanvasDragEnd({ currentTarget, dx, dy }: G6GraphEvent) {
      if (dx !== undefined && dy !== undefined) {
        const updatedNodes = GraphController.fromNodesToLocalStorageData(
          currentTarget.getNodes(),
          ({ id, x, y }: LocalStorageData) => ({ id, x: x + (dx as number), y: y + (dy as number) })
        );

        GraphController.saveNodePositionsToLocalStorage(updatedNodes);
      }

      isHoverState.current = false;
    }

    // ZOOM EVENTS
    function handleWheelZoom() {
      const graphInstance = topologyGraphRef.current;

      if (graphInstance) {
        const zoomValue = graphInstance.getZoom();

        if (onGetZoom) {
          onGetZoom(zoomValue);
        }

        if (onFitScreen) {
          onFitScreen(0);
        }
      }
    }

    // TIMING EVENTS
    function handleAfterRender() {
      const graphInstance = topologyGraphRef.current;

      if (graphInstance) {
        //save positions
        const updatedNodes = GraphController.fromNodesToLocalStorageData(
          graphInstance.getNodes(),
          ({ id, x, y }: LocalStorageData) => ({ id, x, y })
        );

        GraphController.saveNodePositionsToLocalStorage(updatedNodes);
        updatedNodes;

        // Highlight the node and edges connected to the selected item when either a node or an edge is preselected.
        setTopologyStateByNodeSelected(itemSelectedRef.current);
        setIsGraphLoaded(true);
      }
    }

    function handleChangeData() {
      const graphInstance = topologyGraphRef.current;

      if (graphInstance) {
        const updatedNodes = GraphController.fromNodesToLocalStorageData(
          graphInstance.getNodes(),
          ({ id, x, y }: LocalStorageData) => ({ id, x, y })
        );

        GraphController.saveNodePositionsToLocalStorage(updatedNodes);
        updatedNodes;
      }
    }

    /** Creates network topology instance */
    const graphRef = useCallback(($node: HTMLDivElement) => {
      if (nodesWithoutPosition.length && !topologyGraphRef.current) {
        const nodes = GraphController.addPositionsToNodes(nodesWithoutPosition);
        const data = GraphController.getG6Model({ edges, nodes, combos });

        const width = $node.scrollWidth;
        const height = $node.scrollHeight;

        const layout = combos?.length ? DEFAULT_LAYOUT_COMBO_FORCE_CONFIG : DEFAULT_LAYOUT_FORCE_CONFIG;

        const options: GraphOptions = {
          container: $node,
          width,
          height,
          modes: DEFAULT_MODE,
          defaultNode: DEFAULT_NODE_CONFIG,
          defaultCombo: DEFAULT_COMBO_CONFIG,
          defaultEdge: DEFAULT_EDGE_CONFIG,
          nodeStateStyles: DEFAULT_NODE_STATE_CONFIG,
          comboStateStyles: DEFAULT_COMBO_STATE_CONFIG,
          layout: {
            pipes: [
              {
                type: 'force',
                nodesFilter: (node: GraphNode) => node.fx !== undefined && node.fy !== undefined,
                alpha: 0,
                center: [width / 2, height / 2]
              },
              {
                ...layout,
                nodesFilter: (node: GraphNode) => node.fx === undefined && node.fy === undefined,
                center: [width / 2, height / 2]
              }
            ]
          }
        };

        topologyGraphRef.current = new G6.Graph(options);
        const topologyGraph = topologyGraphRef.current;

        /** EVENTS */
        topologyGraph.on('node:click', handleNodeClick);
        topologyGraph.on('node:dragstart', handleNodeDragStart);
        topologyGraph.on('node:dragend', handleNodeDragEnd);
        topologyGraph.on('node:mouseenter', handleNodeMouseEnter);
        topologyGraph.on('node:mouseleave', handleNodeMouseLeave);

        topologyGraph.on('edge:click', handleEdgeClick);
        topologyGraph.on('edge:mouseenter', handleEdgeMouseEnter);
        topologyGraph.on('edge:mouseleave', handleEdgeMouseLeave);

        topologyGraph.on('combo:click', handleComboClick);
        topologyGraph.on('combo:dragstart', handleCombDragStart);
        topologyGraph.on('combo:dragend', handleComboDragEnd);

        topologyGraph.on('canvas:dragstart', handleCanvasDragStart);
        topologyGraph.on('canvas:dragend', handleCanvasDragEnd);

        topologyGraph.on('wheelzoom', handleWheelZoom);

        // Be carefull: afterender is supposd to be calleed every re-render. In our case that's not happen  because we update the topology usng changeData.
        // If this behaviour changes we must use a flag to check only the first render
        topologyGraph.on('afterrender', handleAfterRender);
        topologyGraph.on('afterchangedata', handleChangeData);

        registerDefaultEdgeWithHover();
        registerSiteEdge();

        topologyGraph.data(data);
        topologyGraph.render();

        if (zoom) {
          topologyGraph.zoomTo(zoom, topologyGraph.getGraphCenterPoint(), true, { duration: 0 });
        }

        if (fitScreen) {
          topologyGraph.fitView(50, undefined, true, { duration: 0 });
        }
      }
    }, []);

    // This effect updates the topology when there are changes to the nodes, edges or combos.
    useEffect(() => {
      const graphInstance = topologyGraphRef.current;

      if (
        !isHoverState.current &&
        isGraphLoaded &&
        graphInstance &&
        (JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodesWithoutPosition) ||
          JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges) ||
          JSON.stringify(prevCombosRef.current) !== JSON.stringify(combos))
      ) {
        const nodes = GraphController.addPositionsToNodes(nodesWithoutPosition);
        graphInstance.changeData(GraphController.getG6Model({ edges, nodes, combos }));

        // After calling changeData the data the state of topology is reset. We call this function to recover this state
        setTopologyStateByNodeSelected(itemSelectedRef.current);

        prevNodesRef.current = nodesWithoutPosition;
        prevEdgesRef.current = edges;
        prevCombosRef.current = combos;
      }
    }, [nodesWithoutPosition, edges, combos, isGraphLoaded]);

    // This effect handle the resize of the topology when the browser window changes size.
    useLayoutEffect(() => {
      const graphInstance = topologyGraphRef.current;

      if (!graphInstance || graphInstance.get('destroyed')) {
        return;
      }
      const container = graphInstance?.getContainer();
      if (!container) {
        return;
      }

      const handleResize = () => {
        try {
          graphInstance.changeSize(container.clientWidth, container.clientHeight);
        } catch {
          return;
        }
      };

      const debouncedHandleResize = debounce(handleResize, 200);
      window.addEventListener('resize', debouncedHandleResize);

      return () => window.removeEventListener('resize', debouncedHandleResize);
    }, []);

    return (
      <div ref={graphRef} style={{ height: '98%', position: 'relative' }}>
        {topologyGraphRef.current && (
          <GraphMenuControl graphInstance={topologyGraphRef.current} onGetZoom={onGetZoom} onFitScreen={onFitScreen} />
        )}
      </div>
    );
  }
);

export default GraphReactAdaptor;
