import { PrometheusLabelsV2 } from '@config/prometheus';
import { GraphEdge, GraphNode } from '@sk-types/Graph.interfaces';
import { RouterLinkResponse, SitePairsResponse, SiteResponse } from '@sk-types/REST.interfaces';
import { TopologyShowOptionsSelected, TopologyMetrics } from '@sk-types/Topology.interfaces';

import { TopologyLabels } from '../Topology.enum';

import { TopologyController } from '.';

interface TopologySiteControllerProps {
  idsSelected: string[] | undefined;
  searchText: string;
  sites: SiteResponse[];
  routerLinks?: RouterLinkResponse[];
  sitesPairs?: SitePairsResponse[];
  metrics: TopologyMetrics | null;
  options: TopologyShowOptionsSelected;
}

const convertSitesToNodes = (entities: SiteResponse[]): GraphNode[] =>
  entities.map(({ identity, name, siteVersion, platform }) => ({
    type: 'SkNode',
    id: identity,
    label: siteVersion ? `${name} (${siteVersion})` : name,
    iconName: platform || 'site'
  }));

const convertRouterLinksToEdges = (links: RouterLinkResponse[]): GraphEdge[] =>
  links.map(({ sourceSiteId, destinationSiteId, cost }) => ({
    type: 'SkSiteEdge',
    id: `${sourceSiteId}-to${destinationSiteId}`,
    source: sourceSiteId,
    target: destinationSiteId || 'unknown',
    label: cost ? `${TopologyLabels.SiteLinkText} ${cost}` : ''
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
      edges = TopologyController.convertPairsToEdges(sitesPairs, 'SkSiteDataEdge');
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
