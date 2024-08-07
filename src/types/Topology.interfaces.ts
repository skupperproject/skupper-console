import { PrometheusMetric, PrometheusLabels } from './Prometheus.interfaces';
import { ProcessPairsResponse } from './REST.interfaces';

export interface TopologyMetrics {
  bytesByProcessPairs: PrometheusMetric<'vector'>[];
  byteRateByProcessPairs: PrometheusMetric<'vector'>[];
  latencyByProcessPairs: PrometheusMetric<'vector'>[];
}

export interface TopologyConfigMetrics {
  showBytes?: boolean;
  showByteRate?: boolean;
  showLatency?: boolean;
  params: {
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
  processesPairs?: ProcessPairsResponse[];
  metrics?: TopologyMetrics;
  prometheusKey: 'sourceProcess' | 'destProcess';
  processPairsKey: 'sourceName' | 'destinationName';
}
