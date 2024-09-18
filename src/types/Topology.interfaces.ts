import { PrometheusLabelsV2 } from '@config/prometheus';

import { PrometheusMetric, PrometheusLabels } from './Prometheus.interfaces';
import { ProcessPairsResponse } from './REST.interfaces';

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

export interface TopologyDisplayOptionsMenu {
  title?: string;
  items: {
    key: string;
    value: string;
    label: string;
    isDisabled?: Function;
  }[];
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

export interface ProcessPairsWithMetrics {
  processesPairs: ProcessPairsResponse[];
  prometheusKey: PrometheusLabelsV2;
  processPairsKey: 'sourceName' | 'destinationName';
  metrics?: TopologyMetrics;
}

export interface ProcessPairsWithStats extends ProcessPairsResponse {
  bytes: number;
  byteRate: number;
  latency: number;
}
