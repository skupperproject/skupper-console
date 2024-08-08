import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { Direction } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesSites } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../Topology.enum';

const linkQueryParams = { direction: Direction.Outgoing };

interface UseTopologySiteDataProps {
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

const useTopologySiteData = ({ showDataLink, showBytes, showByteRate, showLatency }: UseTopologySiteDataProps) => {
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

  return {
    sites,
    sitesPairs,
    routerLinks,
    metrics
  };
};

export default useTopologySiteData;
