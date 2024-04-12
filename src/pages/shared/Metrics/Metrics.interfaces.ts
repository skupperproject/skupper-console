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
  GetLatencyBuckets = 'get-metric-latency-buckets-query',
  GetRequest = 'get-metric-request-query',
  GetResponse = 'get-metric-response-query',
  GetConnection = 'get-metric-connection-query'
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

export interface ExpandedMetricSections {
  byterate?: boolean;
  latency?: boolean;
  request?: boolean;
  response?: boolean;
  connection?: boolean;
}

export interface MetricsProps {
  defaultMetricFilterValues: QueryMetricsParams;
  defaultOpenSections?: ExpandedMetricSections;
  startTimeLimit: number;
  sourceSites?: { destinationName: string }[];
  destSites?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string; siteName?: string }[];
  destProcesses?: { destinationName: string; siteName?: string }[];
  availableProtocols?: AvailableProtocols[];
  configFilters?: ConfigMetricFilters;
  onGetMetricFiltersConfig?: Function;
  onGetExpandedSectionsConfig?: Function;
}

export interface MetricFiltersProps {
  defaultMetricFilterValues: QueryMetricsParams;
  startTimeLimit: number;
  sourceSites?: { destinationName: string }[];
  destSites?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string; siteName?: string }[];
  destProcesses?: { destinationName: string; siteName?: string }[];
  availableProtocols?: AvailableProtocols[];
  configFilters?: ConfigMetricFilters;
  isRefetching?: boolean;
  onRefetch?: Function;
  onSelectFilters?: (params: QueryMetricsParams) => void;
}

export interface DateTimePickerProps {
  defaultDate?: string;
  defaultTime?: string;
  isDisabled?: boolean;
  startDate?: Date;
  onSelect?: Function;
  testId?: string;
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
  isDateTimeRangeFilterOpen?: boolean;
}
