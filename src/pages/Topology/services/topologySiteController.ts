import { PrometheusLabelsV2 } from '@config/prometheus';
import { GraphEdge, GraphNode } from '@sk-types/Graph.interfaces';
import { RouterLinkResponse, PairsResponse, SiteResponse } from '@sk-types/REST.interfaces';
import { TopologyShowOptionsSelected, TopologyMetrics } from '@sk-types/Topology.interfaces';

import { TopologyLabels } from '../Topology.enum';

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
  entities.map(({ identity, name, siteVersion, platform }) => ({
    type: 'SkNode',
    id: identity,
    label: siteVersion ? `${name} (${siteVersion})` : name,
    iconName: platform || 'site'
  }));

const convertRouterLinksToEdges = (links: RouterLinkResponse[]): GraphEdge[] => {
  // Helper function to create the unique key for source and destination
  const createKey = (source: string, destination: string | null) => `${source}-${destination}`;

  // Group edges by source and destination, storing only the count of edges
  const edgeGroupMap = links.reduce(
    (acc, { sourceSiteId, destinationSiteId }) => {
      const key = createKey(sourceSiteId, destinationSiteId);
      acc[key] = (acc[key] || 0) + 1;

      return acc;
    },
    {} as Record<string, number>
  );

  // Convert links to GraphEdge format
  return links.map(({ sourceSiteId, destinationSiteId, cost, identity }) => {
    const key = createKey(sourceSiteId, destinationSiteId);
    const edgeCount = edgeGroupMap[key];

    return {
      type: 'SkSiteEdge',
      id: identity,
      source: sourceSiteId,
      target: destinationSiteId || 'unknown',
      label: cost ? `${TopologyLabels.SiteLinkText} ${cost}` : '',
      secondarylabel: edgeCount > 1 ? `${edgeCount}` : ''
    };
  });
};

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
