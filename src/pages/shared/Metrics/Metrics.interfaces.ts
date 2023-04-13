import { QueryMetricsParams } from './services/services.interfaces';

interface FilterOptionsProp {
  protocols?: { disabled?: boolean; name?: string };
  timeIntervals?: { disabled?: boolean };
  destinationProcesses?: { disabled?: boolean; name?: string };
  sourceProcesses?: { disabled?: boolean; name?: string };
}

export interface MetricsProps {
  filters: Omit<QueryMetricsParams, 'timeInterval'>; // startTime set the max Time Interval available to filter the Prometheus data (1 min, 1 day...)
  startTime?: number;
  processesConnected?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string }[];
  customFilterOptions?: FilterOptionsProp;
}

export interface FilterMetricProps {
  sourceProcesses?: { destinationName: string }[];
  processesConnected?: { destinationName: string }[];
  customFilterOptions?: FilterOptionsProp;
  startTime?: number;
  isRefetching?: boolean;
  onRefetch?: Function;
  onRefetchInterval?: Function;
  filters: QueryMetricsParams;
  onSelectFilters?: Function;
}
