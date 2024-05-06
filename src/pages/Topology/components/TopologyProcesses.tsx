import { ComponentType, FC, startTransition, useCallback, useRef, useState } from 'react';

import {
  Divider,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Stack,
  StackItem,
  Title
} from '@patternfly/react-core';

import { LAYOUT_TOPOLOGY_DEFAULT, LAYOUT_TOPOLOGY_SINGLE_NODE } from '@core/components/Graph/Graph.constants';
import {
  GraphEdge,
  GraphNode,
  GraphReactAdaptorProps,
  GraphReactAdaptorExposedMethods
} from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import NodeOrEdgeList from './NodeOrEdgeList';
import AlertToasts, { ToastExposeMethods } from './TopologyToasts';
import TopologyToolbar from './TopologyToolbar';
import useTopologyProcessData from './useTopologyProcessData';
import { TopologyController } from '../services';
import { TopologyProcessController } from '../services/topologyProcessController';
import {
  ROTATE_LINK_LABEL,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_LINK_PROTOCOL,
  SHOW_LINK_REVERSE_LABEL,
  SHOW_SITE_KEY,
  displayOptionsForProcesses
} from '../Topology.constants';
import { TopologyLabels } from '../Topology.enum';
import { NodeOrEdgeListProps } from '../Topology.interfaces';

const DISPLAY_OPTIONS = 'display-options';
const SERVICE_OPTIONS = 'service-options';
const DEFAULT_DISPLAY_OPTIONS_ENABLED = [SHOW_SITE_KEY];

const TopologyProcesses: FC<{
  serviceIds?: string[];
  id?: string;
  GraphComponent?: ComponentType<GraphReactAdaptorProps>;
  ModalComponent?: ComponentType<NodeOrEdgeListProps>;
}> = function ({ serviceIds, id: itemId, GraphComponent = GraphReactAdaptor, ModalComponent = NodeOrEdgeList }) {
  const configuration =
    TopologyController.loadDisplayOptionsFromLocalStorage(DISPLAY_OPTIONS) || DEFAULT_DISPLAY_OPTIONS_ENABLED;

  const [idSelected, setIdSelected] = useState<string | undefined>(itemId); //process or link id
  const [serviceIdsSelected, setServiceIdsSelected] = useState<string[] | undefined>(serviceIds);
  const [showOnlyNeighbours, setShowOnlyNeighbours] = useState(false);
  const [moveToNodeSelected, setMoveToNodeSelected] = useState(false);

  const [displayOptionsSelected, setDisplayOptionsSelected] = useState<string[]>(configuration);

  const [modalType, setModalType] = useState<{ type: 'process' | 'processPair'; id: string } | undefined>();

  const drawerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<GraphReactAdaptorExposedMethods>();
  const toastRef = useRef<ToastExposeMethods>(null);

  const isDisplayOptionActive = useCallback(
    (option: string) => displayOptionsSelected.includes(option),
    [displayOptionsSelected]
  );

  const { processes, processesPairs, metrics } = useTopologyProcessData({
    idSelected: showOnlyNeighbours ? idSelected : undefined,
    showBytes: displayOptionsSelected.includes(SHOW_LINK_BYTES),
    showByteRate: displayOptionsSelected.includes(SHOW_LINK_BYTERATE),
    showLatency: displayOptionsSelected.includes(SHOW_LINK_LATENCY)
  });

  const handleProcessSelected = useCallback((id?: string) => {
    setIdSelected(id);

    if (!id) {
      handleCloseModal();

      return;
    }

    setModalType({ type: 'process', id });
  }, []);

  const handleShowOnlyNeighboursChecked = useCallback((checked: boolean) => {
    if (checked) {
      graphRef.current?.saveNodePositions();
    }

    setShowOnlyNeighbours(checked);
  }, []);

  const handleMoveToNodeSelectedChecked = useCallback((checked: boolean) => {
    setMoveToNodeSelected(checked);
  }, []);

  const handleSelectedLink = useCallback(({ id }: GraphEdge) => {
    setModalType({ type: 'processPair', id });
  }, []);

  const handleSelectedNode = useCallback(({ id }: GraphNode) => {
    setIdSelected(id);
    setModalType({ type: 'process', id });
  }, []);

  const handleServiceSelected = useCallback((ids: string[] | undefined) => {
    setIdSelected(undefined);
    setModalType(undefined);
    setServiceIdsSelected(ids);
  }, []);

  const handleDisplayOptionSelected = useCallback((options: string[]) => {
    startTransition(() => {
      setDisplayOptionsSelected(options);
    });

    localStorage.setItem(DISPLAY_OPTIONS, JSON.stringify(options));
  }, []);

  const handleSaveTopology = useCallback(() => {
    localStorage.setItem(SERVICE_OPTIONS, JSON.stringify(serviceIdsSelected));
    graphRef.current?.saveNodePositions();

    toastRef.current?.addMessage(TopologyLabels.ToastSave);
  }, [serviceIdsSelected]);

  const handleLoadTopology = useCallback(() => {
    const ids = localStorage.getItem(SERVICE_OPTIONS);
    const options = localStorage.getItem(DISPLAY_OPTIONS);

    if (ids) {
      setServiceIdsSelected(ids !== 'undefined' ? JSON.parse(ids) : undefined);
    }

    if (options) {
      setDisplayOptionsSelected(options !== 'undefined' ? JSON.parse(options) : undefined);
    }

    toastRef.current?.addMessage(TopologyLabels.ToastLoad);
  }, []);

  const handleCloseModal = () => {
    setModalType(undefined);
  };

  const { nodes, edges, combos } = TopologyProcessController.dataTransformer({
    processes,
    processesPairs,
    serviceIdsSelected,
    metrics,
    showSites: displayOptionsSelected.includes(SHOW_SITE_KEY),
    showLinkProtocol: isDisplayOptionActive(SHOW_LINK_PROTOCOL),
    showLinkLabelReverse: displayOptionsSelected.includes(SHOW_LINK_REVERSE_LABEL),
    rotateLabel: displayOptionsSelected.includes(ROTATE_LINK_LABEL)
  });

  let filteredCombos = combos;

  // when we select a node we need to remove combos with empty nodes
  if (showOnlyNeighbours && idSelected) {
    const comboIdsFromNodes = nodes.flatMap(({ comboId }) => comboId || []);
    filteredCombos = combos.filter(({ id }) => comboIdsFromNodes.includes(id));
  }

  const nodeIdSelected = nodes.find(({ id }) => id.split('~').includes(idSelected || '') || idSelected === id)?.id;

  const onExpand = () => {
    drawerRef.current && drawerRef.current.focus();
  };

  const panelContent = (
    <DrawerPanelContent isResizable minSize="30%">
      <DrawerHead>
        <Title headingLevel="h1">{TopologyLabels.TopologyModalTitle}</Title>
        <DrawerActions>
          <DrawerCloseButton onClick={handleCloseModal} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ overflow: 'auto' }} hasNoPadding>
        {modalType?.type && (
          <ModalComponent
            ids={modalType?.id}
            items={modalType?.type === 'process' ? processes : processesPairs}
            modalType={modalType.type}
          />
        )}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <>
      <Stack data-testid="sk-topology-processes">
        <StackItem>
          <TopologyToolbar
            nodes={nodes}
            onSelected={handleProcessSelected}
            displayOptions={displayOptionsForProcesses}
            onDisplayOptionSelected={handleDisplayOptionSelected}
            defaultDisplayOptionsSelected={displayOptionsSelected}
            nodeIdSelected={nodeIdSelected}
            showOnlyNeighbours={showOnlyNeighbours}
            onShowOnlyNeighboursChecked={handleShowOnlyNeighboursChecked}
            moveToNodeSelected={moveToNodeSelected}
            onMoveToNodeSelectedChecked={handleMoveToNodeSelectedChecked}
            serviceIdsSelected={serviceIdsSelected}
            onServiceSelected={handleServiceSelected}
            onLoadTopology={handleLoadTopology}
            onSaveTopology={handleSaveTopology}
            linkToPage={ProcessesRoutesPaths.Processes}
            resourcePlaceholder={TopologyLabels.DisplayProcessesDefaultLabel}
          />
          <Divider />
        </StackItem>
        <StackItem isFilled>
          <Drawer isExpanded={!!modalType?.id} onExpand={onExpand}>
            <DrawerContent panelContent={panelContent}>
              <DrawerContentBody>
                <GraphComponent
                  ref={graphRef}
                  nodes={nodes}
                  edges={edges}
                  combos={filteredCombos}
                  itemSelected={nodeIdSelected}
                  layout={showOnlyNeighbours && nodeIdSelected ? LAYOUT_TOPOLOGY_SINGLE_NODE : LAYOUT_TOPOLOGY_DEFAULT}
                  moveToSelectedNode={moveToNodeSelected && !!nodeIdSelected && !showOnlyNeighbours}
                  onClickNode={handleSelectedNode}
                  onClickEdge={handleSelectedLink}
                />
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
        </StackItem>
      </Stack>
      <AlertToasts ref={toastRef} />
    </>
  );
};

export default TopologyProcesses;
