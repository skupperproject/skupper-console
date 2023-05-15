import { IntervalTimeProp } from '@API/Prometheus.interfaces';
import { AvailableProtocols } from '@API/REST.enum';

import { QueryMetricsParams } from './services/services.interfaces';

interface FilterOptionProps {
  destinationProcesses?: { disabled?: boolean; placeholder?: string };
  sourceProcesses?: { disabled?: boolean; placeholder?: string };
  protocols?: { disabled?: boolean; placeholder?: string };
  timeIntervals?: { disabled?: boolean };
}

export interface FilterProps {
  processIdSource?: string;
  processIdDest?: string;
  protocol?: AvailableProtocols;
  timeInterval: IntervalTimeProp;
}

export interface MetricFilterProps {
  sourceProcesses?: { destinationName: string }[];
  processesConnected?: { destinationName: string }[];
  customFilterOptions?: FilterOptionProps;
  startTime?: number;
  isRefetching?: boolean;
  onRefetch?: Function;
  onRefetchInterval?: Function;
  initialFilters: FilterProps;
  onSelectFilters?: Function;
}

export interface MetricsProps {
  selectedFilters: Omit<QueryMetricsParams, 'timeInterval'>; // startTime set the max Time Interval available to filter the Prometheus data (1 min, 1 day...)
  startTime?: number;
  processesConnected?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string }[];
  filterOptions?: FilterOptionProps;
}
