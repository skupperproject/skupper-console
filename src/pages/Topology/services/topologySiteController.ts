import { PrometheusLabelsV2 } from '@config/prometheus';
import { GraphEdge, GraphNode } from '@sk-types/Graph.interfaces';
import { RouterLinkResponse, PairsResponse, SiteResponse } from '@sk-types/REST.interfaces';
import { TopologyShowOptionsSelected, TopologyMetrics } from '@sk-types/Topology.interfaces';

import { TopologyController } from '.';

interface TopologySiteControllerProps {
  idsSelected: string[] | undefined;
  searchText: string;
  sites: SiteResponse[];
  routerLinks?: RouterLinkResponse[];
  sitesPairs?: PairsResponse[];
  metrics: TopologyMetrics | null;
  options: TopologyShowOptionsSelected;
}

const convertSitesToNodes = (entities: SiteResponse[]): GraphNode[] =>
  entities.map(({ identity, name, siteVersion, platform, routerCount }) => ({
    type: 'SkNode',
    id: identity,
    label: siteVersion ? `${name} (${siteVersion})` : name,
    iconName: platform || 'site',
    info: {
      secondary: routerCount > 1 ? 'HA' : ''
    }
  }));

const convertRouterLinksToEdges = (links: RouterLinkResponse[]): GraphEdge[] =>
  // Convert links to GraphEdge format
  links.map(({ sourceSiteId, destinationSiteId, identity, status }) => ({
    type: status === 'down' ? 'SkSiteEdgeDown' : status === 'partially_up' ? 'SkSiteEdgePartialDown' : 'SkSiteEdge',
    id: identity,
    source: sourceSiteId,
    target: destinationSiteId || 'unknown'
  }));
export const TopologySiteController = {
  siteDataTransformer: ({
    idsSelected,
    searchText,
    sites,
    routerLinks,
    sitesPairs,
    metrics,
    options
  }: TopologySiteControllerProps) => {
    let edges: GraphEdge[] = [];

    if (sitesPairs) {
      edges = TopologyController.convertPairsToEdges(sitesPairs, 'SkDataEdge');
      edges = TopologyController.addMetricsToEdges(
        edges,
        PrometheusLabelsV2.SourceSiteName,
        PrometheusLabelsV2.DestSiteName,
        undefined, // no need to retrieve protocols
        metrics
      );
      edges = TopologyController.addLabelToEdges(edges, options);
    } else if (routerLinks) {
      edges = convertRouterLinksToEdges(routerLinks);
    }

    const nodes = convertSitesToNodes(sites);

    return {
      nodeIdSelected: TopologyController.transformIdsToStringIds(idsSelected),
      nodeIdsToHighLight: TopologyController.nodesToHighlight(nodes, searchText),
      nodes,
      edges
    };
  }
};
