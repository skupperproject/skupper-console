import { ModelStyle } from '@antv/g6';

import { PrometheusApiSingleResult } from '@API/Prometheus.interfaces';

export interface Entity {
  id: string;
  comboId?: string;
  label: string;
  img: string;
  nodeConfig?: ModelStyle;
}

export interface TopologyMetrics {
  bytesByProcessPairs: PrometheusApiSingleResult[];
  byteRateByProcessPairs: PrometheusApiSingleResult[];
  latencyByProcessPairs: PrometheusApiSingleResult[];
}

export interface TopologyMetricsMetrics {
  showBytes?: boolean;
  showByteRate?: boolean;
  showLatency?: boolean;
  params: {
    fetchBytes: { groupBy: string };
    fetchByteRate: { groupBy: string };
    fetchLatency: { groupBy: string };
  };
}
