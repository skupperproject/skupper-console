import { ModelStyle } from '@antv/g6';

import { PrometheusApiSingleResult, PrometheusLabels } from '@API/Prometheus.interfaces';
import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';

export interface Entity {
  id: string;
  comboId?: string;
  comboName?: string;
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
    filterBy?: PrometheusLabels;
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

export interface TopologyModalProps {
  ids?: string;
  items: ProcessResponse[] | ProcessPairsResponse[];
  modalType: 'process' | 'processPair' | undefined;
  onClose?: Function;
}

export interface ProcessPairsWithMetrics {
  processesPairs?: ProcessPairsResponse[];
  metrics?: TopologyMetrics;
  prometheusKey: 'sourceProcess' | 'destProcess';
  processPairsKey: 'sourceName' | 'destinationName';
}
