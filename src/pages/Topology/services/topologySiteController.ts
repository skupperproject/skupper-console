import { composePrometheusSiteLabel } from '@API/Prometheus.utils';
import SitesController from '@pages/Sites/services';
import { GraphEdge, GraphNode } from '@sk-types/Graph.interfaces';
import { LinkResponse, SitePairsResponse, SiteResponse } from '@sk-types/REST.interfaces';
import { TopologyShowOptionsSelected, TopologyMetrics } from '@sk-types/Topology.interfaces';

import { TopologyLabels } from '../Topology.enum';

import { TopologyController } from '.';

interface TopologySiteControllerProps {
  idsSelected: string[] | undefined;
  searchText: string;
  sites: SiteResponse[];
  routerLinks: LinkResponse[] | null;
  sitesPairs: SitePairsResponse[] | null;
  metrics: TopologyMetrics | null;
  options: TopologyShowOptionsSelected;
}

const addSiteMetricsToEdges = (links: GraphEdge[], metrics: TopologyMetrics | null) => {
  const sanitizedLinks = links.map((link) => ({
    ...link,
    //name@_@id format
    sourceName: composePrometheusSiteLabel(link.sourceName, link.source),
    targetName: composePrometheusSiteLabel(link.targetName, link.target)
  }));

  return TopologyController.addMetricsToEdges(
    sanitizedLinks,
    'sourceSite',
    'destSite',
    undefined, // no need to retrieve protocols
    metrics?.bytesByProcessPairs,
    metrics?.byteRateByProcessPairs,
    metrics?.latencyByProcessPairs
  );
};

const convertSitesToNodes = (entities: SiteResponse[]): GraphNode[] =>
  entities.map(({ identity, name, siteVersion, platform }) => ({
    type: 'SkNode',
    id: identity,
    label: siteVersion ? `${name} (${siteVersion})` : name,
    iconName: platform || 'site'
  }));

const convertRouterLinksToEdges = (sites: SiteResponse[], links: LinkResponse[]): GraphEdge[] => {
  const sitesWithLinks = SitesController.bindLinksWithSiteIds(sites, links);

  return sitesWithLinks.flatMap(({ identity: sourceId, linkSiteIds }) =>
    linkSiteIds.flatMap(({ targetId, linkCost }) => [
      {
        type: 'SkSiteEdge',
        id: `${sourceId}-to${targetId}`,
        source: sourceId,
        target: targetId,
        label: linkCost !== undefined ? `${TopologyLabels.SiteLinkText} ${linkCost}` : ''
      }
    ])
  );
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
      TopologyController.transformIdsToStringIds(idsSelected);
      edges = TopologyController.convertPairsToEdges(sitesPairs, 'SkSiteDataEdge');
      edges = addSiteMetricsToEdges(edges, metrics);
      edges = TopologyController.configureEdges(edges, options);
    } else if (routerLinks) {
      edges = convertRouterLinksToEdges(sites, routerLinks);
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
