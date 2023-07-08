import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ColaLayout,
  DefaultEdge,
  DefaultGroup,
  DefaultNode,
  Edge,
  Graph,
  GraphComponent,
  graphDropTargetSpec,
  groupDropTargetSpec,
  Layout,
  LayoutFactory,
  Model,
  ModelKind,
  Node,
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  NodeModel,
  SELECTION_EVENT,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  withDndDrop,
  withDragNode,
  WithDndDropProps,
  WithDragNodeProps,
  withPanZoom,
  withSelection,
  WithSelectionProps,
  EdgeModel,
  action,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  TopologyControlBar,
  TopologyView,
  EdgeTerminalType
} from '@patternfly/react-topology';

import { GraphController } from './services';

const FIT_SCREEN_CACHE_KEY_SUFFIX = '-fitScreen';
const ZOOM_CACHE_KEY_SUFFIX = '-graphZoom';
const ICON_SIZE = 15;
const ARROW_SIZE = 8;

interface CustomNodeProps {
  element: Node;
}

interface DataEdgeProps {
  element: Edge;
}

const DataEdge: FC<DataEdgeProps & WithSelectionProps> = function ({ element, onSelect, ...rest }) {
  return (
    <DefaultEdge
      element={element}
      endTerminalType={EdgeTerminalType.directionalAlt}
      endTerminalSize={ARROW_SIZE}
      onSelect={onSelect}
      {...rest}
    />
  );
};

const CustomNode: FC<CustomNodeProps & WithSelectionProps & WithDragNodeProps & WithDndDropProps> = function ({
  element,
  selected,
  onSelect,
  ...rest
}) {
  const data = element.getData();
  const Icon = data?.icon;

  return (
    <DefaultNode element={element} showStatusDecorator onSelect={onSelect} selected={selected} {...rest}>
      <g transform={`translate(15, 15)`}>
        <Icon style={{ color: '#393F44' }} width={ICON_SIZE} height={ICON_SIZE} />
      </g>
    </DefaultNode>
  );
};

const customLayoutFactory: LayoutFactory = (_: string, graph: Graph): Layout | undefined =>
  new ColaLayout(graph, { layoutOnDrag: false });

const CONNECTOR_TARGET_DROP = 'connector-target-drop';

const customComponentFactory = (kind: ModelKind, t: string): any => {
  switch (t) {
    case 'group':
      return withDndDrop(groupDropTargetSpec)(
        withDragNode(nodeDragSourceSpec('group') as any)(withSelection()(DefaultGroup as any))
      );
    default:
      switch (kind) {
        case ModelKind.graph:
          return withDndDrop(graphDropTargetSpec())(withPanZoom()(GraphComponent as any));
        case ModelKind.node:
          return withSelection(withDndDrop(nodeDropTargetSpec([CONNECTOR_TARGET_DROP])) as any)(
            withDragNode(nodeDragSourceSpec('node', true, true) as any)(CustomNode as any)
          );
        case ModelKind.edge:
          return withSelection()(DataEdge as any);
        default:
          return undefined;
      }
  }
};

const TopologyAdaptor: FC<{
  nodes: NodeModel[];
  edges: EdgeModel[];
  itemSelected?: string;
  onClickNode: Function;
  onClickCombo?: Function;
  onClickEdge?: Function;
  onGetZoom: Function;
  onFitScreen: Function;
  config?: {
    zoom?: string | null;
    fitScreen?: number | null;
    fitCenter?: boolean | null;
  };
}> = function ({ nodes, edges, onClickNode, onClickCombo, onClickEdge, onGetZoom, onFitScreen, config }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const controllerRef = useRef<Visualization>();

  const handleSelect = useCallback(
    (ids: string[]) => {
      const idSelected = ids[0];

      if (idSelected) {
        // select and edge
        if (onClickEdge && idSelected.split('-to-').length > 1) {
          const edge = edges.find(({ id }) => id === idSelected);
          setSelectedIds([idSelected]);

          return onClickEdge({ id: edge?.id, source: edge?.source });
        }

        const node = nodes.find(({ id }) => id === idSelected);

        if (onClickCombo && node?.type === 'group') {
          onClickCombo(node);
        } else {
          onClickNode(node);
        }

        setSelectedIds([idSelected]);
      }
    },
    [onClickEdge, nodes, onClickCombo, edges, onClickNode]
  );

  const controller = useMemo(() => {
    const model: Model = {
      nodes,
      edges,
      graph: {
        id: 'g1',
        type: 'graph',
        layout: 'Cola'
      }
    };

    if (!controllerRef.current) {
      const newController = new Visualization();
      newController.registerLayoutFactory(customLayoutFactory);
      newController.registerComponentFactory(customComponentFactory);
      newController.addEventListener(SELECTION_EVENT, handleSelect);

      newController.fromModel(model, false);
      newController.getGraph().setScale(Number(config?.zoom || 1));
      controllerRef.current = newController;

      return newController;
    }

    controllerRef.current.fromModel(model, false);

    return controllerRef.current;
  }, [config?.zoom, edges, handleSelect, nodes]);

  useEffect(
    () => () => {
      const updatedNodes = controller
        .getGraph()
        .getNodes()
        .flatMap((node) => {
          //nodes in the group
          const children = node.getChildren() as Node[];

          if (children.length) {
            return children.flatMap((child: Node) => {
              const { x, y } = child.getPosition();

              return { id: child.getId(), x, y };
            });
          }

          const { x, y } = node.getPosition();

          return { id: node.getId(), x, y };
        });

      if (updatedNodes) {
        GraphController.saveDataInLocalStorage(updatedNodes);
      }
    },
    []
  );

  return (
    <TopologyView
      controlBar={
        <TopologyControlBar
          controlButtons={createTopologyControlButtons({
            ...defaultControlButtonsOptions,
            zoomInCallback: action(() => {
              controller.getGraph().scaleBy(4 / 3);
              onGetZoom(controller.getGraph().getScale());
            }),
            zoomOutCallback: action(() => {
              controller.getGraph().scaleBy(0.75);
              onGetZoom(controller.getGraph().getScale());
            }),
            fitToScreenCallback: action(() => {
              controller.getGraph().fit(100);
              onFitScreen(100);
            }),
            resetViewCallback: action(() => {
              GraphController.cleanPositionsFromLocalStorage();
              GraphController.cleanPositionsControlsFromLocalStorage(FIT_SCREEN_CACHE_KEY_SUFFIX);
              GraphController.cleanPositionsControlsFromLocalStorage(ZOOM_CACHE_KEY_SUFFIX);
              controller.getGraph().reset();
              controller.getGraph().layout();
            }),
            legend: false
          })}
        />
      }
    >
      <VisualizationProvider controller={controller}>
        <VisualizationSurface state={{ selectedIds }} />
      </VisualizationProvider>
    </TopologyView>
  );
};

export default TopologyAdaptor;
