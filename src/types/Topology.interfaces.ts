import { PrometheusMetric, PrometheusLabels } from './Prometheus.interfaces';

export interface TopologyMetrics {
  sourceToDestBytes: PrometheusMetric<'vector'>[];
  destToSourceBytes: PrometheusMetric<'vector'>[];
  sourceToDestByteRate: PrometheusMetric<'vector'>[];
  destToSourceByteRate: PrometheusMetric<'vector'>[];
}

export interface TopologyConfigMetricsParams {
  fetchBytes: { groupBy: string };
  fetchByteRate: { groupBy: string };
  filterBy?: PrometheusLabels;
}

export interface TopologyConfigMetrics {
  showBytes?: boolean;
  showByteRate?: boolean;
  metricQueryParams: {
    fetchBytes: { groupBy: string };
    fetchByteRate: { groupBy: string };
    filterBy?: PrometheusLabels;
  };
}

export interface TopologyShowOptionsSelected {
  showLinkBytes: boolean;
  showLinkByteRate: boolean;
  showDeployments: boolean;
  showMetricDistribution: boolean;
  showMetricValue: boolean;
}
