import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { FlowDirection } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesSites } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../Topology.enum';

const linkQueryParams = { direction: FlowDirection.Outgoing };

interface UseTopologySiteDataProps {
  idSelected?: string[];
  showDataLink: boolean;
  showBytes: boolean;
  showByteRate: boolean;
  showLatency: boolean;
}

const metricQueryParams = {
  fetchBytes: { groupBy: 'destSite, sourceSite,direction' },
  fetchByteRate: { groupBy: 'destSite, sourceSite,direction' },
  fetchLatency: { groupBy: 'sourceSite, destSite' }
};

const useTopologySiteData = ({
  idSelected,
  showDataLink,
  showBytes,
  showByteRate,
  showLatency
}: UseTopologySiteDataProps) => {
  const [{ data: sites }, { data: routerLinks }, { data: sitesPairs }, { data: metrics }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesSites.GetSites],
        queryFn: () => RESTApi.fetchSites(),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesSites.GetLinks, linkQueryParams, showDataLink],
        queryFn: () => (!showDataLink ? RESTApi.fetchLinks(linkQueryParams) : null),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesTopology.GetSitesPairs, showDataLink],
        queryFn: () => (showDataLink ? RESTApi.fetchSitesPairs() : null),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesTopology.GetBytesByProcessPairs, showBytes, showByteRate, showLatency, showDataLink],
        queryFn: () =>
          showDataLink
            ? TopologyController.getTopologyMetrics({
                showBytes,
                showByteRate,
                showLatency,
                params: metricQueryParams
              })
            : null,
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  let filteredRrouterLinks = routerLinks;
  let filteredPairs = sitesPairs;
  let filteredSites = sites;

  if (idSelected) {
    if (filteredPairs) {
      filteredPairs = filteredPairs.filter(
        (edge) => idSelected.includes(edge.sourceId) || idSelected.includes(edge.destinationId)
      );

      const idsFromEdges = filteredPairs.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
      const uniqueIds = [...new Set(idSelected.concat(idsFromEdges))];

      filteredSites = filteredSites.filter(({ identity }) => uniqueIds.includes(identity));
    }

    if (filteredRrouterLinks) {
      filteredRrouterLinks = filteredRrouterLinks.filter(
        (edge) => idSelected.includes(edge.sourceSiteId) || idSelected.includes(edge.destinationSiteId)
      );

      const idsFromEdges = filteredRrouterLinks.flatMap(({ sourceSiteId, destinationSiteId }) => [
        sourceSiteId,
        destinationSiteId
      ]);
      const uniqueIds = [...new Set(idSelected.concat(idsFromEdges))];

      filteredSites = filteredSites.filter(({ identity }) => uniqueIds.includes(identity));
    }
  }

  return {
    sites: filteredSites,
    sitesPairs: filteredPairs,
    routerLinks: filteredRrouterLinks,
    metrics
  };
};

export default useTopologySiteData;
