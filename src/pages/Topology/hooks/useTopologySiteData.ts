import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import { QueriesSites } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';
import { QueriesPairs } from '../Topology.enum';

interface UseTopologySiteDataProps {
  showDataLink: boolean;
  showBytes: boolean;
  showByteRate: boolean;
  showLatency: boolean;
}

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceSiteName},${PrometheusLabelsV2.DestSiteName}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceSiteName},${PrometheusLabelsV2.DestSiteName}` },
  fetchLatency: {
    groupBy: `${PrometheusLabelsV2.SourceSiteName},${PrometheusLabelsV2.DestSiteName},${PrometheusLabelsV2.Direction}`
  }
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
        queryKey: [QueriesSites.GetLinks, showDataLink],
        queryFn: () => (!showDataLink ? RESTApi.fetchLinks() : null),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesPairs.GetSitesPairs, showDataLink],
        queryFn: () => (showDataLink ? RESTApi.fetchSitesPairs() : null),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesPairs.GetMetricsByPairs, showBytes, showByteRate, showLatency, showDataLink],
        queryFn: () =>
          showDataLink
            ? TopologyController.getAllTopologyMetrics({
                showBytes,
                showByteRate,
                showLatency,
                metricQueryParams
              })
            : null,
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return {
    sites: sites.results,
    sitesPairs: sitesPairs?.results,
    routerLinks: routerLinks?.results,
    metrics
  };
};

export default useTopologySiteData;
