import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';

import G6, { Graph, ICombo, IEdge, INode } from '@antv/g6';

import {
  GraphEdge,
  GraphCombo,
  GraphNode,
  GraphReactAdaptorProps,
  LocalStorageData
} from '@core/components/Graph/Graph.interfaces';
import TransitionPage from '@core/components/TransitionPages/Slide';

import {
  DEFAULT_COMBO_CONFIG,
  DEFAULT_EDGE_CONFIG,
  DEFAULT_MODE,
  DEFAULT_NODE_CONFIG,
  DEFAULT_NODE_STATE_CONFIG
} from './config';
import { createLegend, registerCustomBehaviours } from './customBehaviours';
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
    legendData,
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

    // Creates topology
    const graphRef = useCallback(
      ($node: HTMLDivElement | null) => {
        if ($node && nodes.length && !topologyGraphRef.current) {
          const data = GraphController.getG6Model({ edges, nodes, combos });
          const legend = legendData ? createLegend(legendData) : '';

          const width = $node.scrollWidth;
          const height = $node.scrollHeight;

          topologyGraphRef.current = new G6.Graph({
            container: $node,
            width,
            height,
            fitCenter: config?.fitCenter || false,
            plugins: [legend],
            modes: DEFAULT_MODE,
            layout: {
              ...layout,
              center: [Math.floor(width / 2), Math.floor(height / 2)]
            },
            defaultNode: DEFAULT_NODE_CONFIG,
            defaultCombo: DEFAULT_COMBO_CONFIG,
            defaultEdge: DEFAULT_EDGE_CONFIG,
            nodeStateStyles: DEFAULT_NODE_STATE_CONFIG
          });
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
              // To ensure that only one node is selected at a time, we need to clean up any previously selected nodes.
              //This situation can arise when we automatically select an element from another pager through nodeSelect.
              topologyGraph.findAllByState<INode>('node', 'hover').forEach((nodeWithHoverState) => {
                topologyGraph.setItemState(nodeWithHoverState, 'hover', false);

                nodeWithHoverState.getEdges().forEach((edgeConnectedWithHoverState) => {
                  topologyGraph.setItemState(edgeConnectedWithHoverState, 'hover', false);
                });
              });

              topologyGraph.setItemState(node, 'hover', true);

              node.getEdges().forEach((edgeConnected) => {
                topologyGraph.setItemState(edgeConnected, 'hover', true);
                edgeConnected.show();
              });

              node.getNeighbors().forEach((neighbor) => {
                topologyGraph.setItemState(neighbor, 'hover', true);
              });
            }
          });

          topologyGraph.on('node:mouseleave', ({ item }) => {
            isHoverState.current = false;

            topologyGraph.getEdges().forEach(function (edge) {
              edge.show();
            });

            const node = item as INode | null;

            if (node) {
              topologyGraph.setItemState(node, 'hover', false);

              node.getEdges().forEach((edgeConnected) => {
                topologyGraph.setItemState(edgeConnected, 'hover', false);
              });

              node.getNeighbors().forEach((neighbor) => {
                topologyGraph.setItemState(neighbor, 'hover', false);
              });
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

              topologyGraph.setItemState(source, 'hover', true);
              topologyGraph.setItemState(target, 'hover', true);

              // To ensure that only one node is selected at a time, we need to clean up any previously selected nodes.
              //This situation can arise when we automatically select an element from another pager through nodeSelect.
              topologyGraph.findAllByState<INode>('node', 'hover').forEach((nodeWithHoverState) => {
                if (nodeWithHoverState !== source && nodeWithHoverState !== target) {
                  topologyGraph.setItemState(nodeWithHoverState, 'hover', false);

                  nodeWithHoverState.getEdges().forEach((edgeConnectedWithHoverState) => {
                    topologyGraph.setItemState(edgeConnectedWithHoverState, 'hover', false);
                  });
                }
              });
            }
          });

          topologyGraph.on('edge:mouseleave', ({ item }) => {
            isHoverState.current = false;

            topologyGraph.getEdges().forEach(function (edge) {
              edge.show();
            });

            const edge = item as IEdge | null;

            if (edge) {
              topologyGraph.setItemState(edge, 'hover', false);

              const source = edge.getSource();
              const target = edge.getTarget();

              topologyGraph.setItemState(source, 'hover', false);
              topologyGraph.setItemState(target, 'hover', false);
            }
          });

          if (combos?.length) {
            topologyGraph.on('combo:click', ({ item }) => {
              if (item) {
                handleOnClickCombo(item.getModel() as GraphCombo);
              }
            });

            topologyGraph.on('combo:dragstart', ({ item }) => {
              if (item) {
                topologyGraph.updateItem(item, { style: { cursor: 'grab' } });
              }
            });

            topologyGraph.on('combo:dragend', ({ item }) => {
              if (item) {
                const combo = item as ICombo;
                topologyGraph.updateItem(combo, { style: { cursor: 'pointer' } });

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

          topologyGraph.on('afterlayout', () => {
            prevNodesRef.current = nodes;
            prevEdgesRef.current = edges;
            prevCombosRef.current = combos;
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
            topologyGraph.fitView(5, undefined, true, { duration: 0 });
          }
        }
      },
      [
        nodes,
        legendData,
        layout,
        combos,
        edges,
        config?.zoom,
        config?.fitScreen,
        config?.fitCenter,
        handleOnClickNode,
        handleOnClickEdge,
        handleOnClickCombo,
        onGetZoom
      ]
    );

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
        graphInstance.changeData(GraphController.getG6Model({ edges, nodes, combos }));

        prevNodesRef.current = nodes;
        prevEdgesRef.current = edges;

        if (combos) {
          prevCombosRef.current = combos;
        }
      }
    }, [nodes, edges, combos, isGraphLoaded]);

    // This effect handle the initial  UI status when an element is selected from an other page
    // it can be a node or edge
    useEffect(() => {
      const graphInstance = topologyGraphRef.current;

      if (isGraphLoaded && graphInstance && itemSelected) {
        const item = graphInstance.findById(itemSelected);

        if (item) {
          graphInstance.getEdges().forEach(function (edge) {
            edge.hide();
          });

          graphInstance.setItemState(item, 'hover', true);

          if (item.get('type') === 'node') {
            const node = item as INode;

            // Update the style of edges connected to this node
            node.getEdges().forEach((edgeConnected) => {
              edgeConnected.show();
              graphInstance.setItemState(edgeConnected, 'hover', true);
            });

            // Update the style of neighboring nodes
            node.getNeighbors().forEach((neighbor) => {
              graphInstance.setItemState(neighbor, 'hover', true);
            });
          }

          if (item.get('type') === 'edge') {
            const edge = item as IEdge;
            edge.show();

            const source = edge.getSource();
            const target = edge.getTarget();

            graphInstance.setItemState(source, 'hover', true);
            graphInstance.setItemState(target, 'hover', true);
          }
        }
      }
    }, [itemSelected, isGraphLoaded]);

    return (
      <div style={{ height: '100%', position: 'relative' }}>
        {topologyGraphRef.current && (
          <GraphMenuControl
            graphInstance={topologyGraphRef.current}
            onGetZoom={handleGetZoom}
            onFitScreen={handleFitScreen}
          />
        )}

        <TransitionPage>
          <div ref={graphRef} style={{ width: '100%', height: '100%' }} />
        </TransitionPage>
      </div>
    );
  }
);

export default GraphReactAdaptor;
