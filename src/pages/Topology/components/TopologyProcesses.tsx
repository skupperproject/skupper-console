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

import { MAX_NODE_COUNT_WITHOUT_AGGREGATION } from '@config/config';
import { LAYOUT_TOPOLOGY_DEFAULT, LAYOUT_TOPOLOGY_SINGLE_NODE } from '@core/components/Graph/Graph.constants';
import { GraphReactAdaptorProps, GraphReactAdaptorExposedMethods } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import NodeOrEdgeList from './NodeOrEdgeList';
import AlertToasts, { ToastExposeMethods } from './TopologyToasts';
import TopologyToolbar from './TopologyToolbar';
import useModalState from './useModalState';
import useTopologyProcessData from './useTopologyProcessData';
import useServiceState from './useTopologyServiceState';
import useTopologyState from './useTopologyState';
import { TopologyController } from '../services';
import { TopologyProcessController } from '../services/topologyProcessController';
import {
  ROTATE_LINK_LABEL,
  SHOW_DEPLOYMENTS,
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
  ids?: string[];
  GraphComponent?: ComponentType<GraphReactAdaptorProps>;
  ModalComponent?: ComponentType<NodeOrEdgeListProps>;
}> = function ({ serviceIds, ids: processIds, GraphComponent = GraphReactAdaptor, ModalComponent = NodeOrEdgeList }) {
  const navigate = useNavigate();
  const graphRef = useRef<GraphReactAdaptorExposedMethods>();
  const toastRef = useRef<ToastExposeMethods>(null);

  const { serviceIdsSelected, handleServiceSelected, saveServiceIdsToLocalStorage, getServiceIdsFromLocalStorage } =
    useServiceState(serviceIds);

  const {
    idsSelected,
    showOnlyNeighbours,
    moveToNodeSelected,
    displayOptionsSelected,
    handleSelected,
    handleShowOnlyNeighbours,
    handleMoveToNodeSelectedChecked,
    handleDisplaySelected,
    getDisplaySelectedFromLocalStorage
  } = useTopologyState({
    ids: processIds,
    initDisplayOptionsEnabled: [SHOW_SITE_KEY],
    displayOptionsEnabledKey: 'display-process-options'
  });

  const { modalType, handleCloseModal, openProcessModal, openProcessPairModal } = useModalState();

  const { processes, processesPairs, metrics } = useTopologyProcessData({
    idsSelected: showOnlyNeighbours ? idsSelected : undefined,
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

  const handleProcessSelected = useCallback(
    (id?: string) => {
      handleShowOnlyNeighbours(false);
      handleSelected(TopologyController.transformStringIdsToIds(id));
      handleCloseModal();
    },
    [handleCloseModal, handleSelected, handleShowOnlyNeighbours]
  );

  const handleShowProcessDetails = useCallback(
    (id: string) => {
      // handle process aggregated
      if (TopologyController.areGroupOfIds(id)) {
        handleSelected(TopologyController.transformStringIdsToIds(id));
        openProcessModal(id);

        return;
      }

      // handle a single process selection
      const process = processes?.find(({ identity }) => identity === id);

      if (process) {
        navigate(`${ProcessesRoutesPaths.Processes}/${process.name}@${process.identity}`);
      }
    },
    [handleSelected, navigate, openProcessModal, processes]
  );

  const handleShowProcessPairDetails = useCallback(
    (id: string) => {
      if (TopologyController.areGroupOfIds(id)) {
        handleSelected(TopologyController.transformStringIdsToIds(id));
        openProcessPairModal(id);

        return;
      }

      const pair = processesPairs?.find(({ identity }) => identity === id);

      if (pair) {
        navigate(
          `${ProcessesRoutesPaths.Processes}/${pair.sourceName}@${pair.sourceId}/${ProcessesLabels.ProcessPairs}@${pair.identity}@${pair.protocol}`
        );
      }
    },
    [handleSelected, navigate, openProcessPairModal, processesPairs]
  );

  const handleServiceSelectedWrapper = useCallback(
    (ids: string[] | undefined) => {
      handleShowOnlyNeighbours(false);
      handleSelected();
      handleServiceSelected(ids);
      handleCloseModal();
    },
    [handleCloseModal, handleSelected, handleServiceSelected, handleShowOnlyNeighbours]
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

  const showDeployments =
    displayOptionsSelected.includes(SHOW_DEPLOYMENTS) ||
    (!displayOptionsSelected.includes(SHOW_DEPLOYMENTS) && processes.length > MAX_NODE_COUNT_WITHOUT_AGGREGATION);

  const { nodes, edges, combos, nodeIdSelected } = TopologyProcessController.dataTransformer({
    idsSelected,
    processes,
    processesPairs,
    serviceIdsSelected,
    metrics,
    showSites: displayOptionsSelected.includes(SHOW_SITE_KEY),
    showLinkProtocol: displayOptionsSelected.includes(SHOW_LINK_PROTOCOL),
    showLinkLabelReverse: displayOptionsSelected.includes(SHOW_LINK_REVERSE_LABEL),
    rotateLabel: displayOptionsSelected.includes(ROTATE_LINK_LABEL),
    showDeployments // a deployment is a group of processes in the same site that have the same function
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
            ids={TopologyController.transformStringGroupIdsToGroupIds(modalType?.id)}
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
            displayOptions={displayOptionsForProcesses}
            onDisplayOptionSelected={handleDisplaySelected}
            defaultDisplayOptionsSelected={[...displayOptionsSelected, showDeployments ? SHOW_DEPLOYMENTS : '']}
            showOnlyNeighbours={showOnlyNeighbours}
            onShowOnlyNeighboursChecked={handleShowOnlyNeighboursChecked}
            moveToNodeSelected={moveToNodeSelected}
            onMoveToNodeSelectedChecked={handleMoveToNodeSelectedChecked}
            serviceIdsSelected={serviceIdsSelected}
            onServiceSelected={handleServiceSelectedWrapper}
            onLoadTopology={handleLoadPositions}
            onSaveTopology={handleSavePositions}
            resourceIdSelected={nodeIdSelected}
            resourceOptions={nodes.map((node) => ({ name: node.label, identity: node.id }))}
            resourcePlaceholder={TopologyLabels.DisplayProcessesDefaultLabel}
            onResourceSelected={handleProcessSelected}
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
                  layout={showOnlyNeighbours && idsSelected ? LAYOUT_TOPOLOGY_SINGLE_NODE : LAYOUT_TOPOLOGY_DEFAULT}
                  moveToSelectedNode={moveToNodeSelected && !!idsSelected && !showOnlyNeighbours}
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
