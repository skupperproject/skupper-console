import { FC, memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
    const prevNodesRef = useRef<GraphNode[]>();
    const prevEdgesRef = useRef<GraphEdge[]>();
    const prevCombosRef = useRef<GraphCombo[]>();
    const itemSelectedRef = useRef(itemSelected);
    const topologyGraphRef = useRef<Graph>();

    function insertPositionIntoNodes(nodes: GraphNode[]) {
      return nodes.map((node) => {
        const { x, y } = GraphController.getPositionFromLocalStorage(node.id);

        return { ...node, x, y };
      });
    }

    function rollbackTopologyStatus() {
      const graphInstance = topologyGraphRef.current;

      if (graphInstance && itemSelectedRef.current) {
        const item = graphInstance.findById(itemSelectedRef.current);

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
            graphInstance.setItemState(edge, 'hover', true);

            const source = edge.getSource();
            const target = edge.getTarget();

            graphInstance.setItemState(source, 'hidden', false);
            graphInstance.setItemState(target, 'hidden', false);

            graphInstance.getNodes().forEach(function (n) {
              if (source?.getID() !== n.getID() && target?.getID() !== n.getID()) {
                graphInstance.setItemState(n, 'hidden', true);
                n.toBack();
              }
            });
          }
        }
      }
    }

    // Creates network topology
    const graphRef = useCallback(($node: HTMLDivElement) => {
      if (nodesWithoutPosition.length && !topologyGraphRef.current) {
        const nodes = insertPositionIntoNodes(nodesWithoutPosition);
        const layout = GraphController.selectLayoutFromNodes(nodes, !!combos);

        const data = GraphController.getG6Model({
          edges,
          nodes,
          combos
        });

        const width = $node.scrollWidth;
        const height = $node.scrollHeight;

        const options: GraphOptions = {
          container: $node,
          width,
          height,
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

        /** EVENTS */
        topologyGraph.on('node:click', ({ item }) => {
          if (item && onClickNode) {
            onClickNode(item.getModel());
          }
        });

        topologyGraph.on('edge:click', ({ item }) => {
          if (item && onClickEdge) {
            onClickEdge(item.getModel());
          }
        });

        topologyGraph.on('node:dragstart', ({ item }) => {
          isHoverState.current = true;

          if (item) {
            topologyGraph.updateItem(item, { style: { cursor: 'grab' } });
          }
        });

        topologyGraph.on('node:dragend', ({ item }) => {
          if (item) {
            topologyGraph.updateItem(item, { style: { cursor: 'pointer' } });

            const updatedNodes = GraphController.fromNodesToLocalStorageData(
              [item as INode],
              ({ id, x, y }: LocalStorageData) => ({ id, x, y })
            );

            GraphController.saveDataInLocalStorage(updatedNodes);
          }

          isHoverState.current = false;
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

          if (item) {
            topologyGraph.setItemState(item, 'hover', false);
          }

          // when we back from an other view and we leave a node we must erase links status
          itemSelectedRef.current = undefined;
          topologyGraph.getEdges().forEach(function (edge) {
            topologyGraph.setItemState(edge, 'hover', false);
          });
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

          if (item) {
            topologyGraph.setItemState(item, 'hover', false);
          }
        });

        if (combos?.length) {
          topologyGraph.on('combo:click', ({ item }) => {
            if (item && onClickCombo) {
              onClickCombo(item.getModel());
            }
          });

          topologyGraph.on('combo:dragstart', () => {
            isHoverState.current = true;
          });

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

            isHoverState.current = false;
          });
        }

        topologyGraph.on('canvas:dragstart', () => {
          isHoverState.current = true;
        });

        topologyGraph.on('canvas:dragend', ({ dx, dy }: { dx?: number; dy?: number }) => {
          if (dx !== undefined && dy !== undefined) {
            const updatedNodes = GraphController.fromNodesToLocalStorageData(
              topologyGraph.getNodes(),
              ({ id, x, y }: LocalStorageData) => ({ id, x: x + dx, y: y + dy })
            );

            GraphController.saveDataInLocalStorage(updatedNodes);
          }

          isHoverState.current = false;
        });

        topologyGraph.on('wheelzoom', () => {
          const zoomValue = topologyGraph.getZoom();

          if (onGetZoom) {
            onGetZoom(zoomValue);
          }

          if (onFitScreen) {
            onFitScreen(0);
          }
        });

        // Be carefull: afterender is supposd to be calleed every re-render. In our case that's not happen  because we update the topology usng changeData.
        // If this behaviour changes we must use a flag to check only the first render
        topologyGraph.on('afterrender', () => {
          prevNodesRef.current = nodesWithoutPosition;
          prevEdgesRef.current = edges;
          prevCombosRef.current = combos;

          if (options.layout) {
            topologyGraph.updateLayout(DEFAULT_LAYOUT_FORCE_CONFIG);
          }

          //save positions
          const updatedNodes = GraphController.fromNodesToLocalStorageData(
            topologyGraph.getNodes(),
            ({ id, x, y }: LocalStorageData) => ({ id, x, y })
          );

          GraphController.saveDataInLocalStorage(updatedNodes);
          rollbackTopologyStatus();
          setIsGraphLoaded(true);
        });

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

    // This effect updates the topology when there are changes to the nodes, edges or groups.
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
        const nodes = insertPositionIntoNodes(nodesWithoutPosition);

        graphInstance.changeData(GraphController.getG6Model({ edges, nodes, combos }));

        prevNodesRef.current = nodesWithoutPosition;
        prevEdgesRef.current = edges;
        prevCombosRef.current = combos;

        rollbackTopologyStatus();

        const updatedNodes = GraphController.fromNodesToLocalStorageData(
          graphInstance.getNodes(),
          ({ id, x, y }: LocalStorageData) => ({ id, x, y })
        );
        GraphController.saveDataInLocalStorage(updatedNodes);
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
