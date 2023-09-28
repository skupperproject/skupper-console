import { AvailableProtocols } from '@API/REST.enum';

import { QueryMetricsParams } from './services/services.interfaces';

interface FilterOptionProps {
  destinationProcesses?: { disabled?: boolean; placeholder?: string; hide?: boolean };
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
  availableProtocols?: AvailableProtocols[];
  filterOptions?: FilterOptionProps;
  openSections?: { traffic?: boolean; latency?: boolean; request?: boolean; response?: boolean };
  onGetMetricFilters?: Function;
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
  initialFilters: SelectedFilters;
  onSelectFilters?: Function;
}
