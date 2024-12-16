import { useQueries, useSuspenseQueries } from '@tanstack/react-query';

import { gePrometheusQueryPATH } from '../../../API/Prometheus.utils';
import { getAllSitePairs } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { PairsResponse } from '../../../types/REST.interfaces';
import { TopologyController } from '../../Topology/services';

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceSiteId},${PrometheusLabelsV2.DestSiteId}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceSiteId},${PrometheusLabelsV2.DestSiteId}` },
  fetchLatency: { groupBy: `${PrometheusLabelsV2.SourceSiteId},${PrometheusLabelsV2.DestSiteId}` }
};

export const useSitePairsListData = (id: string) => {
  const queryParams = (idKey: keyof PairsResponse) => ({ [idKey]: id });

  const [{ data: metricsTx }, { data: metricsRx }] = useQueries({
    queries: [
      {
        queryKey: [gePrometheusQueryPATH('single'), id, { sourceSite: id }],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            metricQueryParams: {
              ...metricQueryParams,
              filterBy: { sourceSite: id }
            }
          }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [gePrometheusQueryPATH('single'), id, { destSite: id }],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            metricQueryParams: {
              ...metricQueryParams,
              filterBy: { destSite: id }
            }
          }),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const [{ data: pairsTx }, { data: pairsRx }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [getAllSitePairs(), queryParams('sourceId')],
        queryFn: () => RESTApi.fetchSitesPairs(queryParams('sourceId')),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [getAllSitePairs(), queryParams('destinationId')],
        queryFn: () => RESTApi.fetchSitesPairs(queryParams('destinationId')),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return { pairsTx: pairsTx.results, pairsRx: pairsRx.results, metricsTx, metricsRx };
};
