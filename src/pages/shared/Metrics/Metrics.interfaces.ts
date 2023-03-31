import { AvailableProtocols } from 'API/REST.enum';

interface FilterOptionsProp {
  protocols?: { disabled?: boolean; name?: string };
  timeIntervals?: { disabled?: boolean };
  destinationProcesses?: { disabled?: boolean; name?: string };
  sourceProcesses?: { disabled?: boolean; name?: string };
}

export interface MetricsProps {
  parent: { id: string; name: string; startTime: number }; // startTime set the max Time Interval available to filter the Prometheus data (1 min, 1 day...)
  processesConnected?: { destinationName: string }[];
  sourceProcesses?: { destinationName: string }[];
  protocolDefault?: AvailableProtocols;
  customFilters?: FilterOptionsProp;
}
