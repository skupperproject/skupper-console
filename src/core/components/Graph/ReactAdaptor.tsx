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

import {
  Combo,
  ComboEvent,
  Edge,
  EdgeEvent,
  Graph,
  GraphEvent,
  GraphOptions,
  IGraphLifeCycleEvent,
  IPointerEvent,
  Node,
  NodeEvent
} from '@antv/g6';
import { debounce } from '@patternfly/react-core';

import {
  GraphEdge,
  GraphCombo,
  GraphNode,
  GraphReactAdaptorProps,
  LocalStorageData
} from '@core/components/Graph/Graph.interfaces';
import LoadingPage from '@pages/shared/Loading';

import { registerElements } from './CustomElements';
import { DEFAULT_GRAPH_CONFIG, LAYOUT_TOPOLOGY_DEFAULT, GRAPH_BG_COLOR, GRAPH_CONTAINER_ID } from './Graph.constants';
import MenuControl from './MenuControl';
import { GraphController } from './services';

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
        moveToSelectedNode = false,
        savePositions = true
      },
      ref
    ) => {
      const [isGraphLoaded, setIsGraphLoaded] = useState(false);

      const itemSelectedRef = useRef<string | undefined>(itemSelected);
      const prevNodesRef = useRef<GraphNode[]>(nodesWithoutPosition);
      const prevEdgesRef = useRef<GraphEdge[]>(edges);
      const prevCombosRef = useRef<GraphCombo[] | undefined>(combos);
      const topologyGraphRef = useRef<Graph>();

      const save = () => {
        const graphInstance = topologyGraphRef.current;

        if (!graphInstance?.getNodeData()) {
          return;
        }

        const updatedNodes = GraphController.fromNodesToLocalStorageData(
          graphInstance.getNodeData(),
          ({ id, x, y }: LocalStorageData) => ({ id, x, y })
        );

        GraphController.saveAllNodePositions(updatedNodes);
      };

      //exposed methods
      useImperativeHandle(ref, () => ({
        // save the nodes positions to the local storage
        saveNodePositions() {
          save();
        }
      }));

      const toggleHover = useCallback((enable: boolean = false) => {
        const graphInstance = topologyGraphRef.current as Graph;

        graphInstance.updateBehavior({
          key: 'hover-activate',
          enable: ({ targetType }: IPointerEvent) => (enable ? targetType === 'node' || targetType === 'edge' : false)
        });
      }, []);

      /** Simulate a Select event, regardless of whether a node or edge is preselected */
      const handleItemSelected = useCallback(
        (id?: string) => {
          const graphInstance = topologyGraphRef.current;

          if (graphInstance) {
            if (!id) {
              GraphController.cleanAllRelations(graphInstance);

              return;
            }
            //disable the hover effect of the graph if an item is selected
            toggleHover(!itemSelectedRef.current);

            const type = graphInstance.getElementType(id);

            if (type === 'node') {
              GraphController.activateNodeRelations(graphInstance, id);
            }

            if (type === 'edge') {
              GraphController.activateEdgeRelations(graphInstance, id);
            }
          }
        },
        [toggleHover]
      );

      const afterLayout = useCallback(() => {
        if (itemSelectedRef.current) {
          handleItemSelected(itemSelectedRef.current);
        }
      }, [handleItemSelected]);

      const handleResize = async () => {
        const graphInstance = topologyGraphRef.current;
        await graphInstance?.fitView();
        graphInstance?.resize();
      };

      /** Creates network topology instance */
      const graphRef = useCallback(async ($node: HTMLDivElement) => {
        if (nodesWithoutPosition && !topologyGraphRef.current) {
          const nodes = savePositions
            ? GraphController.addPositionsToNodes(nodesWithoutPosition)
            : nodesWithoutPosition;

          const options: GraphOptions = {
            ...DEFAULT_GRAPH_CONFIG,
            container: $node,
            autoResize: false,
            animation: false,
            data: GraphController.transformData({ edges, nodes, combos }),
            layout: layout({
              sideLength: calculateNumberOfGroupedNodes(nodes)
            })
          };

          const graph = new Graph(options);

          graph?.on<IPointerEvent<Node>>(NodeEvent.CLICK, ({ target: { id } }) => onClickNode?.(id));
          graph?.on<IPointerEvent<Edge>>(EdgeEvent.CLICK, ({ target: { id } }) => onClickEdge?.(id));
          graph?.on<IPointerEvent<Combo>>(ComboEvent.CLICK, ({ target: { id } }) => onClickCombo?.(id));
          graph?.on<IGraphLifeCycleEvent>(GraphEvent.AFTER_LAYOUT, afterLayout);
          graph?.on<IGraphLifeCycleEvent>(GraphEvent.AFTER_SIZE_CHANGE, () => graph.fitCenter());

          registerElements();

          await graph.render();
          await graph.fitView();

          topologyGraphRef.current = graph;
          setIsGraphLoaded(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const updateData = useCallback(async () => {
        const graphInstance = topologyGraphRef.current;

        if (!graphInstance || !isGraphLoaded) {
          return;
        }

        if (
          JSON.stringify(prevNodesRef.current) === JSON.stringify(nodesWithoutPosition) &&
          JSON.stringify(prevEdgesRef.current) === JSON.stringify(edges) &&
          JSON.stringify(prevCombosRef.current) === JSON.stringify(combos)
        ) {
          return;
        }
        save();
        const nodes = GraphController.addPositionsToNodes(nodesWithoutPosition, graphInstance.getNodeData());

        graphInstance.setData(GraphController.transformData({ edges, nodes, combos }));
        await graphInstance.render();

        // updated the prev values with the new ones
        prevNodesRef.current = nodesWithoutPosition;
        prevEdgesRef.current = edges;
        prevCombosRef.current = combos;
      }, [combos, edges, isGraphLoaded, nodesWithoutPosition]);

      // This effect updates the topology when there are changes to the nodes, edges.
      useEffect(() => {
        updateData();
      }, [updateData]);

      // Center the node selected
      useEffect(() => {
        if (itemSelected && moveToSelectedNode) {
          const graphInstance = topologyGraphRef.current;
          graphInstance?.focusElement(itemSelected);
        }
      }, [itemSelected, moveToSelectedNode]);

      // Select the node or edge
      useEffect(() => {
        if (isGraphLoaded) {
          itemSelectedRef.current = itemSelected;
          handleItemSelected(itemSelectedRef.current);
        }
      }, [handleItemSelected, itemSelected, isGraphLoaded]);

      useLayoutEffect(() => {
        const container = document.querySelector(`#${GRAPH_CONTAINER_ID}`) as Element;
        const resizeObserver = new ResizeObserver((entries) => {
          debouncedHandleResize(entries);
        });

        const debouncedHandleResize = debounce(handleResize, 100);
        resizeObserver.observe(container);

        return () => {
          resizeObserver.disconnect();
        };
      }, []);

      useEffect(() => () => save(), []);

      return (
        <div
          id={GRAPH_CONTAINER_ID}
          ref={graphRef}
          style={{
            height: '99.9%',
            background: GRAPH_BG_COLOR,
            position: 'relative'
          }}
        >
          {topologyGraphRef.current && <MenuControl graphInstance={topologyGraphRef.current} />}
          {!isGraphLoaded && <LoadingPage isFLoating={true} />}
        </div>
      );
    }
  )
);

export default GraphReactAdaptor;

function calculateNumberOfGroupedNodes(nodes: GraphNode[]) {
  const counts = nodes.reduce(
    (acc, node) => {
      acc[node.combo || ''] = (acc[node.combo || ''] || 0) + 1;

      return acc;
    },
    {} as Record<string, number>
  );

  const max = Math.max(...Object.values(counts), 25);
  const sideLength = Math.floor(Math.sqrt(max));

  return sideLength;
}
