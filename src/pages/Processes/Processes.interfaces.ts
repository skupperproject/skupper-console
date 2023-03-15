import { AddressResponse, FlowAggregatesResponse, ProcessResponse } from 'API/REST.interfaces';

export interface ProcessesTableProps {
  processes?: ProcessResponse[];
  onGetFilters?: Function;
  rowsCount?: number;
}

export interface ProcessAxisDataChart {
  x: number;
  y: number;
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

export interface ProcessNamePairsLinkCellProps {
  data: FlowAggregatesResponse;
  value: FlowAggregatesResponse[keyof FlowAggregatesResponse];
}

export interface CurrentBytesInfoProps {
  description?: string;
  direction?: 'down' | 'up';
  byteRate?: number;
  bytes: number;
  style?: Record<string, string>;
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
