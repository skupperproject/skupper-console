import { useSuspenseQueries } from '@tanstack/react-query';

import { gePrometheusQueryPATH } from '../../../API/Prometheus.utils';
import { getAllLinks, getAllSitePairs, getAllSites } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { TopologyController } from '../services';

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceSiteId},${PrometheusLabelsV2.DestSiteId}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceSiteId},${PrometheusLabelsV2.DestSiteId}` },
  fetchLatency: {
    groupBy: `${PrometheusLabelsV2.SourceSiteId},${PrometheusLabelsV2.DestSiteId},${PrometheusLabelsV2.Direction}`
  }
};

const useTopologySiteData = ({ showDataLink }: { showDataLink: boolean }) => {
  const [{ data: sites }, { data: routerLinks }, { data: sitesPairs }, { data: metrics }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [getAllSites()],
        queryFn: () => RESTApi.fetchSites(),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [getAllLinks(), showDataLink],
        queryFn: () => (!showDataLink ? RESTApi.fetchLinks() : null),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [getAllSitePairs(), showDataLink],
        queryFn: () => (showDataLink ? RESTApi.fetchSitesPairs() : null),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [gePrometheusQueryPATH('single'), metricQueryParams, showDataLink],
        queryFn: () =>
          showDataLink
            ? TopologyController.getAllTopologyMetrics({
                showBytes: true,
                showByteRate: true,
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
