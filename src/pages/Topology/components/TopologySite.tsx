import { ComponentType, FC, useCallback, useRef } from 'react';

import { Divider, Stack, StackItem } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { LAYOUT_TOPOLOGY_DEFAULT, LAYOUT_TOPOLOGY_SINGLE_NODE } from '@core/components/Graph/Graph.constants';
import { GraphReactAdaptorExposedMethods, GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import AlertToasts, { ToastExposeMethods } from './TopologyToasts';
import TopologyToolbar from './TopologyToolbar';
import useTopologySiteData from './useTopologySiteData';
import useTopologyState from './useTopologyState';
import { TopologyController } from '../services';
import { TopologySiteController } from '../services/topologySiteController';
import {
  displayOptionsForSites,
  ROTATE_LINK_LABEL,
  SHOW_DATA_LINKS,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_LINK_REVERSE_LABEL,
  SHOW_ROUTER_LINKS
} from '../Topology.constants';
import { TopologyLabels } from '../Topology.enum';

const TopologySite: FC<{ ids?: string[]; GraphComponent?: ComponentType<GraphReactAdaptorProps> }> = function ({
  ids,
  GraphComponent = GraphReactAdaptor
}) {
  const navigate = useNavigate();
  const graphRef = useRef<GraphReactAdaptorExposedMethods>();
  const toastRef = useRef<ToastExposeMethods>(null);

  const {
    idsSelected,
    showOnlyNeighbours,
    moveToNodeSelected,
    displayOptionsSelected,
    handleSelected,
    handleShowOnlyNeighbours,
    handleMoveToNodeSelectedChecked,
    handleDisplaySelected
  } = useTopologyState({
    ids,
    initDisplayOptionsEnabled: [SHOW_ROUTER_LINKS],
    displayOptionsEnabledKey: 'display-site-options'
  });

  const { sites, routerLinks, sitesPairs, metrics } = useTopologySiteData({
    idsSelected: showOnlyNeighbours ? idsSelected : undefined,
    showDataLink: displayOptionsSelected.includes(SHOW_DATA_LINKS),
    showBytes: displayOptionsSelected.includes(SHOW_LINK_BYTES),
    showByteRate: displayOptionsSelected.includes(SHOW_LINK_BYTERATE),
    showLatency: displayOptionsSelected.includes(SHOW_LINK_LATENCY)
  });

  const handleShowDetails = useCallback(
    (siteId: string) => {
      const site = sites?.find(({ identity }) => identity === siteId);
      navigate(`${SitesRoutesPaths.Sites}/${site?.name}@${siteId}`);
    },
    [navigate, sites]
  );

  const handleSelectedWrapper = useCallback(
    (siteId?: string) => {
      handleSelected(TopologyController.transformStringIdsToIds(siteId));
    },
    [handleSelected]
  );

  const handleShowOnlyNeighboursChecked = useCallback(
    (checked: boolean) => {
      handleShowOnlyNeighbours(checked);
      checked && graphRef?.current?.saveNodePositions();
    },
    [graphRef, handleShowOnlyNeighbours]
  );

  const { nodes, edges, nodeIdSelected } = TopologySiteController.siteDataTransformer({
    idsSelected,
    sites,
    sitesPairs,
    routerLinks,
    metrics,
    options: {
      showLinkBytes: displayOptionsSelected.includes(SHOW_LINK_BYTES),
      showLinkLatency: displayOptionsSelected.includes(SHOW_LINK_LATENCY),
      showLinkByteRate: displayOptionsSelected.includes(SHOW_LINK_BYTERATE),
      showLinkLabelReverse: displayOptionsSelected.includes(SHOW_LINK_REVERSE_LABEL),
      rotateLabel: displayOptionsSelected.includes(ROTATE_LINK_LABEL)
    }
  });

  return (
    <>
      <Stack>
        <StackItem>
          <TopologyToolbar
            displayOptions={displayOptionsForSites}
            onDisplayOptionSelected={handleDisplaySelected}
            defaultDisplayOptionsSelected={displayOptionsSelected}
            showOnlyNeighbours={showOnlyNeighbours}
            onShowOnlyNeighboursChecked={handleShowOnlyNeighboursChecked}
            moveToNodeSelected={moveToNodeSelected}
            onMoveToNodeSelectedChecked={handleMoveToNodeSelectedChecked}
            resourceIdSelected={nodeIdSelected}
            resourceOptions={nodes.map((node) => ({ name: node.label, identity: node.id }))}
            resourcePlaceholder={TopologyLabels.DisplaySitesDefaultLabel}
            onResourceSelected={handleSelectedWrapper}
          />
          <Divider />
        </StackItem>

        <StackItem isFilled>
          {showOnlyNeighbours && (
            <GraphComponent
              ref={graphRef}
              nodes={nodes}
              edges={edges}
              itemSelected={nodeIdSelected}
              layout={LAYOUT_TOPOLOGY_SINGLE_NODE}
              savePositions={false}
            />
          )}

          {!showOnlyNeighbours && (
            <GraphComponent
              ref={graphRef}
              nodes={nodes}
              edges={edges}
              itemSelected={nodeIdSelected}
              onClickNode={handleShowDetails}
              layout={LAYOUT_TOPOLOGY_DEFAULT}
              moveToSelectedNode={moveToNodeSelected && !!idsSelected}
            />
          )}
        </StackItem>
      </Stack>
      <AlertToasts ref={toastRef} />
    </>
  );
};

export default TopologySite;
