import { ValidWindowTimeValues } from 'API/Prometheus.interfaces';
import { AvailableProtocols } from 'API/REST.enum';
import { AddressResponse, ProcessResponse } from 'API/REST.interfaces';

export interface ProcessesTableProps {
  processes?: ProcessResponse[];
  onGetFilters?: Function;
  rowsCount?: number;
}

export interface ProcessAxisDataChart {
  x: number;
  y: number;
}

export interface ProcessLatenciesChart {
  data: ProcessAxisDataChart[];
  label: string;
}

export interface ProcessRequestsChart {
  data: ProcessAxisDataChart[];
  label: string;
  totalRequestInterval: number;
  avgRequestRateInterval: number;
}

export interface ProcessMetrics {
  trafficDataSeries: ProcessDataChart | null;
  trafficDataSeriesPerSecond: ProcessDataChart | null;
  latencies: ProcessLatenciesChart[] | null;
  requestSeries: ProcessRequestsChart[] | null;
  requestPerSecondSeries: ProcessRequestsChart[] | null;
}

export interface ProcessDataChart {
  timeSeriesDataReceived: ProcessAxisDataChart[];
  timeSeriesDataSent: ProcessAxisDataChart[];
  totalDataReceived: number;
  totalDataSent: number;
  avgTrafficSent: number;
  avgTrafficReceived: number;
  maxTrafficSent: number;
  maxTrafficReceived: number;
  currentTrafficSent: number;
  currentTrafficReceived: number;
  sumDataSent: number;
  sumDataReceived: number;
}

export interface ProcessesBytesChartProps {
  data: { x: string; y: number }[];
  themeColor?: string;
}

export interface ProcessNameLinkCellProps {
  data: ProcessResponse;
  value: ProcessResponse[keyof ProcessResponse];
}

export interface SiteNameLinkCellProps {
  data: ProcessResponse;
  value: ProcessResponse[keyof ProcessResponse];
}

export interface AddressNameLinkCellProps {
  data: AddressResponse;
  value: AddressResponse[keyof AddressResponse];
}

export interface ChartProcessDataTrafficSeriesProps {
  data: ProcessAxisDataChart[][];
  formatY?: Function;
  formatX?: Function;
  axisYLabel?: string;
  legendLabels?: string[];
  themeColor?: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  bgColor?: string;
  fontColor?: string;
  showChart?: boolean;
  colorChart?: string;
  dataChart?: { x: number | string; y: number }[];
}

export interface MetricsFilters {
  id: string;
  timeInterval: ValidWindowTimeValues;
  processIdDest?: string;
  protocol?: AvailableProtocols;
}

interface FilterOptionsProp {
  protocols?: { disabled?: boolean; name?: string };
  timeIntervals?: { disabled?: boolean };
  destinationProcesses?: { disabled?: boolean; name?: string };
}

export interface MetricsProps {
  parent: { id: string; name: string };
  processesConnected?: { destinationName: string }[];
  protocolDefault?: AvailableProtocols;
  filterOptions?: FilterOptionsProp;
}
