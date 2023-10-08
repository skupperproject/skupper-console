import { AvailableProtocols } from '@API/REST.enum';

export interface ConfigMetricFilters {
  sourceSites?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  destSites?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  destinationProcesses?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  sourceProcesses?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  protocols?: { disabled?: boolean; placeholder?: string };
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
  service?: string;
  protocol?: AvailableProtocols;
  start?: number;
  end?: number;
  duration?: number;
}
export interface SelectedMetricFilters extends QueryMetricsParams {
  refreshDataInterval?: number;
}

export interface ExpandedMetricSections {
  byterate?: boolean;
  latency?: boolean;
  request?: boolean;
}

export interface MetricsProps {
  defaultMetricFilterValues: SelectedMetricFilters;
  defaultOpenSections?: ExpandedMetricSections;
  startTimeLimit: number;
  sourceSites?: { destinationName: string }[];
  destSites?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string; siteName?: string }[];
  destProcesses?: { destinationName: string; siteName?: string }[];
  availableProtocols?: AvailableProtocols[];
  configFilters?: ConfigMetricFilters;
  onGetMetricFilters?: Function;
  onGetExpandedSectionsConfig?: Function;
  refreshDataInterval?: number;
}

export interface MetricFiltersProps {
  defaultMetricFilterValues: QueryMetricsParams;
  defaultRefreshDataInterval?: number;
  startTimeLimit: number;
  sourceSites?: { destinationName: string }[];
  destSites?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string; siteName?: string }[];
  destProcesses?: { destinationName: string; siteName?: string }[];
  availableProtocols?: AvailableProtocols[];
  configFilters?: ConfigMetricFilters;
  isRefetching?: boolean;
  onRefetch?: Function;
  onSelectFilters?: (params: SelectedMetricFilters, refreshIntervalSelected?: number) => void;
}

export interface DateTimePickerProps {
  defaultDate?: string;
  defaultTime?: string;
  isDisabled?: boolean;
  startDate?: Date;
  onSelect?: Function;
}

export interface SelectTimeIntervalProps {
  startTimeLimit: number;
  onSelectTimeInterval: ({
    start,
    end,
    duration
  }: {
    start: number | undefined;
    end: number | undefined;
    duration: number | undefined;
  }) => void;
  defaultLabel?: string;
  startSelected?: number;
  endSelected?: number;
  duration?: number;
}
