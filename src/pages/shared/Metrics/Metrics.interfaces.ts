import { IntervalTimeProp } from '@API/Prometheus.interfaces';
import { AvailableProtocols } from '@API/REST.enum';

interface FilterOptionProps {
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
}

export interface MetricsProps {
  selectedFilters: SelectedFilters;
  startTime?: number;
  sourceSites?: { name: string }[];
  destSites?: { name: string }[];
  sourceProcesses?: { destinationName: string }[];
  processesConnected?: { destinationName: string }[];
  availableProtocols?: AvailableProtocols[];
  filterOptions?: FilterOptionProps;
  openSections?: { traffic?: boolean; latency?: boolean; request?: boolean; response?: boolean };
  onGetMetricFilters?: Function;
}

export interface MetricFiltersProps {
  initialFilters: SelectedFilters;
  startTime?: number;
  sourceSites?: { name: string }[];
  destSites?: { name: string }[];
  sourceProcesses?: { destinationName: string }[];
  processesConnected?: { destinationName: string }[];
  availableProtocols?: AvailableProtocols[];
  customFilterOptions?: FilterOptionProps;
  isRefetching?: boolean;
  forceDisableRefetchData?: boolean;
  onRefetch?: Function;
  onSelectFilters?: Function;
}

export interface SelectedFilters extends QueryMetricsParams {
  displayInterval?: string;
}
