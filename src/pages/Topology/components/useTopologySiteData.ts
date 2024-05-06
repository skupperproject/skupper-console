import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { FlowDirection } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesSites } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../Topology.enum';

const linkQueryParams = { direction: FlowDirection.Outgoing };

interface UseSiteTopologyApiDataProps {
  idSelected?: string;
  showDataLink: boolean;
  showBytes: boolean;
  showByteRate: boolean;
  showLatency: boolean;
}

const useSiteTopologyApiData = ({
  idSelected,
  showDataLink,
  showBytes,
  showByteRate,
  showLatency
}: UseSiteTopologyApiDataProps) => {
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
                params: {
                  fetchBytes: { groupBy: 'destSite, sourceSite,direction' },
                  fetchByteRate: { groupBy: 'destSite, sourceSite,direction' },
                  fetchLatency: { groupBy: 'sourceSite, destSite' }
                }
              })
            : null,
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  //transform data
  let filteredPairs = sitesPairs;
  let filteredSites = sites;

  // check if in the UI we are displaying data links and the option "show only neighbours" is selected
  if (filteredPairs && idSelected) {
    filteredPairs = filteredPairs.filter((edge) => edge.sourceId === idSelected || edge.destinationId === idSelected);

    const siteIds = filteredPairs.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
    filteredSites = sites.filter(({ identity }) => siteIds.includes(identity));
  }

  return {
    sites: filteredSites,
    sitesPairs: filteredPairs,
    routerLinks,
    metrics
  };
};

export default useSiteTopologyApiData;
