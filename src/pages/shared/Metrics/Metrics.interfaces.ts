import { QueryMetricsParams } from './services/services.interfaces';

interface FilterOptionProps {
  protocols?: { disabled?: boolean; placeholder?: string };
  destinationProcesses?: { disabled?: boolean; placeholder?: string };
  sourceProcesses?: { disabled?: boolean; placeholder?: string };
  timeIntervals?: { disabled?: boolean };
}

export interface MetricsProps {
  selectedFilters: Omit<QueryMetricsParams, 'timeInterval'>; // startTime set the max Time Interval available to filter the Prometheus data (1 min, 1 day...)
  startTime?: number;
  processesConnected?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string }[];
  filterOptions?: FilterOptionProps;
}

export interface FilterMetricProps {
  sourceProcesses?: { destinationName: string }[];
  processesConnected?: { destinationName: string }[];
  customFilterOptions?: FilterOptionProps;
  startTime?: number;
  isRefetching?: boolean;
  onRefetch?: Function;
  onRefetchInterval?: Function;
  filters: QueryMetricsParams;
  onSelectFilters?: Function;
}
