import {
  FC,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useInsertionEffect,
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
import LoadingPage from '@pages/shared/Loading';

import { DEFAULT_GRAPH_CONFIG, LAYOUT_TOPOLOGY_DEFAULT, GRAPH_BG_COLOR } from './Graph.constants';
import MenuControl from './MenuControl';
import { GraphController } from './services';
import {
  registerDataEdge as registerDefaultEdgeWithHover,
  registerNodeWithBadges,
  regusterComboWithCustomLabel,
  registerSiteLinkEdge
} from './services/customItems';

import './SkGraph.css';

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
        layout = LAYOUT_TOPOLOGY_DEFAULT,
        moveToSelectedNode = false
      },
      ref
    ) => {
      const [isGraphLoaded, setIsGraphLoaded] = useState(false);

      const itemSelectedRef = useRef<string | undefined>();
      const isItemHighlightedRef = useRef<boolean>(false);

      const prevNodesRef = useRef<GraphNode[]>(nodesWithoutPosition);
      const prevEdgesRef = useRef<GraphEdge[]>(edges);
      const prevCombosRef = useRef<GraphCombo[] | undefined>(combos);
      const topologyGraphRef = useRef<Graph>();

      //exported methods
      useImperativeHandle(ref, () => ({
        // Tsave the nodes positions in the local storage
        saveNodePositions() {
          const graphInstance = topologyGraphRef.current;

          if (!graphInstance?.getNodes()) {
            return;
          }

          const updatedNodes = GraphController.fromNodesToLocalStorageData(
            graphInstance.getNodes(),
            ({ id, x, y }: LocalStorageData) => ({ id, x, y })
          );

          GraphController.saveAllNodePositions(updatedNodes);
        }
      }));

      // UTILS
      const activateNodeRelations = useCallback(
        ({ currentTarget, item, state }: { currentTarget: Graph; item: Item; state: string }) => {
          isItemHighlightedRef.current = true;

          const node = item as INode;
          const neighbors = node.getNeighbors();
          const neighborsIds = neighbors.map((neighbor) => neighbor.getID());

          currentTarget.getNodes().forEach((n: INode) => {
            currentTarget.clearItemStates(n, state);

            if (node.getID() !== n.getID() && !neighborsIds.includes(n.getID())) {
              currentTarget.setItemState(n, 'hidden', true);
              n.toBack();
            } else {
              currentTarget.clearItemStates(n, 'hidden');
              n.toFront();
            }
          });

          currentTarget.getEdges().forEach((edge: IEdge) => {
            if (node.getID() !== edge.getSource().getID() && node.getID() !== edge.getTarget().getID()) {
              edge.hide();
            } else {
              edge.show();
            }
          });
        },
        []
      );

      const activateEdgeRelations = useCallback(({ currentTarget, item }: { currentTarget: Graph; item: Item }) => {
        const edge = item as IEdge;
        const source = edge.getSource();
        const target = edge.getTarget();

        if (!itemSelectedRef.current) {
          currentTarget.getNodes().forEach((node) => {
            if (node.getID() !== source.getID() && node.getID() !== target.getID()) {
              currentTarget.setItemState(node, 'hidden', true);
            } else {
              currentTarget.clearItemStates(node, 'hidden');
            }
          });

          currentTarget.getEdges().forEach((topologyEdge) => {
            if (edge.getID() !== topologyEdge.getID()) {
              topologyEdge.hide();
            } else {
              topologyEdge.show();
            }
          });
        }
      }, []);

      const cleanAllRelations = useCallback(({ currentTarget }: { currentTarget: Graph }) => {
        // when we back from an other view and we leave a node we must erase links status
        currentTarget.getEdges().forEach((edge) => {
          edge.show();
          currentTarget.clearItemStates(edge, 'hover');
        });

        currentTarget.findAllByState('node', 'selected-default').forEach((node) => {
          currentTarget.clearItemStates(node, 'selected-default');
        });

        currentTarget.findAllByState('node', 'hover').forEach((node) => {
          currentTarget.clearItemStates(node, 'hover');
        });

        currentTarget.findAllByState('node', 'hidden').forEach((node) => {
          currentTarget.clearItemStates(node, 'hidden');
        });
      }, []);

      // SELECT EVENTS
      const handleNodeSelected = useCallback(
        ({ currentTarget, item }: { currentTarget: Graph; item: Item }) => {
          isItemHighlightedRef.current = true;
          activateNodeRelations({ currentTarget, item, state: 'selected-default' });

          currentTarget.setItemState(item, 'selected-default', true);
        },
        [activateNodeRelations]
      );

      const handleEdgeSelected = useCallback(
        ({ currentTarget, item }: { currentTarget: Graph; item: Item }) => {
          isItemHighlightedRef.current = true;
          activateEdgeRelations({ currentTarget, item });

          currentTarget.setItemState(item, 'hover', true);
        },
        [activateEdgeRelations]
      );

      /** Simulate a Select event, regardless of whether a node or edge is preselected */
      const handleItemSelected = useCallback(
        (id?: string) => {
          isItemHighlightedRef.current = true;

          const graphInstance = topologyGraphRef.current;
          if (graphInstance && id) {
            const item = graphInstance.findById(id);

            if (item) {
              if (item.get('type') === 'node') {
                handleNodeSelected({ currentTarget: graphInstance, item });
              }

              if (item.get('type') === 'edge') {
                handleEdgeSelected({ currentTarget: graphInstance, item });
              }
            }
          }

          // handleNodeMouseEnter and handleEdgeMouseEnter set hoverState to true and block any update when we changeData in the useState
          isItemHighlightedRef.current = false;
        },
        [handleEdgeSelected, handleNodeSelected]
      );

      // MOUSE EVENTS
      const handleNodeMouseEnter = useCallback(
        ({ currentTarget, item }: { currentTarget: Graph; item: Item }) => {
          isItemHighlightedRef.current = true;
          activateNodeRelations({ currentTarget, item, state: 'hover' });

          currentTarget.setItemState(item, 'hover', true);

          // keep the selected state when we hover a node
          const nodeSelected = currentTarget.findAllByState('node', 'selected-default')[0] as INode;
          if (nodeSelected) {
            currentTarget.setItemState(nodeSelected, 'selected-default', true);
          }
        },
        [activateNodeRelations]
      );

      const handleEdgeMouseEnter = useCallback(
        ({ currentTarget, item }: { currentTarget: Graph; item: Item }) => {
          isItemHighlightedRef.current = true;
          activateEdgeRelations({ currentTarget, item });

          currentTarget.setItemState(item, 'hover', true);
        },
        [activateEdgeRelations]
      );

      const handleComboMouseEnter = useCallback(({ currentTarget, item }: { currentTarget: Graph; item?: Item }) => {
        if (item) {
          currentTarget.setItemState(item, 'hover', true);
        }
      }, []);

      const handleNodeMouseLeave = useCallback(
        ({ currentTarget }: { currentTarget: Graph; item?: Item }) => {
          // when we back from an other view and we leave a node we must erase links status
          cleanAllRelations({ currentTarget });

          isItemHighlightedRef.current = false;
        },
        [cleanAllRelations]
      );

      const handleEdgeMouseLeave = useCallback(
        ({ currentTarget }: { currentTarget: Graph; item?: Item }) => {
          cleanAllRelations({ currentTarget });
          isItemHighlightedRef.current = false;
        },
        [cleanAllRelations]
      );

      const handleComboMouseLeave = useCallback(({ currentTarget, item }: { currentTarget: Graph; item?: Item }) => {
        if (item) {
          currentTarget.clearItemStates(item, 'hover');
          isItemHighlightedRef.current = false;
        }
      }, []);

      // CLiCK EVENTS
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

      // DRAG EVENTS
      const handleNodeDragStart = useCallback(() => {
        isItemHighlightedRef.current = true;
      }, []);

      const handleNodeDragEnd = useCallback(() => {
        isItemHighlightedRef.current = false;
      }, []);

      const handleCombDragStart = useCallback(() => {
        isItemHighlightedRef.current = true;
      }, []);

      const handleComboDragEnd = useCallback(() => {
        isItemHighlightedRef.current = false;
      }, []);

      // CANVAS EVENTS
      const handleCanvasDragStart = useCallback(() => {
        isItemHighlightedRef.current = true;
      }, []);

      const handleCanvasDragEnd = useCallback(() => {
        isItemHighlightedRef.current = false;
      }, []);

      // TIMING EVENTS
      const handleAfterChangeData = useCallback(() => {
        if (itemSelectedRef.current) {
          // style are reset when we changeData, so we need to reapply the hover style
          handleItemSelected(itemSelectedRef.current);
        }
      }, [handleItemSelected]);

      const handleAfterRender = useCallback(() => {
        if (itemSelectedRef.current) {
          handleItemSelected(itemSelectedRef.current);
        }

        setIsGraphLoaded(true);
      }, [handleItemSelected]);

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

        topologyGraphRef.current?.on('afterchangedata', handleAfterChangeData);

        // Be carefull: afterender is supposd to be calleed every re-render. However, in our case this event is called just one time  because we update the topology usng changeData.
        // If this behaviour changes we must use a flag to check only the first render
        topologyGraphRef.current?.on('afterrender', handleAfterRender);
      }, [
        handleNodeClick,
        handleNodeDragStart,
        handleNodeDragEnd,
        handleNodeMouseEnter,
        handleEdgeClick,
        handleEdgeMouseEnter,
        handleEdgeMouseLeave,
        handleComboClick,
        handleCombDragStart,
        handleComboDragEnd,
        handleCanvasDragStart,
        handleCanvasDragEnd,
        handleAfterChangeData,
        handleAfterRender,
        handleNodeMouseLeave,
        handleComboMouseEnter,
        handleComboMouseLeave
      ]);

      /** Creates network topology instance */
      const graphRef = useCallback(($node: HTMLDivElement) => {
        if (nodesWithoutPosition && !topologyGraphRef.current) {
          registerNodeWithBadges();
          registerDefaultEdgeWithHover();
          registerSiteLinkEdge();
          regusterComboWithCustomLabel();

          const nodes = GraphController.addPositionsToNodes(nodesWithoutPosition);
          const data = GraphController.getG6Model({ edges, nodes, combos });
          const [width, height] = [$node.clientWidth, $node.clientHeight];

          const options: GraphOptions = {
            container: $node,
            width,
            height,
            layout: {
              ...layout,
              center: [width / 2, height / 2],
              maxIteration: GraphController.calculateMaxIteration(nodes.length)
            },
            ...DEFAULT_GRAPH_CONFIG
          };

          topologyGraphRef.current = new G6.Graph(options);
          topologyGraphRef.current.setMode(
            GraphController.getModeBasedOnPerformanceThreshold(nodesWithoutPosition.length)
          );

          topologyGraphRef.current.read(data);
          bindEvents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      // This effect updates the topology when there are changes to the nodes, edges or combos.
      // Disabled if itemSelected is true, because it means that the user has selected a node or edge.
      useEffect(() => {
        const graphInstance = topologyGraphRef.current;

        if (!graphInstance || isItemHighlightedRef.current || !isGraphLoaded) {
          return;
        }

        if (
          JSON.stringify(prevNodesRef.current) === JSON.stringify(nodesWithoutPosition) &&
          JSON.stringify(prevEdgesRef.current) === JSON.stringify(edges)
        ) {
          return;
        }

        const newNodes = GraphController.addPositionsToNodes(nodesWithoutPosition, graphInstance.getNodes());

        // the performance mode contains optimizations for large graphs
        graphInstance.setMode(GraphController.getModeBasedOnPerformanceThreshold(newNodes.length));
        graphInstance.changeData(GraphController.getG6Model({ edges, nodes: newNodes, combos }));

        // if the topology changes nodes, then reposition them
        const newNodesIds = newNodes.map((node) => node.id).join(',');
        const prevNodeIds = prevNodesRef.current.map((node) => node.id).join(',');
        if (newNodesIds !== prevNodeIds) {
          GraphController.cleanAllLocalNodePositions(graphInstance.getNodes());
          graphInstance.render();
        }

        // updated the prev values with the new ones
        prevNodesRef.current = newNodes;
        prevEdgesRef.current = edges;
        prevCombosRef.current = combos;
      }, [nodesWithoutPosition, edges, combos, isGraphLoaded]);

      useEffect(() => {
        const graphInstance = topologyGraphRef.current;
        if (!graphInstance || !isGraphLoaded || !itemSelected || !moveToSelectedNode) {
          return;
        }

        const node = graphInstance.findById(itemSelected);
        if (node) {
          graphInstance.focusItem(node);
        }
      }, [itemSelected, moveToSelectedNode, isGraphLoaded]);

      useInsertionEffect(() => {
        const graphInstance = topologyGraphRef.current;
        itemSelectedRef.current = itemSelected;

        if (!graphInstance || !isGraphLoaded) {
          return;
        }

        if (!itemSelected) {
          cleanAllRelations({ currentTarget: graphInstance });

          return;
        }

        handleItemSelected(itemSelected);
      }, [handleItemSelected, cleanAllRelations, itemSelected, isGraphLoaded]);
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

        const debouncedHandleResize = debounce(handleResize, 200);
        window.addEventListener('resize', debouncedHandleResize);

        return () => {
          window.removeEventListener('resize', debouncedHandleResize);
        };
      }, []);

      return (
        <div ref={graphRef} style={{ height: '99%', background: GRAPH_BG_COLOR, position: 'relative' }}>
          {topologyGraphRef.current && <MenuControl graphInstance={topologyGraphRef.current} />}
          {!isGraphLoaded && <LoadingPage isFLoating={true} />}
        </div>
      );
    }
  )
);

export default GraphReactAdaptor;
