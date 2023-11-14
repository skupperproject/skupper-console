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

import { DEFAULT_GRAPH_CONFIG, DEFAULT_LAYOUT_FORCE_CONFIG } from './Graph.constants';
import MenuControl from './MenuControl';
import { GraphController } from './services';
import {
  registerCustomEdgeWithHover as registerDefaultEdgeWithHover,
  registerNodeWithBadges,
  regusterComboWithCustomLabel,
  registerSiteEdge
} from './services/customItems';

import './SkGraph.css';

const GRAPH_ZOOM_CACHE_KEY = 'graphZoom';
const FIT_SCREEN_CACHE_KEY = 'fitScreen';

const GraphReactAdaptor: FC<GraphReactAdaptorProps> = memo(
  ({
    nodes: nodesWithoutPosition,
    edges,
    combos,
    onClickEdge,
    onClickNode,
    onClickCombo,
    itemSelected,
    saveConfigkey
  }) => {
    const [isGraphLoaded, setIsGraphLoaded] = useState(false);
    const isHoverState = useRef<boolean>(false);
    const prevNodesRef = useRef<GraphNode[]>(nodesWithoutPosition);
    const prevEdgesRef = useRef<GraphEdge[]>(edges);
    const prevCombosRef = useRef<GraphCombo[] | undefined>(combos);
    const itemSelectedRef = useRef(itemSelected);
    const topologyGraphRef = useRef<Graph>();

    const handleComboMouseEnter = useCallback(({ currentTarget, item }: { currentTarget: Graph; item: Item }) => {
      currentTarget.setItemState(item, 'hover', true);
    }, []);

    const handleNodeMouseEnter = useCallback(
      ({ currentTarget, item }: { currentTarget: Graph; item: Item }) => {
        isHoverState.current = true;

        const node = item as INode;
        const neighbors = node.getNeighbors();
        const neighborsIds = neighbors.map((neighbor) => neighbor.getID());

        currentTarget.getNodes().forEach((n: INode) => {
          currentTarget.setItemState(n, 'hover', false);

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

        currentTarget.setItemState(node, 'hover', true);

        // keep the parent combo selected if exist
        const comboId = node.getModel()?.comboId as string | undefined;

        if (comboId) {
          handleComboMouseEnter({ currentTarget, item: currentTarget.findById(comboId) });
        }
      },
      [handleComboMouseEnter]
    );

    const handleEdgeMouseEnter = useCallback(({ currentTarget, item }: { currentTarget: Graph; item: Item }) => {
      isHoverState.current = true;

      const edge = item as IEdge;
      const source = edge.getSource();
      const target = edge.getTarget();

      currentTarget.getNodes().forEach((node) => {
        if (node.getID() !== source.getID() && node.getID() !== target.getID()) {
          currentTarget.setItemState(node, 'hidden', true);
        } else {
          currentTarget.setItemState(node, 'hidden', false);
        }
      });

      currentTarget.getEdges().forEach((topologyEdge) => {
        if (edge.getID() !== topologyEdge.getID()) {
          topologyEdge.hide();
        } else {
          topologyEdge.show();
        }
      });

      currentTarget.setItemState(edge, 'hover', true);
    }, []);
    /** Simulate a MouseEnter event, regardless of whether a node or edge is preselected */
    const handleMouseEnter = useCallback(
      (nodeSelected?: string) => {
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
      },
      [handleEdgeMouseEnter, handleNodeMouseEnter]
    );

    /** Topology events */

    // NODE EVENTS
    const handleNodeClick = useCallback(
      ({ item }: G6GraphEvent) => {
        if (onClickNode) {
          onClickNode(item.getModel());
        }
      },
      [onClickNode]
    );

    const handleNodeDragStart = useCallback(() => {
      isHoverState.current = true;
    }, []);

    const handleNodeDragEnd = useCallback(({ item }: G6GraphEvent) => {
      const updatedNodes = GraphController.fromNodesToLocalStorageData(
        [item as INode],
        ({ id, x, y }: LocalStorageData) => ({ id, x, y })
      );

      GraphController.saveNodePositionsToLocalStorage(updatedNodes);
      isHoverState.current = false;
    }, []);

    const handleComboMouseLeave = useCallback(({ currentTarget, item }: { currentTarget: Graph; item: Item }) => {
      currentTarget.setItemState(item, 'hover', false);
    }, []);

    const handleNodeMouseLeave = useCallback(
      ({ currentTarget, item }: { currentTarget: Graph; item: Item }) => {
        currentTarget.setItemState(item, 'hover', false);

        currentTarget.findAllByState('node', 'hidden').forEach((node) => {
          currentTarget.setItemState(node, 'hidden', false);
        });

        // when we back from an other view and we leave a node we must erase links status
        currentTarget.getEdges().forEach((topologyEdge) => {
          topologyEdge.show();
          currentTarget.setItemState(topologyEdge, 'hover', false);
        });

        // we need to remove the combo highlight if we leave the node label outside the combo boc
        const comboId = item.getModel()?.comboId as string | undefined;

        if (comboId) {
          handleComboMouseLeave({ currentTarget, item: currentTarget.findById(comboId) });
        }

        itemSelectedRef.current = undefined;
        isHoverState.current = false;
      },
      [handleComboMouseLeave]
    );

    // EDGE EVENTS
    const handleEdgeClick = useCallback(
      ({ item }: G6GraphEvent) => {
        if (onClickEdge) {
          onClickEdge(item.getModel());
        }
      },
      [onClickEdge]
    );

    const handleEdgeMouseLeave = useCallback(
      (evt: { currentTarget: Graph; item: Item }) => {
        handleNodeMouseLeave(evt);
      },
      [handleNodeMouseLeave]
    );

    // COMBO EVENTS
    const handleComboClick = useCallback(
      ({ item }: G6GraphEvent) => {
        if (onClickCombo) {
          onClickCombo(item.getModel());
        }
      },
      [onClickCombo]
    );

    const handleCombDragStart = useCallback(() => {
      handleNodeDragStart();
    }, [handleNodeDragStart]);

    const handleComboDragEnd = useCallback(({ item }: G6GraphEvent) => {
      const combo = item as ICombo;
      // Retrieve the nodes contained within the combo box and store their positions in memory
      const updatedNodes = GraphController.fromNodesToLocalStorageData(
        combo.getNodes(),
        ({ id, x, y }: LocalStorageData) => ({ id, x, y })
      );

      GraphController.saveNodePositionsToLocalStorage(updatedNodes);
      isHoverState.current = false;
    }, []);

    // CANVAS EVENTS
    const handleCanvasDragStart = useCallback(() => {
      handleNodeDragStart();
    }, [handleNodeDragStart]);

    const handleCanvasDragEnd = useCallback(({ currentTarget, dx, dy }: G6GraphEvent) => {
      if (dx !== undefined && dy !== undefined) {
        const updatedNodes = GraphController.fromNodesToLocalStorageData(
          currentTarget.getNodes(),
          ({ id, x, y }: LocalStorageData) => ({ id, x: x + (dx as number), y: y + (dy as number) })
        );

        GraphController.saveNodePositionsToLocalStorage(updatedNodes);
      }

      isHoverState.current = false;
    }, []);

    const handleSaveZoom = useCallback(
      (zoomValue: number) => {
        if (saveConfigkey) {
          localStorage.setItem(`${saveConfigkey}-${GRAPH_ZOOM_CACHE_KEY}`, `${zoomValue}`);
        }
      },
      [saveConfigkey]
    );

    const handleFitScreen = useCallback(
      (flag: boolean) => {
        if (saveConfigkey) {
          localStorage.setItem(`${saveConfigkey}-${FIT_SCREEN_CACHE_KEY}`, `${flag}`);
        }
      },
      [saveConfigkey]
    );

    // ZOOM EVENTS
    const handleWheelZoom = useCallback(() => {
      const graphInstance = topologyGraphRef.current;

      if (graphInstance) {
        const zoomValue = graphInstance.getZoom();

        handleSaveZoom(zoomValue);
        handleFitScreen(false);
      }
    }, [handleSaveZoom, handleFitScreen]);

    // TIMING EVENTS
    const handleAfterRender = useCallback(() => {
      const graphInstance = topologyGraphRef.current;

      if (graphInstance) {
        //save positions
        const updatedNodes = GraphController.fromNodesToLocalStorageData(
          graphInstance.getNodes(),
          ({ id, x, y }: LocalStorageData) => ({ id, x, y })
        );

        GraphController.saveNodePositionsToLocalStorage(updatedNodes);

        // Highlight the node and edges connected to the selected item when either a node or an edge is preselected.
        handleMouseEnter(itemSelectedRef.current);
        setIsGraphLoaded(true);
      }
    }, [handleMouseEnter]);

    const handleChangeData = useCallback(() => {
      const graphInstance = topologyGraphRef.current;

      if (graphInstance) {
        const updatedNodes = GraphController.fromNodesToLocalStorageData(
          graphInstance.getNodes(),
          ({ id, x, y }: LocalStorageData) => ({ id, x, y })
        );

        GraphController.saveNodePositionsToLocalStorage(updatedNodes);
      }
    }, []);

    const bindEvents = useCallback(() => {
      /** EVENTS */
      topologyGraphRef.current?.on('node:click', handleNodeClick);
      topologyGraphRef.current?.on('node:dragstart', handleNodeDragStart);
      topologyGraphRef.current?.on('node:dragend', handleNodeDragEnd);
      topologyGraphRef.current?.on('node:mouseenter', handleNodeMouseEnter);
      topologyGraphRef.current?.on('node:mouseleave', handleNodeMouseLeave);

      topologyGraphRef.current?.on('edge:click', handleEdgeClick);
      topologyGraphRef.current?.on('edge:mouseenter', handleEdgeMouseEnter);
      topologyGraphRef.current?.on('edge:mouseleave', handleEdgeMouseLeave);

      topologyGraphRef.current?.on('combo:click', handleComboClick);
      topologyGraphRef.current?.on('combo:dragstart', handleCombDragStart);
      topologyGraphRef.current?.on('combo:dragend', handleComboDragEnd);
      topologyGraphRef.current?.on('combo:mouseenter', handleComboMouseEnter);
      topologyGraphRef.current?.on('combo:mouseleave', handleComboMouseLeave);

      topologyGraphRef.current?.on('canvas:dragstart', handleCanvasDragStart);
      topologyGraphRef.current?.on('canvas:dragend', handleCanvasDragEnd);

      topologyGraphRef.current?.on('wheelzoom', handleWheelZoom);

      // Be carefull: afterender is supposd to be calleed every re-render. However, in our case this event is called just one time  because we update the topology usng changeData.
      // If this behaviour changes we must use a flag to check only the first render
      topologyGraphRef.current?.on('afterrender', handleAfterRender);
      topologyGraphRef.current?.on('afterchangedata', handleChangeData);
    }, [
      handleAfterRender,
      handleChangeData,
      handleCanvasDragEnd,
      handleCanvasDragStart,
      handleComboClick,
      handleComboDragEnd,
      handleCombDragStart,
      handleComboMouseEnter,
      handleComboMouseLeave,
      handleEdgeClick,
      handleEdgeMouseEnter,
      handleEdgeMouseLeave,
      handleNodeClick,
      handleNodeDragEnd,
      handleNodeDragStart,
      handleNodeMouseEnter,
      handleNodeMouseLeave,
      handleWheelZoom
    ]);

    /** Creates network topology instance */
    const graphRef = useCallback(($node: HTMLDivElement) => {
      if (nodesWithoutPosition.length && !topologyGraphRef.current) {
        const nodes = GraphController.addPositionsToNodes(nodesWithoutPosition);
        const data = GraphController.getG6Model({ edges, nodes, combos });

        const options: GraphOptions = {
          container: $node,
          layout: DEFAULT_LAYOUT_FORCE_CONFIG,
          ...DEFAULT_GRAPH_CONFIG
        };

        topologyGraphRef.current = new G6.Graph(options);
        const topologyGraph = topologyGraphRef.current;

        registerNodeWithBadges();
        registerDefaultEdgeWithHover();
        registerSiteEdge();
        regusterComboWithCustomLabel();

        topologyGraph.data(data);
        topologyGraph.render();

        const zoom = Number(localStorage.getItem(`${saveConfigkey}-${GRAPH_ZOOM_CACHE_KEY}`));

        if (zoom) {
          topologyGraph.zoomTo(zoom, topologyGraph.getGraphCenterPoint(), true, { duration: 0 });
        }

        const fitScreen = Number(localStorage.getItem(`${saveConfigkey}-${FIT_SCREEN_CACHE_KEY}`));

        if (fitScreen) {
          topologyGraph.fitView(50, undefined, true, { duration: 0 });
        }

        bindEvents();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
        handleMouseEnter(itemSelectedRef.current);

        prevNodesRef.current = nodesWithoutPosition;
        prevEdgesRef.current = edges;
        prevCombosRef.current = combos;
      }
    }, [nodesWithoutPosition, edges, combos, isGraphLoaded, handleMouseEnter]);

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
      <div ref={graphRef} style={{ height: '98%', background: '#f0f0f0' }}>
        {topologyGraphRef.current && (
          <MenuControl
            graphInstance={topologyGraphRef.current}
            onGetZoom={handleSaveZoom}
            onFitScreen={handleFitScreen}
          />
        )}
      </div>
    );
  }
);

export default GraphReactAdaptor;
