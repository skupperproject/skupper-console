import { AvailableProtocols } from '@API/REST.enum';

import { QueryMetricsParams } from './services/services.interfaces';

interface FilterOptionProps {
  destinationProcesses?: { disabled?: boolean; placeholder?: string };
  sourceProcesses?: { disabled?: boolean; placeholder?: string };
  protocols?: { disabled?: boolean; placeholder?: string };
  timeIntervals?: { disabled?: boolean };
}

export interface SelectedFilters extends QueryMetricsParams {
  displayInterval?: string;
}

export interface MetricsProps {
  selectedFilters: SelectedFilters;
  startTime?: number;
  processesConnected?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string }[];
  filterOptions?: FilterOptionProps;
  forceUpdate?: number;
  onGetMetricFilters?: Function;
}

export interface FilterProps extends Omit<SelectedFilters, 'processIdSource'> {
  //for multiple id source we set this prop = undefined to get the default value
  processIdSource: string | undefined;
}

export interface MetricFilterProps {
  sourceProcesses?: { destinationName: string }[];
  processesConnected?: { destinationName: string }[];
  availableProtocols?: AvailableProtocols[];
  customFilterOptions?: FilterOptionProps;
  startTime?: number;
  isRefetching?: boolean;
  forceDisableRefetchData?: boolean;
  onRefetch?: Function;
  initialFilters: FilterProps;
  onSelectFilters?: Function;
}
