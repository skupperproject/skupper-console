import { IntervalTimeProp } from '@API/Prometheus.interfaces';
import { AvailableProtocols } from '@API/REST.enum';

interface ConfigMetricFilters {
  sourceSites?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  destSites?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  destinationProcesses?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  sourceProcesses?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  protocols?: { disabled?: boolean; placeholder?: string };
  timeIntervals?: { disabled?: boolean };
}

export enum QueriesMetrics {
  GetTraffic = 'get-metric-traffic-query',
  GetLatency = 'get-metric-latency-query',
  GetRequest = 'get-metric-request-query',
  GetResponse = 'get-metric-response-query'
}

export interface QueryMetricsParams {
  sourceSite?: string;
  destSite?: string;
  sourceProcess?: string;
  destProcess?: string;
  protocol?: AvailableProtocols;
  timeInterval?: IntervalTimeProp;
  start?: number;
  end?: number;
}

export interface MetricsProps {
  defaultMetricFilterValues: SelectedMetricFilters;
  startTime?: number;
  sourceSites?: { name: string }[];
  destSites?: { name: string }[];
  sourceProcesses?: { destinationName: string }[];
  destProcesses?: { destinationName: string }[];
  availableProtocols?: AvailableProtocols[];
  configFilters?: ConfigMetricFilters;
  openSections?: { traffic?: boolean; latency?: boolean; request?: boolean; response?: boolean };
  onGetMetricFilters?: Function;
  refreshDataInterval?: string;
}

export interface MetricFiltersProps {
  defaultMetricFilterValues: QueryMetricsParams;
  startTime?: number;
  sourceSites?: { name: string }[];
  destSites?: { name: string }[];
  sourceProcesses?: { destinationName: string }[];
  destProcesses?: { destinationName: string }[];
  availableProtocols?: AvailableProtocols[];
  configFilters?: ConfigMetricFilters;
  refreshDataInterval?: string;
  isRefetching?: boolean;
  onRefetch?: Function;
  onSelectFilters?: (params: SelectedMetricFilters, refreshIntervalSelected?: string | undefined) => void;
}

export interface SelectedMetricFilters extends QueryMetricsParams {
  refreshDataInterval?: string;
}
