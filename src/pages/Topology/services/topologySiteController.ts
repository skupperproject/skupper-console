import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { GraphEdge, GraphNode } from '../../../types/Graph.interfaces';
import { RouterLinkResponse, PairsResponse, SiteResponse } from '../../../types/REST.interfaces';
import { TopologyShowOptionsSelected, TopologyMetrics } from '../../../types/Topology.interfaces';

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

export const convertSiteToNode = ({ identity, name, siteVersion, platform, routerCount }: SiteResponse): GraphNode => ({
  type: 'SkNode',
  id: identity,
  name,
  label: siteVersion ? `${name} (${siteVersion})` : name,
  iconName: platform || 'site',
  info: {
    secondary: routerCount > 1 ? 'HA' : ''
  }
});

const convertSitesToNodes = (entities: SiteResponse[]): GraphNode[] => entities.map(convertSiteToNode);

const convertRouterLinksToEdges = (links: RouterLinkResponse[]): GraphEdge[] =>
  // Convert links to GraphEdge format
  links.map(({ sourceSiteId, destinationSiteId, sourceSiteName, destinationSiteName, identity, status }) => ({
    type: status === 'down' ? 'SkSiteEdgeDown' : status === 'partially_up' ? 'SkSiteEdgePartialDown' : 'SkSiteEdge',
    id: identity,
    source: sourceSiteId,
    sourceName: sourceSiteName,
    target: destinationSiteId || 'unknown',
    targetName: destinationSiteName
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
