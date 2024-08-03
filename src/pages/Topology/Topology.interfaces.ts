import { PrometheusMetric, PrometheusLabels } from '@API/Prometheus.interfaces';
import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import { CustomItemsProps, GraphIconKeys } from '@core/components/SkGraph/Graph.interfaces';

export interface Entity {
  id: string;
  combo?: string;
  comboName?: string;
  groupId?: string;
  groupName?: string;
  label: string;
  iconName: GraphIconKeys;
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
  title?: string;
  items: {
    key: string;
    value: string;
    label: string;
    isDisabled?: Function;
  }[];
}

export interface DisplayOptions {
  showLinkBytes: boolean;
  showLinkByteRate: boolean;
  showLinkLatency: boolean;
  showLinkProtocol: boolean;
  showDeployments: boolean;
  showInboundMetrics: boolean;
  showMetricDistribution: boolean;
  showMetricValue: boolean;
}

export interface NodeOrEdgeListProps {
  ids?: string[];
  items: ProcessResponse[] | ProcessPairsResponse[];
  metrics: TopologyMetrics;
  modalType: 'process' | 'processPair';
}

export interface ProcessPairsWithMetrics {
  processesPairs?: ProcessPairsResponse[];
  metrics?: TopologyMetrics;
  prometheusKey: 'sourceProcess' | 'destProcess';
  processPairsKey: 'sourceName' | 'destinationName';
}
