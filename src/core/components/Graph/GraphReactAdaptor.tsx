import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';

import G6, { Graph, ICombo, IEdge, INode, NodeConfig } from '@antv/g6';

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
  DEFAULT_LAYOUT_COMBO_FORCE_CONFIG,
  DEFAULT_LAYOUT_FORCE_CONFIG,
  DEFAULT_LAYOUT_GFORCE_CONFIG,
  DEFAULT_MODE,
  DEFAULT_NODE_CONFIG,
  DEFAULT_NODE_STATE_CONFIG
} from './config';
import { registerCustomBehaviours } from './customBehaviours';
import GraphMenuControl from './GraphMenuControl';
import { GraphController } from './services';

const GraphReactAdaptor: FC<GraphReactAdaptorProps> = memo(
  ({ nodes, edges, combos, onClickEdge, onClickNode, onClickCombo, itemSelected }) => {
    const [isGraphLoaded, setIsGraphLoaded] = useState(false);

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

    // Creates topology
    const graphRef = useCallback(
      ($node: HTMLDivElement | null) => {
        if ($node && nodes.length && !topologyGraphRef.current) {
          const topologyGraph = new G6.Graph({
            container: $node,
            width: $node.scrollWidth,
            height: $node.scrollHeight,

            modes: DEFAULT_MODE,
            layout: {
              pipes: [
                //  If  nodes already have positions,load the 'force' layout without a simulation to visually arrange them in a graph.
                {
                  type: 'force',
                  alpha: 0,
                  nodesFilter: ({ x, y }: GraphNode) => !!(x && y)
                },
                {
                  ...DEFAULT_LAYOUT_COMBO_FORCE_CONFIG,
                  center: [$node.scrollWidth / 2, $node.scrollHeight / 2],
                  maxIteration: GraphController.calculateMaxIteration(nodes.length),
                  nodesFilter: ({ x, y, comboId }: GraphNode) => !!(!x || !y) && comboId
                },
                {
                  ...DEFAULT_LAYOUT_FORCE_CONFIG,
                  center: [$node.scrollWidth / 2, $node.scrollHeight / 2],
                  nodesFilter: ({ x, y, comboId }: GraphNode) => !!(!x || !y) && !comboId && nodes.length < 250
                },
                {
                  ...DEFAULT_LAYOUT_GFORCE_CONFIG,
                  center: [$node.scrollWidth / 2, $node.scrollHeight / 2],
                  nodesFilter: ({ x, y, comboId }: GraphNode) => !!(!x || !y) && !comboId && nodes.length >= 250
                }
              ]
            },

            defaultNode: DEFAULT_NODE_CONFIG,
            defaultCombo: DEFAULT_COMBO_CONFIG,
            defaultEdge: DEFAULT_EDGE_CONFIG,
            nodeStateStyles: DEFAULT_NODE_STATE_CONFIG
          });

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

              const { id, x, y } = item.getModel() as NodeConfig;
              GraphController.saveDataInLocalStorage([{ id, x, y }]);
            }
          });

          topologyGraph.on('node:mouseenter', ({ item }) => {
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
              });
              node.getNeighbors().forEach((neighbor) => {
                topologyGraph.setItemState(neighbor, 'hover', true);
              });
            }
          });

          topologyGraph.on('node:mouseleave', ({ item }) => {
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
            const edge = item as IEdge | null;

            if (edge) {
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
                const { nodes: comboNodes } = topologyGraph.getComboChildren(combo);

                comboNodes.forEach((comboNode) => {
                  const { id, x, y } = comboNode.getModel() as NodeConfig;
                  GraphController.saveDataInLocalStorage([{ id, x, y }]);
                });
              }
            });
          }

          topologyGraph.on('afterlayout', () => {
            topologyGraphRef.current = topologyGraph;
            prevNodesRef.current = nodes;
            prevEdgesRef.current = edges;
            setIsGraphLoaded(true);
          });

          registerCustomBehaviours();

          topologyGraph.data(GraphController.getG6Model({ edges, nodes, combos }));
          topologyGraph.render();
        }
      },
      [nodes, combos, edges, handleOnClickNode, handleOnClickEdge, handleOnClickCombo]
    );

    // This effect persist the  coordinates for each element of topology after the first simulation.
    useEffect(() => {
      const graphInstance = topologyGraphRef.current;

      if (isGraphLoaded && graphInstance) {
        const updateNodes = graphInstance
          .getNodes()
          .map((node) => {
            const model = node.getModel();

            if (model.id) {
              return {
                id: model.id,
                x: model.x,
                y: model.y
              };
            }

            return undefined;
          })
          .filter(Boolean) as LocalStorageData[];

        GraphController.saveDataInLocalStorage(updateNodes);
      }
    }, [isGraphLoaded]);

    // This effect updates the topology graph instance when there are changes to the nodes, edges or groups.
    useEffect(() => {
      const graphInstance = topologyGraphRef.current;

      if (
        isGraphLoaded &&
        graphInstance &&
        (JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes) ||
          JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges))
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
          graphInstance.setItemState(item, 'hover', true);

          if (item.get('type') === 'node') {
            const node = item as INode;

            // Update the style of edges connected to this node
            node.getEdges().forEach((edgeConnected) => {
              graphInstance.setItemState(edgeConnected, 'hover', true);
            });

            // Update the style of neighboring nodes
            node.getNeighbors().forEach((neighbor) => {
              graphInstance.setItemState(neighbor, 'hover', true);
            });
          }

          if (item.get('type') === 'edge') {
            const edge = item as IEdge;

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
        <TransitionPage>
          <div ref={graphRef} style={{ width: '100%', height: '100%' }} />
        </TransitionPage>

        {topologyGraphRef.current && <GraphMenuControl graphInstance={topologyGraphRef.current} />}
      </div>
    );
  }
);

export default GraphReactAdaptor;
