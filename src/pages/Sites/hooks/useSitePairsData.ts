import { useQueries, useSuspenseQueries } from '@tanstack/react-query';

import { gePrometheusQueryPATH } from '../../../API/Prometheus.utils';
import { getAllSitePairs } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { PrometheusLabelsV2 } from '../../../config/prometheus';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { PairsResponse } from '../../../types/REST.interfaces';
import { TopologyController } from '../../Topology/services';

const metricQueryParams = {
  fetchBytes: { groupBy: `${PrometheusLabelsV2.SourceSiteName},${PrometheusLabelsV2.DestSiteName}` },
  fetchByteRate: { groupBy: `${PrometheusLabelsV2.SourceSiteName},${PrometheusLabelsV2.DestSiteName}` },
  fetchLatency: { groupBy: `${PrometheusLabelsV2.SourceSiteName},${PrometheusLabelsV2.DestSiteName}` }
};

export const useSitePairsListData = (id: string, name: string) => {
  const queryParams = (idKey: keyof PairsResponse) => ({ [idKey]: id });

  const [{ data: metricsTx }, { data: metricsRx }] = useQueries({
    queries: [
      {
        queryKey: [gePrometheusQueryPATH('single'), id, { sourceSite: name }],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            metricQueryParams: {
              ...metricQueryParams,
              filterBy: { sourceSite: name }
            }
          }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [gePrometheusQueryPATH('single'), id, { destSite: name }],
        queryFn: () =>
          TopologyController.getAllTopologyMetrics({
            showBytes: true,
            showByteRate: true,
            showLatency: true,
            metricQueryParams: {
              ...metricQueryParams,
              filterBy: { destSite: name }
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
