import { PrometheusMetric, PrometheusLabels } from '@API/Prometheus.interfaces';
import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import { CustomItemsProps } from '@core/components/Graph/Graph.interfaces';

export interface Entity {
  id: string;
  combo?: string;
  comboName?: string;
  groupId?: string;
  groupName?: string;
  label: string;
  iconSrc: string;
  type?: CustomItemsProps;
  groupedNodeCount?: number;
}

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

export interface DisplaySelectProps {
  key: string;
  value: string;
  label: string;
  isDisabled?: Function;
}

export interface DisplayOptions {
  showLinkProtocol?: boolean;
  showLinkBytes?: boolean;
  showLinkByteRate?: boolean;
  showLinkLatency?: boolean;
  showLinkLabelReverse?: boolean;
  rotateLabel?: boolean;
}

export interface NodeOrEdgeListProps {
  ids?: string[];
  items: ProcessResponse[] | ProcessPairsResponse[];
  metrics: TopologyMetrics | null;
  modalType: 'process' | 'processPair';
}

export interface ProcessPairsWithMetrics {
  processesPairs?: ProcessPairsResponse[];
  metrics?: TopologyMetrics;
  prometheusKey: 'sourceProcess' | 'destProcess';
  processPairsKey: 'sourceName' | 'destinationName';
}
