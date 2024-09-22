import { ComponentType, FC, useCallback } from 'react';

import { Divider, Stack, StackItem } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

import SkGraph from '@core/components/SkGraph';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { SkGraphProps } from 'types/Graph.interfaces';

import TopologyToolbar from './TopologyToolbar';
import useTopologySiteData from '../hooks/useTopologySiteData';
import useTopologyState from '../hooks/useTopologyState';
import { TopologySiteController } from '../services/topologySiteController';
import {
  displayOptionsForSites,
  SHOW_DATA_LINKS,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_INBOUND_METRICS,
  SHOW_ROUTER_LINKS,
  SHOW_LINK_METRIC_VALUE,
  SHOW_DEPLOYMENTS,
  SHOW_LINK_PROTOCOL,
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
    showByteRate: displayOptionsSelected.includes(SHOW_LINK_BYTERATE),
    showLatency: displayOptionsSelected.includes(SHOW_LINK_LATENCY)
  });

  const handleShowDetails = useCallback(
    (id: string) => {
      const site = sites.find(({ identity }) => identity === id);

      if (site) {
        navigate(`${SitesRoutesPaths.Sites}/${site?.name}@${id}`);
      }
    },
    [navigate, sites]
  );

  const { nodes, edges, nodeIdSelected, nodeIdsToHighLight } = TopologySiteController.siteDataTransformer({
    idsSelected,
    searchText,
    sites,
    sitesPairs,
    routerLinks,
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
        <Divider />
      </StackItem>

      <StackItem isFilled>
        <GraphComponent
          nodes={nodes}
          edges={edges}
          itemSelected={nodeIdSelected}
          itemsToHighlight={nodeIdsToHighLight}
          onClickNode={handleShowDetails}
        />
      </StackItem>
    </Stack>
  );
};

export default TopologySite;
