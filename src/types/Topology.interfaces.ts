import { PrometheusMetric, PrometheusLabels } from './Prometheus.interfaces';

export interface TopologyMetrics {
  sourceToDestBytes: PrometheusMetric<'vector'>[];
  destToSourceBytes: PrometheusMetric<'vector'>[];
  sourceToDestByteRate: PrometheusMetric<'vector'>[];
  destToSourceByteRate: PrometheusMetric<'vector'>[];
  latencyByProcessPairs: PrometheusMetric<'vector'>[];
}

export interface TopologyConfigMetricsParams {
  fetchBytes: { groupBy: string };
  fetchByteRate: { groupBy: string };
  fetchLatency: { groupBy: string };
  filterBy?: PrometheusLabels;
}

export interface TopologyConfigMetrics {
  showBytes?: boolean;
  showByteRate?: boolean;
  showLatency?: boolean;
  metricQueryParams: {
    fetchBytes: { groupBy: string };
    fetchByteRate: { groupBy: string };
    fetchLatency: { groupBy: string };
    filterBy?: PrometheusLabels;
  };
}

export interface TopologyShowOptionsSelected {
  showLinkBytes: boolean;
  showLinkByteRate: boolean;
  showLinkLatency: boolean;
  showLinkProtocol: boolean;
  showDeployments: boolean;
  showInboundMetrics: boolean;
  showMetricDistribution: boolean;
  showMetricValue: boolean;
}
