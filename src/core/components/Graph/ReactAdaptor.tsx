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
import LoadingPage from '@pages/shared/Loading';

import {
  DEFAULT_GRAPH_CONFIG,
  LAYOUT_TOPOLOGY_DEFAULT,
  GRAPH_BG_COLOR,
  LAYOUT_TOPOLOGY_SINGLE_NODE
} from './Graph.constants';
import MenuControl, { ZOOM_CONFIG } from './MenuControl';
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
    ({ nodes: nodesWithoutPosition, edges, combos, onClickEdge, onClickNode, onClickCombo, itemSelected }, ref) => {
      const [isGraphLoaded, setIsGraphLoaded] = useState(false);
      const isHoverState = useRef<boolean>(false);
      const prevNodesRef = useRef<GraphNode[]>(nodesWithoutPosition);
      const prevEdgesRef = useRef<GraphEdge[]>(edges);
      const prevCombosRef = useRef<GraphCombo[] | undefined>(combos);
      const itemSelectedRef = useRef<string | undefined>();
      const topologyGraphRef = useRef<Graph>();

      useImperativeHandle(ref, () => ({
        saveNodePositions() {
          savePositions();
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

        if (!itemSelectedRef.current) {
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
        }

        currentTarget.setItemState(edge, 'hover', true);
      }, []);

      /** Simulate a MouseEnter event, regardless of whether a node or edge is preselected */
      const handleItemMouseEnter = useCallback(
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
          // when we back from an other view and we leave a node we must erase links status
          currentTarget.getEdges().forEach((edge) => {
            edge.show();
            currentTarget.setItemState(edge, 'hover', false);
          });

          if (!itemSelectedRef.current) {
            currentTarget.findAllByState('node', 'hover').forEach((node) => {
              currentTarget.setItemState(node, 'hover', false);
            });

            currentTarget.findAllByState('node', 'hidden').forEach((node) => {
              currentTarget.setItemState(node, 'hidden', false);
            });

            // we need to remove the combo highlight if we leave the node label outside the combo boc
            const comboId = item?.getModel()?.comboId as string | undefined;
            if (comboId) {
              handleComboMouseLeave({ currentTarget, item: currentTarget.findById(comboId) });
            }

            itemSelectedRef.current = undefined;
          }

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

      // TIMING EVENTS
      const handleAfterChangeData = useCallback(() => {
        if (itemSelectedRef.current) {
          // style are reset when we changeData, so we need to reapply the hover style
          handleItemMouseEnter(itemSelectedRef.current);
        }
      }, [handleItemMouseEnter]);

      const handleAfterRender = useCallback(() => {
        handleItemMouseEnter(itemSelectedRef.current);
        setIsGraphLoaded(true);
      }, [handleItemMouseEnter]);

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
        topologyGraphRef.current?.on('edge:mouseenter', handleEdgeMouseEnter);
        topologyGraphRef.current?.on('edge:mouseleave', handleEdgeMouseLeave);

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
        handleAfterChangeData,
        handleAfterRender
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
              ...LAYOUT_TOPOLOGY_DEFAULT,
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
      // or
      // This effect handles the selection of a node or edge when the user clicks on a node or edge in the topology or when the user interacts with filters.
      // Enabled only if itemSelected is true, because it means that the user has selected a node or edge.
      useEffect(() => {
        const graphInstance = topologyGraphRef.current;

        if (!graphInstance || isHoverState.current || !isGraphLoaded) {
          return;
        }

        if (
          itemSelected ||
          (!itemSelected && JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodesWithoutPosition)) ||
          JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges)
        ) {
          let filteredNodes = nodesWithoutPosition;
          let filteredEdges = edges;
          let filteredCombos = combos;
          let layoutSelected = LAYOUT_TOPOLOGY_DEFAULT;

          // Save positions when transitioning from the "global topology view" to the "find a single process view."
          // This  prevent overwriting old positions when I back from the "find process view" to the "global topology view".
          if (!itemSelectedRef.current && itemSelected) {
            savePositions();
          }

          if (itemSelected) {
            filteredEdges = edges.filter((edge) => edge.source === itemSelected || edge.target === itemSelected);

            const idsFromService = filteredEdges.flatMap(({ source, target }) => [source, target]);
            filteredNodes = filteredNodes.filter(({ id }) => idsFromService.includes(id));
            filteredCombos = [];

            layoutSelected = LAYOUT_TOPOLOGY_SINGLE_NODE;
          } else if (!itemSelected) {
            // add positions to new  nodes fom the last node positions in the graph or the local storage
            // if the curent item is not selected but the last one was selected we need to get the positions from the local storage
            // This is the use case when I return from the "find process view". See useEffect below.
            filteredNodes = GraphController.addPositionsToNodes(
              filteredNodes,
              !itemSelectedRef.current ? graphInstance.getNodes() : undefined
            );
          }

          // set the ref before triggering afterChangeDataEvent because we control the update of the graph with the itemSelectedRef
          itemSelectedRef.current = itemSelected;

          // Rollback to the default layout in case it was changed before when an item was selected
          const layout = {
            ...layoutSelected,
            maxIteration: GraphController.calculateMaxIteration(filteredNodes.length)
          };

          graphInstance.updateLayout(layout);
          // the performance mode contains optimizations for large graphs
          graphInstance.setMode(GraphController.getModeBasedOnPerformanceThreshold(filteredNodes.length));
          graphInstance.changeData(
            GraphController.getG6Model({ edges: filteredEdges, nodes: filteredNodes, combos: filteredCombos })
          );

          if (itemSelected || JSON.stringify(prevNodesRef.current) !== JSON.stringify(filteredNodes)) {
            // make a better positioning of the nodes
            GraphController.cleanAllLocalNodePositions(graphInstance.getNodes());
            // after updating the graph with new nodes, we need to fit the view
            setTimeout(
              () =>
                graphInstance.fitView(
                  20,
                  undefined,
                  !GraphController.isPerformanceThresholdExceeded(filteredNodes.length),
                  ZOOM_CONFIG
                ),
              0
            );
          }

          // updated the prev values with the new ones
          prevNodesRef.current = filteredNodes;
          prevEdgesRef.current = filteredEdges;
          prevCombosRef.current = filteredCombos;
        }
      }, [nodesWithoutPosition, edges, combos, isGraphLoaded, itemSelected, handleNodeMouseLeave, savePositions]);

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
