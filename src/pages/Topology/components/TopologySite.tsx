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
  SHOW_LINK_REVERSE_LABEL
} from '../Topology.constants';
import { TopologyLabels } from '../Topology.enum';

const TopologySite: FC<{ id?: string[]; GraphComponent?: ComponentType<GraphReactAdaptorProps> }> = function ({
  id,
  GraphComponent = GraphReactAdaptor
}) {
  const navigate = useNavigate();
  const graphRef = useRef<GraphReactAdaptorExposedMethods>();
  const toastRef = useRef<ToastExposeMethods>(null);

  const {
    idSelected,
    showOnlyNeighbours,
    moveToNodeSelected,
    displayOptionsSelected,
    handleSelected,
    handleShowOnlyNeighbours,
    handleMoveToNodeSelectedChecked,
    handleDisplaySelected
  } = useTopologyState({ id });

  const { sites, routerLinks, sitesPairs, metrics } = useTopologySiteData({
    idSelected: showOnlyNeighbours ? idSelected : undefined,
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

  const handleSavePositions = useCallback(() => {
    graphRef?.current?.saveNodePositions();
    toastRef.current?.addMessage(TopologyLabels.ToastSave);
  }, [graphRef, toastRef]);

  const { nodes, edges, nodeIdSelected } = TopologySiteController.siteDataTransformer({
    idSelected,
    sites,
    sitesPairs,
    routerLinks,
    metrics,
    showLinkLabelReverse: displayOptionsSelected.includes(SHOW_LINK_REVERSE_LABEL),
    rotateLabel: displayOptionsSelected.includes(ROTATE_LINK_LABEL)
  });

  return (
    <>
      <Stack>
        <StackItem>
          <TopologyToolbar
            nodes={nodes}
            onSelected={handleSelectedWrapper}
            displayOptions={displayOptionsForSites}
            onDisplayOptionSelected={handleDisplaySelected}
            defaultDisplayOptionsSelected={displayOptionsSelected}
            nodeIdSelected={nodeIdSelected}
            showOnlyNeighbours={showOnlyNeighbours}
            onShowOnlyNeighboursChecked={handleShowOnlyNeighboursChecked}
            moveToNodeSelected={moveToNodeSelected}
            onMoveToNodeSelectedChecked={handleMoveToNodeSelectedChecked}
            onSaveTopology={handleSavePositions}
            linkToPage={SitesRoutesPaths.Sites}
            resourcePlaceholder={TopologyLabels.DisplaySitesDefaultLabel}
          />
          <Divider />
        </StackItem>

        <StackItem isFilled>
          <GraphComponent
            ref={graphRef}
            nodes={nodes}
            edges={edges}
            itemSelected={nodeIdSelected}
            onClickNode={handleShowDetails}
            layout={showOnlyNeighbours && idSelected ? LAYOUT_TOPOLOGY_SINGLE_NODE : LAYOUT_TOPOLOGY_DEFAULT}
            moveToSelectedNode={moveToNodeSelected && !!idSelected && !showOnlyNeighbours}
          />
        </StackItem>
      </Stack>
      <AlertToasts ref={toastRef} />
    </>
  );
};

export default TopologySite;
