import { ComponentType, FC, useCallback } from 'react';

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

import { MAX_DRAWER_WIDTH, MIN_DRAWER_WIDTH } from '@config/config';
import { GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import NodeOrEdgeList from './NodeOrEdgeList';
import TopologyToolbar from './TopologyToolbar';
import useTopologyProcessData from './useTopologyProcessData';
import useServiceState from './useTopologyServiceState';
import useTopologyState from './useTopologyState';
import { TopologyController } from '../services';
import { TopologyProcessController } from '../services/topologyProcessController';
import {
  SHOW_DEPLOYMENTS,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_LINK_PROTOCOL,
  SHOW_LINK_REVERSE_LABEL,
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
  const { serviceIdsSelected, handleServiceSelected } = useServiceState(serviceIds);

  const { idsSelected, searchText, displayOptionsSelected, handleSelected, handleSearchText, handleDisplaySelected } =
    useTopologyState({
      ids: processIds,
      initDisplayOptionsEnabled: [SHOW_DEPLOYMENTS],
      displayOptionsEnabledKey: 'display-process-options'
    });

  const { processes, processesPairs, metrics } = useTopologyProcessData();

  const handleShowProcessDetails = useCallback(
    (id: string) => {
      if (!id) {
        return handleSelected();
      }
      // handle process aggregated
      if (TopologyController.areGroupOfIds(id)) {
        return handleSelected(TopologyController.transformStringIdsToIds(id));
      }

      //handle a single process selection
      const process = processes?.find(({ identity }) => identity === id);

      if (process) {
        navigate(`${ProcessesRoutesPaths.Processes}/${process.name}@${process.identity}`);
      }
    },
    [handleSelected, navigate, processes]
  );

  const handleShowProcessPairDetails = useCallback(
    (id: string) => {
      if (!id) {
        return handleSelected();
      }

      if (TopologyController.areGroupOfIds(id)) {
        return handleSelected(TopologyController.transformStringIdsToIds(id));
      }

      const pair = processesPairs?.find(({ identity }) => identity === id);

      if (pair) {
        navigate(
          `${ProcessesRoutesPaths.Processes}/${pair.sourceName}@${pair.sourceId}/${ProcessesLabels.ProcessPairs}@${pair.identity}@${pair.protocol}`
        );
      }
    },
    [handleSelected, navigate, processesPairs]
  );

  const handleServiceSelectedWrapper = useCallback(
    (ids: string[] | undefined) => {
      handleSelected();
      handleServiceSelected(ids);
    },
    [handleSelected, handleServiceSelected]
  );
  const { nodes, edges, combos, nodeIdSelected, nodeIdsToHighLight } = TopologyProcessController.dataTransformer({
    idsSelected,
    searchText,
    processes,
    processesPairs,
    serviceIdsSelected,
    metrics,
    options: {
      showLinkBytes: displayOptionsSelected.includes(SHOW_LINK_BYTES),
      showLinkLatency: displayOptionsSelected.includes(SHOW_LINK_LATENCY),
      showLinkByteRate: displayOptionsSelected.includes(SHOW_LINK_BYTERATE),
      showLinkProtocol: displayOptionsSelected.includes(SHOW_LINK_PROTOCOL),
      showLinkLabelReverse: displayOptionsSelected.includes(SHOW_LINK_REVERSE_LABEL),
      showDeployments: displayOptionsSelected.includes(SHOW_DEPLOYMENTS) // a deployment is a group of processes in the same site that have the same function
    }
  });

  const panelContent = (
    <DrawerPanelContent isResizable minSize={`${MIN_DRAWER_WIDTH}px`} maxSize={`${MAX_DRAWER_WIDTH}px`}>
      <DrawerHead>
        <Title headingLevel="h1">{TopologyLabels.TopologyModalTitle}</Title>
        <DrawerActions>
          <DrawerCloseButton onClick={() => handleSelected()} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ overflow: 'auto' }} hasNoPadding>
        <ModalComponent
          ids={TopologyController.transformStringGroupIdsToGroupIds(nodeIdSelected)}
          items={TopologyController.arePairIds(nodeIdSelected) ? processesPairs : processes}
          modalType={TopologyController.arePairIds(nodeIdSelected) ? 'processPair' : 'process'}
          metrics={metrics}
        />
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Stack data-testid="sk-topology-processes">
      <StackItem>
        <TopologyToolbar
          displayOptions={displayOptionsForProcesses}
          onDisplayOptionSelected={handleDisplaySelected}
          defaultDisplayOptionsSelected={displayOptionsSelected}
          serviceIdsSelected={serviceIdsSelected}
          onServiceSelected={handleServiceSelectedWrapper}
          resourcePlaceholder={TopologyLabels.DisplayProcessesDefaultLabel}
          onResourceSelected={handleSearchText}
        />
        <Divider />
      </StackItem>
      <StackItem isFilled>
        <Drawer isExpanded={TopologyController.areGroupOfIds(nodeIdSelected) && !!nodeIdSelected} isInline>
          <DrawerContent panelContent={panelContent}>
            <DrawerContentBody>
              <GraphComponent
                nodes={nodes}
                edges={edges}
                combos={combos}
                itemSelected={nodeIdSelected}
                itemsToHighlight={nodeIdsToHighLight}
                layout="combo"
                onClickNode={handleShowProcessDetails}
                onClickEdge={handleShowProcessPairDetails}
              />
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </StackItem>
    </Stack>
  );
};

export default TopologyProcesses;
