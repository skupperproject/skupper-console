import { ComponentType, FC, useCallback } from 'react';

import {
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
import { GraphEdge, GraphNode, SkGraphProps } from 'types/Graph.interfaces';

import TopologyDetails, { TopoloyDetailsProps } from './TopologyDetails';
import TopologyToolbar from './TopologyToolbar';
import { Labels } from '../../../config/labels';
import SkGraph from '../../../core/components/SkGraph';
import { ProcessesRoutesPaths } from '../../Processes/Processes.enum';
import useTopologyProcessData from '../hooks/useTopologyProcessData';
import useServiceState from '../hooks/useTopologyServiceState';
import useTopologyState from '../hooks/useTopologyState';
import { TopologyController } from '../services';
import { TopologyProcessController } from '../services/topologyProcessController';
import {
  SHOW_DEPLOYMENTS,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_METRIC_DISTRIBUTION,
  SHOW_LINK_METRIC_VALUE,
  displayOptionsForProcesses
} from '../Topology.constants';

const MIN_DRAWER_WIDTH = 500;
const MAX_DRAWER_WIDTH = 800;

const TopologyProcesses: FC<{
  serviceIds?: string[];
  ids?: string[];
  GraphComponent?: ComponentType<SkGraphProps>;
  ModalComponent?: ComponentType<TopoloyDetailsProps>;
}> = function ({ serviceIds, ids: processIds, GraphComponent = SkGraph, ModalComponent = TopologyDetails }) {
  const navigate = useNavigate();

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
    (data: GraphNode | null) => {
      const id = data?.id;

      if (!id) {
        return handleSelected();
      }
      // handle process aggregated
      if (TopologyController.areGroupOfIds(id)) {
        return handleSelected(TopologyController.transformStringIdsToIds(id));
      }

      //handle a single process selection
      if (id) {
        navigate(`${ProcessesRoutesPaths.Processes}/${data.name}@${id}`);
      }
    },
    [handleSelected, navigate]
  );

  const handleShowProcessPairDetails = useCallback(
    (data: GraphEdge | null) => {
      const id = data?.id;

      if (!id) {
        return handleSelected();
      }

      if (TopologyController.areGroupOfIds(id)) {
        return handleSelected(TopologyController.transformStringIdsToIds(id));
      }

      navigate(`${ProcessesRoutesPaths.Processes}/${data.sourceName}@${data.source}/${Labels.Pairs}@${id}`);
    },
    [handleSelected, navigate]
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
      showLinkByteRate: displayOptionsSelected.includes(SHOW_LINK_BYTERATE),
      showMetricDistribution: displayOptionsSelected.includes(SHOW_LINK_METRIC_DISTRIBUTION),
      showMetricValue: displayOptionsSelected.includes(SHOW_LINK_METRIC_VALUE),
      showDeployments: displayOptionsSelected.includes(SHOW_DEPLOYMENTS) // a deployment is a group of processes in the same site that have the same function
    }
  });

  const panelContent = (
    <DrawerPanelContent isResizable minSize={`${MIN_DRAWER_WIDTH}px`} maxSize={`${MAX_DRAWER_WIDTH}px`}>
      <DrawerHead>
        <Title headingLevel="h1">{Labels.Details}</Title>
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
          resourcePlaceholder={Labels.FindProcesses}
          onResourceSelected={handleSearchText}
        />
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
                forceFitView={!!serviceIdsSelected}
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
