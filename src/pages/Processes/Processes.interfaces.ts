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

export interface ProcessMetrics {
  trafficDataSeries: ProcessDataChart | null;
  trafficDataSeriesPerSecond: ProcessDataChart | null;
  latencies: ProcessLatenciesChart[] | null;
}

export interface ProcessDataChart {
  timeSeriesDataReceived: ProcessAxisDataChart[];
  timeSeriesDataSent: ProcessAxisDataChart[];
  totalDataReceived: number;
  totalDataSent: number;
  totalData: number;
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
