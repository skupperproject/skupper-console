import { ModelStyle } from '@antv/g6';

import { PrometheusApiSingleResult } from '@API/Prometheus.interfaces';

export interface Entity {
  id: string;
  comboId?: string;
  groupId?: string;
  groupName?: string;
  label: string;
  iconFileName: string;
  iconProps?: { show: boolean; width: number; height: number };
  nodeConfig?: ModelStyle;
}

export interface TopologyMetrics {
  bytesByProcessPairs: PrometheusApiSingleResult[];
  byteRateByProcessPairs: PrometheusApiSingleResult[];
  latencyByProcessPairs: PrometheusApiSingleResult[];
}

export interface TopologyConfigMetrics {
  showBytes?: boolean;
  showByteRate?: boolean;
  showLatency?: boolean;
  params: {
    fetchBytes: { groupBy: string };
    fetchByteRate: { groupBy: string };
    fetchLatency: { groupBy: string };
  };
}

export interface DisplaySelectProps {
  key: string;
  value: string;
  label: string;
  isDisabled?: Function;
  addSeparator?: boolean;
}

export interface DisplayOptions {
  showLinkProtocol?: boolean;
  showLinkBytes?: boolean;
  showLinkByteRate?: boolean;
  showLinkLatency?: boolean;
  showLinkLabelReverse?: boolean;
  rotateLabel?: boolean;
}
