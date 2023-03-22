import { PrometheusApiResult, IntervalTimeProp } from 'API/Prometheus.interfaces';
import { AvailableProtocols } from 'API/REST.enum';
import { ProcessResponse } from 'API/REST.interfaces';

export interface ProcessesTableProps {
  processes?: ProcessResponse[];
  onGetFilters?: Function;
  rowsCount?: number;
}

export interface ProcessAxisDataChart {
  x: number;
  y: number;
}

export interface ProcessMetric {
  values: ProcessAxisDataChart[][];
  labels: string[][];
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

export interface ChartProcessDataTrafficSeriesProps {
  data: ProcessAxisDataChart[][];
  formatY?: Function;
  formatX?: Function;
  axisYLabel?: string;
  legendLabels?: string[];
  themeColor?: string;
  showLegend?: boolean;
}

interface StatusCodeResponse {
  label: string;
  total: number;
  data: ProcessAxisDataChart[] | undefined;
}

interface ResponseSeries {
  statusCode2xx: StatusCodeResponse;
  statusCode3xx: StatusCodeResponse;
  statusCode4xx: StatusCodeResponse;
  statusCode5xx: StatusCodeResponse;
  total: number;
}

export interface ProcessMetrics {
  trafficDataSeries: ProcessDataChart | null;
  trafficDataSeriesPerSecond: ProcessDataChart | null;
  latencies: ProcessLatenciesChart[] | null;
  requestSeries: ProcessRequestsChart[] | null;
  requestPerSecondSeries: ProcessRequestsChart[] | null;
  responseSeries: ResponseSeries | null;
  responseRateSeries: ResponseSeries | null;
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
  timeInterval: IntervalTimeProp;
  processIdDest?: string;
  protocol?: AvailableProtocols;
}

interface FilterOptionsProp {
  protocols?: { disabled?: boolean; name?: string };
  timeIntervals?: { disabled?: boolean };
  destinationProcesses?: { disabled?: boolean; name?: string };
}

export interface MetricsProps {
  parent: { id: string; name: string; startTime: number }; // startTime set the max Time Interval available to filter the Prometheus data (1 min, 1 day...)
  processesConnected?: { destinationName: string }[];
  protocolDefault?: AvailableProtocols;
  customFilters?: FilterOptionsProp;
}
export interface NormalizeLatenciesProps {
  quantile50latency: PrometheusApiResult[];
  quantile90latency: PrometheusApiResult[];
  quantile99latency: PrometheusApiResult[];
}
