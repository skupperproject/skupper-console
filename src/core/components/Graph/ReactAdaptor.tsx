import {
  FC,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import G6, { G6GraphEvent, Graph, GraphOptions, IEdge, INode, Item } from '@antv/g6';
import { debounce } from '@patternfly/react-core';

import {
  GraphEdge,
  GraphCombo,
  GraphNode,
  GraphReactAdaptorProps,
  LocalStorageData
} from '@core/components/Graph/Graph.interfaces';

import { DEFAULT_GRAPH_CONFIG, DEFAULT_LAYOUT_FORCE_CONFIG, GRAPH_BG_COLOR } from './Graph.constants';
import MenuControl from './MenuControl';
import { GraphController } from './services';
import {
  registerDataEdge as registerDefaultEdgeWithHover,
  registerNodeWithBadges,
  regusterComboWithCustomLabel,
  registerSiteLinkEdge
} from './services/customItems';

import './SkGraph.css';

const GRAPH_ZOOM_CACHE_KEY = 'graphZoom';
const FIT_SCREEN_CACHE_KEY = 'fitScreen';

const GraphReactAdaptor: FC<GraphReactAdaptorProps> = memo(
  forwardRef(
    (
      {
        nodes: nodesWithoutPosition,
        edges,
        combos,
        onClickEdge,
        onClickNode,
        onClickCombo,
        itemSelected,
        saveConfigkey
      },
      ref
    ) => {
      const [isGraphLoaded, setIsGraphLoaded] = useState(false);
      const isHoverState = useRef<boolean>(false);
      const prevNodesRef = useRef<GraphNode[]>(nodesWithoutPosition);
      const prevEdgesRef = useRef<GraphEdge[]>(edges);
      const prevCombosRef = useRef<GraphCombo[] | undefined>(combos);
      const itemSelectedRef = useRef<string | undefined>();
      const topologyGraphRef = useRef<Graph>();

      useImperativeHandle(ref, () => ({
        saveNodePositions() {
          Promise.resolve(savePositions());
        },

        fitView() {
          const graphInstance = topologyGraphRef.current;

          if (!graphInstance) {
            return;
          }

          graphInstance.fitView(20, undefined, true, { duration: 100 });
        },

        focusItem(id: string | undefined) {
          const graphInstance = topologyGraphRef.current;

          if (!graphInstance) {
            return;
          }

          if (id) {
            handleMouseEnter(id);
            graphInstance.focusItem(id, true, { duration: 100 });

            return;
          }

          handleNodeMouseLeave({ currentTarget: graphInstance });
        }
      }));

      const savePositions = useCallback(() => {
        const graphInstance = topologyGraphRef.current;

        if (!graphInstance?.getNodes()) {
          return;
        }

        const updatedNodes = GraphController.fromNodesToLocalStorageData(
          graphInstance.getNodes(),
          ({ id, x, y }: LocalStorageData) => ({ id, x, y })
        );

        GraphController.saveAllNodePositions(updatedNodes);
      }, []);

      const handleComboMouseEnter = useCallback(({ currentTarget, item }: { currentTarget: Graph; item?: Item }) => {
        if (item) {
          currentTarget.setItemState(item, 'hover', true);
        }
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
            if (
              node.getID() !== topologyEdge.getSource().getID() &&
              node.getID() !== topologyEdge.getTarget().getID()
            ) {
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
        (id?: string) => {
          isHoverState.current = true;

          const graphInstance = topologyGraphRef.current;

          if (graphInstance && id) {
            const item = graphInstance.findById(id);

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

      const handleComboMouseLeave = useCallback(({ currentTarget, item }: { currentTarget: Graph; item?: Item }) => {
        if (item) {
          currentTarget.setItemState(item, 'hover', false);
        }
      }, []);

      const handleNodeMouseLeave = useCallback(
        ({ currentTarget, item }: { currentTarget: Graph; item?: Item }) => {
          currentTarget.findAllByState('node', 'hover').forEach((node) => {
            currentTarget.setItemState(node, 'hover', false);
          });

          currentTarget.findAllByState('node', 'hidden').forEach((node) => {
            currentTarget.setItemState(node, 'hidden', false);
          });

          // when we back from an other view and we leave a node we must erase links status
          currentTarget.getEdges().forEach((edge) => {
            edge.show();
            currentTarget.setItemState(edge, 'hover', false);
          });

          // we need to remove the combo highlight if we leave the node label outside the combo boc
          const comboId = item?.getModel()?.comboId as string | undefined;

          if (comboId) {
            handleComboMouseLeave({ currentTarget, item: currentTarget.findById(comboId) });
          }

          itemSelectedRef.current = undefined;
          isHoverState.current = false;
        },
        [handleComboMouseLeave]
      );

      const handleEdgeMouseLeave = useCallback(
        (evt: { currentTarget: Graph; item: Item }) => {
          handleNodeMouseLeave(evt);
        },
        [handleNodeMouseLeave]
      );

      const handleNodeClick = useCallback(
        ({ item }: G6GraphEvent) => {
          if (onClickNode) {
            onClickNode(item.getModel());
          }
        },
        [onClickNode]
      );

      const handleEdgeClick = useCallback(
        ({ item }: G6GraphEvent) => {
          if (onClickEdge) {
            onClickEdge(item.getModel());
          }
        },
        [onClickEdge]
      );

      const handleComboClick = useCallback(
        ({ item }: G6GraphEvent) => {
          if (onClickCombo) {
            onClickCombo(item.getModel());
          }
        },
        [onClickCombo]
      );

      const handleNodeDragStart = useCallback(() => {
        isHoverState.current = true;
      }, []);

      const handleNodeDragEnd = useCallback(() => {
        isHoverState.current = false;
      }, []);

      const handleCombDragStart = useCallback(() => {
        isHoverState.current = true;
      }, []);

      const handleComboDragEnd = useCallback(() => {
        isHoverState.current = false;
      }, []);

      // CANVAS EVENTS
      const handleCanvasDragStart = useCallback(() => {
        isHoverState.current = true;
      }, []);

      const handleCanvasDragEnd = useCallback(() => {
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
      const handleAfterChangeData = useCallback(() => {
        handleMouseEnter(itemSelectedRef.current);
      }, [handleMouseEnter]);

      const handleAfterRender = useCallback(() => {
        handleMouseEnter(itemSelectedRef.current);

        if (itemSelectedRef.current) {
          topologyGraphRef.current?.focusItem(itemSelectedRef.current);
        }

        setIsGraphLoaded(true);
      }, [handleMouseEnter]);

      const handleBeforeDestroy = useCallback(() => {
        Promise.resolve(savePositions());
      }, [savePositions]);

      const bindEvents = useCallback(() => {
        /** EVENTS */
        topologyGraphRef.current?.on('node:click', handleNodeClick);
        topologyGraphRef.current?.on('node:dragstart', handleNodeDragStart);
        topologyGraphRef.current?.on('node:dragend', handleNodeDragEnd);
        topologyGraphRef.current?.on(
          'node:mouseenter',
          ({ currentTarget, item }: { currentTarget: Graph; item: Item }) =>
            !itemSelectedRef.current ? handleNodeMouseEnter({ currentTarget, item }) : undefined
        );
        topologyGraphRef.current?.on(
          'node:mouseleave',
          ({ currentTarget, item }: { currentTarget: Graph; item: Item }) =>
            !itemSelectedRef.current ? handleNodeMouseLeave({ currentTarget, item }) : undefined
        );

        topologyGraphRef.current?.on('edge:click', handleEdgeClick);
        topologyGraphRef.current?.on(
          'edge:mouseenter',
          ({ currentTarget, item }: { currentTarget: Graph; item: Item }) =>
            !itemSelectedRef.current ? handleEdgeMouseEnter({ currentTarget, item }) : undefined
        );
        topologyGraphRef.current?.on(
          'edge:mouseleave',
          ({ currentTarget, item }: { currentTarget: Graph; item: Item }) =>
            !itemSelectedRef.current ? handleEdgeMouseLeave({ currentTarget, item }) : undefined
        );

        topologyGraphRef.current?.on('combo:click', handleComboClick);
        topologyGraphRef.current?.on('combo:dragstart', handleCombDragStart);
        topologyGraphRef.current?.on('combo:dragend', handleComboDragEnd);
        topologyGraphRef.current?.on(
          'combo:mouseenter',
          ({ currentTarget, item }: { currentTarget: Graph; item: Item }) =>
            !itemSelectedRef.current ? handleComboMouseEnter({ currentTarget, item }) : undefined
        );
        topologyGraphRef.current?.on(
          'combo:mouseleave',
          ({ currentTarget, item }: { currentTarget: Graph; item: Item }) =>
            !itemSelectedRef.current ? handleComboMouseLeave({ currentTarget, item }) : undefined
        );

        topologyGraphRef.current?.on('canvas:dragstart', handleCanvasDragStart);
        topologyGraphRef.current?.on('canvas:dragend', handleCanvasDragEnd);

        topologyGraphRef.current?.on('wheelzoom', handleWheelZoom);

        topologyGraphRef.current?.on('afterchangedata', handleAfterChangeData);

        // Be carefull: afterender is supposd to be calleed every re-render. However, in our case this event is called just one time  because we update the topology usng changeData.
        // If this behaviour changes we must use a flag to check only the first render
        topologyGraphRef.current?.on('afterrender', handleAfterRender);
        topologyGraphRef.current?.on('beforedestroy', handleBeforeDestroy);
      }, [
        handleNodeClick,
        handleNodeDragStart,
        handleNodeDragEnd,
        handleNodeMouseEnter,
        handleNodeMouseLeave,
        handleEdgeClick,
        handleEdgeMouseEnter,
        handleEdgeMouseLeave,
        handleComboClick,
        handleCombDragStart,
        handleComboDragEnd,
        handleComboMouseEnter,
        handleComboMouseLeave,
        handleCanvasDragStart,
        handleCanvasDragEnd,
        handleWheelZoom,
        handleAfterChangeData,
        handleAfterRender,
        handleBeforeDestroy
      ]);

      /** Creates network topology instance */
      const graphRef = useCallback(($node: HTMLDivElement) => {
        if (nodesWithoutPosition.length && !topologyGraphRef.current) {
          registerNodeWithBadges();
          registerDefaultEdgeWithHover();
          registerSiteLinkEdge();
          regusterComboWithCustomLabel();

          const nodes = GraphController.addPositionsToNodes(nodesWithoutPosition);
          const data = GraphController.getG6Model({ edges, nodes, combos });
          const options: GraphOptions = {
            container: $node,
            fitView: true,
            fitViewPadding: 20,
            layout: {
              ...DEFAULT_LAYOUT_FORCE_CONFIG,
              center: [0, 0],
              maxIteration: GraphController.calculateMaxIteration(nodes)
            },
            ...DEFAULT_GRAPH_CONFIG
          };

          topologyGraphRef.current = new G6.Graph(options);
          topologyGraphRef.current.read(data);
          bindEvents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      useEffect(() => {
        itemSelectedRef.current = itemSelected;
      }, [itemSelected]);

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
          // add positions to nodes fom the local storage
          const nodesWithPositions = GraphController.addPositionsToNodes(nodesWithoutPosition);

          //Map of the most updated nodes from the graph
          const positionMap = graphInstance.getNodes().reduce(
            (acc, node) => {
              const id = (node.getModel().persistPositionKey || node.getID()) as string;
              acc[id] = { x: node.getModel().x, y: node.getModel().y };

              return acc;
            },
            {} as Record<string, { x?: number; y?: number }>
          );

          // check updated nodes from the graph otherwise rollback to the localstorage position
          const nodes = nodesWithPositions.map((node) => ({
            ...node,
            x: positionMap[node.persistPositionKey || node.id]?.x || node.x,
            y: positionMap[node.persistPositionKey || node.id]?.y || node.y
          }));

          graphInstance.changeData(GraphController.getG6Model({ edges, nodes, combos }));

          prevNodesRef.current = nodesWithoutPosition;
          prevEdgesRef.current = edges;
          prevCombosRef.current = combos;
        }
      }, [nodesWithoutPosition, edges, combos, isGraphLoaded]);

      // This effect handle the resize of the topology when the browser window changes size.
      useLayoutEffect(() => {
        const graphInstance = topologyGraphRef.current;

        if (!graphInstance) {
          return;
        }

        const container = graphInstance.getContainer();
        const handleResize = () => {
          try {
            graphInstance.changeSize(container.clientWidth, container.clientHeight);
          } catch {
            return;
          }
        };

        const destroyGraph = () => graphInstance.destroy();
        const debouncedHandleResize = debounce(handleResize, 200);
        window.addEventListener('resize', debouncedHandleResize);
        window.addEventListener('beforeunload', destroyGraph);

        return () => {
          window.removeEventListener('resize', debouncedHandleResize);
          window.removeEventListener('beforeunload', destroyGraph);
          graphInstance.destroy();
        };
      }, []);

      return (
        <div ref={graphRef} style={{ height: '98%', background: GRAPH_BG_COLOR, position: 'relative' }}>
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
  )
);

export default GraphReactAdaptor;
