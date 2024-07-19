import { composePrometheusSiteLabel } from '@API/Prometheus.utils';
import { LinkResponse, SitePairsResponse, SiteResponse } from '@API/REST.interfaces';
import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import SitesController from '@pages/Sites/services';

import { TopologyLabels } from '../Topology.enum';
import { DisplayOptions, TopologyMetrics } from '../Topology.interfaces';

import { TopologyController } from '.';

interface TopologySiteControllerProps {
  idsSelected: string[] | undefined;
  searchText: string;
  sites: SiteResponse[];
  routerLinks: LinkResponse[] | null;
  sitesPairs: SitePairsResponse[] | null;
  metrics: TopologyMetrics | null;
  options: DisplayOptions;
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
  entities.map(({ identity, name, siteVersion, platform }) => {
    const label = siteVersion ? `${name} (${siteVersion})` : name;

    return {
      id: identity,
      label,
      iconSrc: platform || 'site'
    };
  });

const convertRouterLinksToEdges = (sites: SiteResponse[], links: LinkResponse[]): GraphEdge[] => {
  const sitesWithLinks = SitesController.bindLinksWithSiteIds(sites, links);

  return sitesWithLinks.flatMap(({ identity: sourceId, linkSiteIds }) =>
    linkSiteIds.flatMap(({ targetId, linkCost }) => [
      {
        id: `${sourceId}-to${targetId}`,
        source: sourceId,
        target: targetId,
        label: linkCost !== undefined ? `${TopologyLabels.SiteLinkText} ${linkCost}` : '',
        type: 'SkSiteEdge'
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
      edges = TopologyController.convertPairsToEdges(sitesPairs);
      edges = addSiteMetricsToEdges(edges, metrics);
      // We skip edges within the same site as we're only interested in communication between different sites
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
