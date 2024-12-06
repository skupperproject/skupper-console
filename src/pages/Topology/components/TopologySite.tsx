import { ComponentType, FC, useCallback } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import { GraphEdge, GraphNode, SkGraphProps } from 'types/Graph.interfaces';

import TopologyToolbar from './TopologyToolbar';
import SkGraph from '../../../core/components/SkGraph';
import { SiteLabels, SitesRoutesPaths } from '../../Sites/Sites.enum';
import useTopologySiteData from '../hooks/useTopologySiteData';
import useTopologyState from '../hooks/useTopologyState';
import { TopologySiteController } from '../services/topologySiteController';
import {
  displayOptionsForSites,
  SHOW_DATA_LINKS,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_INBOUND_METRICS,
  SHOW_ROUTER_LINKS,
  SHOW_LINK_METRIC_VALUE,
  SHOW_DEPLOYMENTS,
  SHOW_LINK_METRIC_DISTRIBUTION
} from '../Topology.constants';
import { TopologyLabels } from '../Topology.enum';

const TopologySite: FC<{
  ids?: string[];
  GraphComponent?: ComponentType<SkGraphProps>;
  initDisplayOptionsEnabled?: string[];
}> = function ({
  ids,
  GraphComponent = SkGraph,
  initDisplayOptionsEnabled = [SHOW_ROUTER_LINKS, SHOW_LINK_METRIC_VALUE]
}) {
  const navigate = useNavigate();

  const { idsSelected, searchText, displayOptionsSelected, handleSearchText, handleDisplaySelected } = useTopologyState(
    {
      ids,
      initDisplayOptionsEnabled,
      //name of the configuration to be saved in the localstorage
      displayOptionsEnabledKey: 'display-site-options'
    }
  );

  const { sites, routerLinks, sitesPairs, metrics } = useTopologySiteData({
    showDataLink: displayOptionsSelected.includes(SHOW_DATA_LINKS),
    showBytes: displayOptionsSelected.includes(SHOW_LINK_BYTES),
    showByteRate: displayOptionsSelected.includes(SHOW_LINK_BYTERATE)
  });

  const handleShowDetails = useCallback(
    (data: GraphNode | null) => {
      const id = data?.id;

      if (id) {
        navigate(`${SitesRoutesPaths.Sites}/${data.name}@${id}`);
      }
    },
    [navigate]
  );

  const handleShowLinkDetails = (data: GraphEdge | null) => {
    if (data) {
      const type = data.type === 'SkSiteEdge' ? SiteLabels.Links : SiteLabels.Pairs;
      navigate(`${SitesRoutesPaths.Sites}/${data.sourceName}@${data.source}?type=${type}`);
    }
  };

  const { nodes, edges, nodeIdSelected, nodeIdsToHighLight } = TopologySiteController.siteDataTransformer({
    idsSelected,
    searchText,
    sites,
    sitesPairs,
    routerLinks,
    metrics,
    options: {
      showLinkBytes: displayOptionsSelected.includes(SHOW_LINK_BYTES),
      showLinkByteRate: displayOptionsSelected.includes(SHOW_LINK_BYTERATE),
      showInboundMetrics: displayOptionsSelected.includes(SHOW_INBOUND_METRICS),
      showMetricDistribution: displayOptionsSelected.includes(SHOW_LINK_METRIC_DISTRIBUTION),
      showMetricValue: displayOptionsSelected.includes(SHOW_LINK_METRIC_VALUE),
      showDeployments: displayOptionsSelected.includes(SHOW_DEPLOYMENTS) // a deployment is a group of processes in the same site that have the same function
    }
  });

  return (
    <Stack>
      <StackItem>
        <TopologyToolbar
          displayOptions={displayOptionsForSites}
          onDisplayOptionSelected={handleDisplaySelected}
          defaultDisplayOptionsSelected={displayOptionsSelected}
          resourcePlaceholder={TopologyLabels.DisplaySitesDefaultLabel}
          onResourceSelected={handleSearchText}
        />
      </StackItem>

      <StackItem isFilled>
        <GraphComponent
          nodes={nodes}
          edges={edges}
          itemSelected={nodeIdSelected}
          itemsToHighlight={nodeIdsToHighLight}
          onClickNode={handleShowDetails}
          onClickEdge={handleShowLinkDetails}
        />
      </StackItem>
    </Stack>
  );
};

export default TopologySite;
