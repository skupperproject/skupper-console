import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';

import G6, { Graph, GraphOptions, ICombo, IEdge, INode } from '@antv/g6';
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
  DEFAULT_LAYOUT_FORCE_CONFIG,
  DEFAULT_MODE,
  DEFAULT_NODE_CONFIG,
  DEFAULT_NODE_STATE_CONFIG
} from './config';
import { registerCustomBehaviours } from './customBehaviours';
import GraphMenuControl from './GraphMenuControl';
import { GraphController } from './services';

const GraphReactAdaptor: FC<GraphReactAdaptorProps> = memo(
  ({
    nodes,
    edges,
    combos,
    onClickEdge,
    onClickNode,
    onClickCombo,
    itemSelected,
    onGetZoom,
    onFitScreen,
    layout,
    config
  }) => {
    const [isGraphLoaded, setIsGraphLoaded] = useState(false);

    const isHoverState = useRef<boolean>(false);
    const prevNodesRef = useRef<GraphNode[]>();
    const prevEdgesRef = useRef<GraphEdge[]>();
    const prevCombosRef = useRef<GraphCombo[]>();
    const topologyGraphRef = useRef<Graph>();

    const handleOnClickNode = useCallback(
      (data: GraphNode) => {
        if (onClickNode) {
          onClickNode(data);
        }
      },
      [onClickNode]
    );

    const handleOnClickEdge = useCallback(
      (data: GraphEdge) => {
        if (onClickEdge) {
          onClickEdge(data);
        }
      },
      [onClickEdge]
    );

    const handleOnClickCombo = useCallback(
      (data: GraphCombo) => {
        if (onClickCombo) {
          onClickCombo(data);
        }
      },
      [onClickCombo]
    );

    const handleGetZoom = useCallback(
      (zoomValue: number) => {
        if (onGetZoom) {
          onGetZoom(zoomValue);
        }
      },
      [onGetZoom]
    );

    const handleFitScreen = useCallback(
      (flag: boolean) => {
        if (onFitScreen) {
          onFitScreen(flag);
        }
      },
      [onFitScreen]
    );

    // Creates network topology
    const graphRef = useCallback(($node: HTMLDivElement) => {
      if (nodes.length && !topologyGraphRef.current) {
        const data = GraphController.getG6Model({ edges, nodes, combos });

        const width = $node.scrollWidth;
        const height = $node.scrollHeight;

        const options: GraphOptions = {
          container: $node,
          width,
          height,
          fitCenter: config?.fitCenter || false,
          plugins: [],
          modes: DEFAULT_MODE,
          defaultNode: DEFAULT_NODE_CONFIG,
          defaultCombo: DEFAULT_COMBO_CONFIG,
          defaultEdge: DEFAULT_EDGE_CONFIG,
          nodeStateStyles: DEFAULT_NODE_STATE_CONFIG,
          comboStateStyles: DEFAULT_COMBO_STATE_CONFIG
        };

        if (layout) {
          options.layout = {
            ...layout,
            center: [width / 2, height / 2]
          };
        }

        topologyGraphRef.current = new G6.Graph(options);
        const topologyGraph = topologyGraphRef.current;

        topologyGraph.on('node:click', ({ item }) => {
          if (item) {
            const node = item.getModel() as GraphNode;
            handleOnClickNode(node);
          }
        });

        topologyGraph.on('edge:click', ({ item }) => {
          if (item) {
            const edge = item.getModel() as GraphEdge;
            handleOnClickEdge(edge);
          }
        });

        topologyGraph.on('node:dragstart', ({ item }) => {
          const nodeItem = item;
          if (nodeItem) {
            topologyGraph.updateItem(nodeItem, { style: { cursor: 'grab' } });
          }
        });

        topologyGraph.on('node:dragend', ({ item }) => {
          if (item) {
            topologyGraph.updateItem(item, { style: { cursor: 'pointer' } });

            const updatedNodes = GraphController.fromNodesToLocalStorageData(
              [item as INode],
              ({ id, x, y }: LocalStorageData) => ({
                id,
                x,
                y
              })
            );

            GraphController.saveDataInLocalStorage(updatedNodes);
          }
        });

        topologyGraph.on('node:mouseenter', ({ item }) => {
          isHoverState.current = true;

          topologyGraph.getEdges().forEach(function (edge) {
            edge.hide();
          });

          const node = item as INode | null;

          if (node) {
            const neighbors = node.getNeighbors();
            const neighborsIds = neighbors.map((neighbor) => neighbor.getID());

            topologyGraph.getNodes().forEach(function (n) {
              if (node?.getID() !== n.getID() && !neighborsIds.includes(n.getID())) {
                topologyGraph.setItemState(n, 'hidden', true);
                n.toBack();
              }
            });

            topologyGraph.setItemState(node, 'hidden', false);

            node.getEdges().forEach((edgeConnected) => {
              edgeConnected.show();
            });
          }
        });

        topologyGraph.on('node:mouseleave', ({ item }) => {
          isHoverState.current = false;

          topologyGraph.findAllByState<INode>('node', 'hidden').forEach(function (node) {
            topologyGraph.setItemState(node, 'hidden', false);
          });

          topologyGraph.getEdges().forEach(function (edge) {
            edge.show();
          });

          const node = item as INode | null;

          if (node) {
            topologyGraph.setItemState(node, 'hover', false);
          }
        });

        topologyGraph.on('edge:mouseenter', ({ item }) => {
          isHoverState.current = true;

          topologyGraph.getEdges().forEach(function (edge) {
            edge.hide();
          });

          const edge = item as IEdge | null;

          if (edge) {
            edge.show();
            topologyGraph.setItemState(edge, 'hover', true);

            const source = edge.getSource();
            const target = edge.getTarget();

            topologyGraph.getNodes().forEach(function (node) {
              if (node !== source && node !== target) {
                topologyGraph.setItemState(node, 'hidden', true);
              }
            });
          }
        });

        topologyGraph.on('edge:mouseleave', ({ item }) => {
          isHoverState.current = false;

          topologyGraph.getEdges().forEach(function (edge) {
            edge.show();
          });

          topologyGraph.findAllByState<INode>('node', 'hidden').forEach(function (node) {
            topologyGraph.setItemState(node, 'hidden', false);
          });

          const edge = item as IEdge | null;

          if (edge) {
            topologyGraph.setItemState(edge, 'hover', false);
          }
        });

        if (combos?.length) {
          topologyGraph.on('combo:click', ({ item }) => {
            if (item) {
              handleOnClickCombo(item.getModel() as GraphCombo);
            }
          });

          // topologyGraph.on('combo:mouseenter', ({ item }) => {
          //   if (item) {
          //     topologyGraph.setItemState(item, 'hover', true);
          //   }
          // });

          // topologyGraph.on('combo:mouseleave', ({ item, ...rest }) => {
          //   if (item) {
          //     topologyGraph.setItemState(item, 'hover', false);
          //   }
          // });

          topologyGraph.on('combo:dragend', ({ item }) => {
            if (item) {
              const combo = item as ICombo;

              // Retrieve the nodes contained within the combo box and store their positions in memory
              const updatedNodes = GraphController.fromNodesToLocalStorageData(
                combo.getNodes(),
                ({ id, x, y }: LocalStorageData) => ({ id, x, y })
              );

              GraphController.saveDataInLocalStorage(updatedNodes);
            }
          });
        }

        topologyGraph.on('canvas:dragend', ({ dx, dy }: { dx?: number; dy?: number }) => {
          if (dx !== undefined && dy !== undefined) {
            const updatedNodes = GraphController.fromNodesToLocalStorageData(
              topologyGraph.getNodes(),
              ({ id, x, y }: LocalStorageData) => ({
                id,
                x: x + dx,
                y: y + dy
              })
            );

            GraphController.saveDataInLocalStorage(updatedNodes);
          }
        });

        topologyGraph.on('wheelzoom', () => {
          const zoomValue = topologyGraph.getZoom();

          if (onGetZoom) {
            onGetZoom(zoomValue);
          }
        });

        topologyGraph.on('afterrender', () => {
          prevNodesRef.current = nodes;
          prevEdgesRef.current = edges;
          prevCombosRef.current = combos;

          if (options.layout) {
            topologyGraph.destroyLayout();
          }

          setIsGraphLoaded(true);
        });

        registerCustomBehaviours();

        topologyGraph.data(data);
        topologyGraph.render();

        if (config?.zoom) {
          topologyGraph.zoomTo(Number(config?.zoom), topologyGraph.getGraphCenterPoint(), true, {
            duration: 0
          });
        }
        if (Number(config?.fitScreen)) {
          topologyGraph.fitView(50, undefined, true, { duration: 0 });
        }
      }
    }, []);

    const rollbackState = useCallback(() => {
      const graphInstance = topologyGraphRef.current;

      if (graphInstance && itemSelected) {
        const item = graphInstance.findById(itemSelected);

        graphInstance.getEdges().forEach(function (edge) {
          edge.hide();
        });

        if (item) {
          if (item.get('type') === 'node') {
            const node = item as INode;

            const neighbors = node.getNeighbors();
            const neighborsIds = neighbors.map((neighbor) => neighbor.getID());

            graphInstance.getNodes().forEach(function (n) {
              if (node?.getID() !== n.getID() && !neighborsIds.includes(n.getID())) {
                graphInstance.setItemState(n, 'hidden', true);
                n.toBack();
              }
            });

            graphInstance.setItemState(node, 'hidden', false);

            node.getEdges().forEach((edgeConnected) => {
              edgeConnected.show();
            });
          }

          if (item.get('type') === 'edge') {
            const edge = item as IEdge;
            edge.show();

            const source = edge.getSource();
            const target = edge.getTarget();

            graphInstance.setItemState(source, 'hidden', false);
            graphInstance.setItemState(target, 'hidden', false);
          }
        }
      }
    }, []);

    // This effect persist the  coordinates for each element of topology after the first simulation.
    useEffect(() => {
      const graphInstance = topologyGraphRef.current;

      if (isGraphLoaded && graphInstance) {
        const updatedNodes = GraphController.fromNodesToLocalStorageData(
          graphInstance.getNodes(),
          ({ id, x, y }: LocalStorageData) => ({ id, x, y })
        );

        GraphController.saveDataInLocalStorage(updatedNodes);
      }
    }, [isGraphLoaded]);

    // This effect updates the topology graph instance when there are changes to the nodes, edges or groups.
    useEffect(() => {
      const graphInstance = topologyGraphRef.current;

      if (
        !isHoverState.current &&
        isGraphLoaded &&
        graphInstance &&
        (JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes) ||
          JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges) ||
          JSON.stringify(prevCombosRef.current) !== JSON.stringify(combos))
      ) {
        graphInstance.updateLayout(DEFAULT_LAYOUT_FORCE_CONFIG);
        graphInstance.changeData(GraphController.getG6Model({ edges, nodes, combos }));

        prevNodesRef.current = nodes;
        prevEdgesRef.current = edges;

        if (combos) {
          prevCombosRef.current = combos;
        }

        rollbackState();
      }
    }, [nodes, edges, combos, isGraphLoaded, rollbackState, layout]);

    // This effect handle the initial  UI status when an element is selected from an other page
    // it can be a node or edge
    useEffect(() => {
      const graphInstance = topologyGraphRef.current;

      if (isGraphLoaded && graphInstance) {
        rollbackState();
      }
    }, [isGraphLoaded, rollbackState]);

    useEffect(() => {
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
          <GraphMenuControl
            graphInstance={topologyGraphRef.current}
            onGetZoom={handleGetZoom}
            onFitScreen={handleFitScreen}
          />
        )}
      </div>
    );
  }
);

export default GraphReactAdaptor;
