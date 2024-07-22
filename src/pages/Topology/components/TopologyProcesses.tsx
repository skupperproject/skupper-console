import { ComponentType, FC, useCallback, useEffect, useState } from 'react';

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
import SkGraph from '@core/components/SkGraph';
import { SkGraphProps } from '@core/components/SkGraph/Graph.interfaces';
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
  SHOW_LINK_METRIC_DISTRIBUTION,
  SHOW_LINK_METRIC_VALUE,
  SHOW_LINK_PROTOCOL,
  SHOW_INBOUND_METRICS,
  displayOptionsForProcesses
} from '../Topology.constants';
import { TopologyLabels } from '../Topology.enum';
import { NodeOrEdgeListProps } from '../Topology.interfaces';

const TopologyProcesses: FC<{
  serviceIds?: string[];
  ids?: string[];
  GraphComponent?: ComponentType<SkGraphProps>;
  ModalComponent?: ComponentType<NodeOrEdgeListProps>;
}> = function ({ serviceIds, ids: processIds, GraphComponent = SkGraph, ModalComponent = NodeOrEdgeList }) {
  const navigate = useNavigate();

  // TODO: The graph doesn't resize its children if the drawer is opened before the graph is mounted.
  // To fix this, we need to delay the action of opening the drawer until after the graph has been mounted
  // We can do this by opening the drawer in a separate useEffect that runs after the graph has been
  const [enableDrawer, setEnableDrawer] = useState(false);
  const { serviceIdsSelected, handleServiceSelected } = useServiceState(serviceIds);
  const { idsSelected, searchText, displayOptionsSelected, handleSelected, handleSearchText, handleDisplaySelected } =
    useTopologyState({
      ids: processIds,
      initDisplayOptionsEnabled: [SHOW_DEPLOYMENTS, SHOW_LINK_METRIC_VALUE],
      //name of the configuration to be saved in the localstorage
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
      const process = processes.find(({ identity }) => identity === id);
      navigate(`${ProcessesRoutesPaths.Processes}/${process?.name}@${process?.identity}`);
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

      const pair = processesPairs.find(({ identity }) => identity === id);
      navigate(
        `${ProcessesRoutesPaths.Processes}/${pair?.sourceName}@${pair?.sourceId}/${ProcessesLabels.ProcessPairs}@${pair?.identity}@${pair?.protocol}`
      );
    },
    [handleSelected, navigate, processesPairs]
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
      showInboundMetrics: displayOptionsSelected.includes(SHOW_INBOUND_METRICS),
      showMetricDistribution: displayOptionsSelected.includes(SHOW_LINK_METRIC_DISTRIBUTION),
      showMetricValue: displayOptionsSelected.includes(SHOW_LINK_METRIC_VALUE),
      showDeployments: displayOptionsSelected.includes(SHOW_DEPLOYMENTS) // a deployment is a group of processes in the same site that have the same function
    }
  });

  useEffect(() => {
    setEnableDrawer(true);
  }, []);

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
          onServiceSelected={handleServiceSelected}
          resourcePlaceholder={TopologyLabels.DisplayProcessesDefaultLabel}
          onResourceSelected={handleSearchText}
        />
        <Divider />
      </StackItem>
      <StackItem isFilled>
        <Drawer
          isExpanded={TopologyController.areGroupOfIds(nodeIdSelected) && !!nodeIdSelected && enableDrawer}
          isInline
        >
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
