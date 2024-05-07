import { ComponentType, FC, useCallback, useRef } from 'react';

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
import { useNavigate } from 'react-router-dom';

import { LAYOUT_TOPOLOGY_DEFAULT, LAYOUT_TOPOLOGY_SINGLE_NODE } from '@core/components/Graph/Graph.constants';
import { GraphReactAdaptorProps, GraphReactAdaptorExposedMethods } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import NodeOrEdgeList from './NodeOrEdgeList';
import AlertToasts, { ToastExposeMethods } from './TopologyToasts';
import TopologyToolbar from './TopologyToolbar';
import useModalState from './useModalState';
import useServiceState from './useServiceState';
import useTopologyProcessData from './useTopologyProcessData';
import useTopologyState from './useTopologyState';
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

const TopologyProcesses: FC<{
  serviceIds?: string[];
  id?: string[];
  GraphComponent?: ComponentType<GraphReactAdaptorProps>;
  ModalComponent?: ComponentType<NodeOrEdgeListProps>;
}> = function ({ serviceIds, id: processId, GraphComponent = GraphReactAdaptor, ModalComponent = NodeOrEdgeList }) {
  const navigate = useNavigate();
  const graphRef = useRef<GraphReactAdaptorExposedMethods>();
  const toastRef = useRef<ToastExposeMethods>(null);

  const { serviceIdsSelected, handleServiceSelected, saveServiceIdsToLocalStorage, getServiceIdsFromLocalStorage } =
    useServiceState(serviceIds);

  const {
    idSelected,
    showOnlyNeighbours,
    moveToNodeSelected,
    displayOptionsSelected,
    handleSelected,
    handleShowOnlyNeighbours,
    handleMoveToNodeSelectedChecked,
    handleDisplaySelected,
    getDisplaySelectedFromLocalStorage
  } = useTopologyState({ id: processId });

  const { modalType, handleCloseModal, openProcessModal, openProcessPairModal } = useModalState();

  const { processes, processesPairs, metrics } = useTopologyProcessData({
    idSelected: showOnlyNeighbours ? idSelected : undefined,
    showBytes: displayOptionsSelected.includes(SHOW_LINK_BYTES),
    showByteRate: displayOptionsSelected.includes(SHOW_LINK_BYTERATE),
    showLatency: displayOptionsSelected.includes(SHOW_LINK_LATENCY)
  });

  const handleShowOnlyNeighboursChecked = useCallback(
    (checked: boolean) => {
      handleShowOnlyNeighbours(checked);
      checked && graphRef.current?.saveNodePositions();
    },
    [handleShowOnlyNeighbours]
  );

  const handleShowProcessDetails = useCallback(
    (id: string | undefined) => {
      const ids = TopologyController.transformStringIdsToIds(id);

      // handle nodes aggregated
      if (ids?.length && ids.length > 1) {
        handleSelected(TopologyController.transformStringIdsToIds(id));
        id ? openProcessModal(id) : handleCloseModal();

        return;
      }

      // handle a single node selection
      const process = processes?.find(({ identity }) => identity === id);

      if (process) {
        navigate(`${ProcessesRoutesPaths.Processes}/${process.name}@${process.identity}`);
      }
    },
    [handleCloseModal, handleSelected, navigate, openProcessModal, processes]
  );

  const handleShowProcessPairDetails = useCallback(
    (id: string | undefined) => {
      const ids = TopologyController.transformStringIdsToIds(id);

      // handle nodes aggregated
      if (ids?.length && ids.length > 1) {
        handleSelected(TopologyController.transformStringIdsToIds(id));
        id ? openProcessPairModal(id) : handleCloseModal();

        return;
      }

      // handle a single node selection
      const pair = processesPairs?.find(({ identity }) => identity === id);

      if (pair) {
        navigate(
          `${ProcessesRoutesPaths.Processes}/${pair.sourceName}@${pair.sourceId}/${ProcessesLabels.ProcessPairs}@${pair.identity}@${pair.protocol}`
        );
      }
    },
    [handleCloseModal, handleSelected, navigate, openProcessPairModal, processesPairs]
  );

  const handleServiceSelectedWrapper = useCallback(
    (ids: string[] | undefined) => {
      handleSelected(undefined);
      handleServiceSelected(ids);
      handleCloseModal();
    },
    [handleCloseModal, handleSelected, handleServiceSelected]
  );

  const handleSavePositions = useCallback(() => {
    saveServiceIdsToLocalStorage();

    graphRef.current?.saveNodePositions();
    toastRef.current?.addMessage(TopologyLabels.ToastSave);
  }, [saveServiceIdsToLocalStorage]);

  const handleLoadPositions = useCallback(() => {
    getServiceIdsFromLocalStorage();
    getDisplaySelectedFromLocalStorage();

    toastRef.current?.addMessage(TopologyLabels.ToastLoad);
  }, [getServiceIdsFromLocalStorage, getDisplaySelectedFromLocalStorage]);

  const { nodes, edges, combos, nodeIdSelected } = TopologyProcessController.dataTransformer({
    idSelected,
    processes,
    processesPairs,
    serviceIdsSelected,
    metrics,
    showSites: displayOptionsSelected.includes(SHOW_SITE_KEY),
    showLinkProtocol: displayOptionsSelected.includes(SHOW_LINK_PROTOCOL),
    showLinkLabelReverse: displayOptionsSelected.includes(SHOW_LINK_REVERSE_LABEL),
    rotateLabel: displayOptionsSelected.includes(ROTATE_LINK_LABEL)
  });

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
            onSelected={handleShowProcessDetails}
            displayOptions={displayOptionsForProcesses}
            onDisplayOptionSelected={handleDisplaySelected}
            defaultDisplayOptionsSelected={displayOptionsSelected}
            nodeIdSelected={nodeIdSelected}
            showOnlyNeighbours={showOnlyNeighbours}
            onShowOnlyNeighboursChecked={handleShowOnlyNeighboursChecked}
            moveToNodeSelected={moveToNodeSelected}
            onMoveToNodeSelectedChecked={handleMoveToNodeSelectedChecked}
            serviceIdsSelected={serviceIdsSelected}
            onServiceSelected={handleServiceSelectedWrapper}
            onLoadTopology={handleLoadPositions}
            onSaveTopology={handleSavePositions}
            linkToPage={ProcessesRoutesPaths.Processes}
            resourcePlaceholder={TopologyLabels.DisplayProcessesDefaultLabel}
          />
          <Divider />
        </StackItem>
        <StackItem isFilled>
          <Drawer isExpanded={!!modalType?.id}>
            <DrawerContent panelContent={panelContent}>
              <DrawerContentBody>
                <GraphComponent
                  ref={graphRef}
                  nodes={nodes}
                  edges={edges}
                  combos={combos}
                  itemSelected={nodeIdSelected}
                  layout={showOnlyNeighbours && idSelected ? LAYOUT_TOPOLOGY_SINGLE_NODE : LAYOUT_TOPOLOGY_DEFAULT}
                  moveToSelectedNode={moveToNodeSelected && !!idSelected && !showOnlyNeighbours}
                  onClickNode={handleShowProcessDetails}
                  onClickEdge={handleShowProcessPairDetails}
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
