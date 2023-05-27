import { AvailableProtocols } from '@API/REST.enum';
import { SkChartAreaData } from '@core/components/SkChartArea/SkChartArea.interfaces';
import { IntervalTimeProp, PrometheusApiResult } from 'API/Prometheus.interfaces';

export enum QueriesMetrics {
  GetMetrics = 'get-processes-metrics-query'
}

export interface QueryMetricsParams {
  processIdSource: string;
  timeInterval?: IntervalTimeProp;
  processIdDest?: string;
  protocol?: AvailableProtocols;
}

interface StatusCodeResponse {
  label: string;
  total: number;
  data: SkChartAreaData[] | undefined;
}

export interface ResponseMetrics {
  statusCode2xx: StatusCodeResponse;
  statusCode3xx: StatusCodeResponse;
  statusCode4xx: StatusCodeResponse;
  statusCode5xx: StatusCodeResponse;
  total: number;
}

export interface RequestMetrics {
  data: SkChartAreaData[];
  label: string;
  totalRequestInterval: number;
  avgRequestRateInterval: number;
}

export interface TrafficMetrics {
  timeSeriesDataReceived: SkChartAreaData[];
  timeSeriesDataSent: SkChartAreaData[];
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

export interface MetricData {
  values: SkChartAreaData[][];
  labels: string[];
}

export interface LatencyData {
  data: SkChartAreaData[];
  label: string;
}

export interface LatencyMetrics {
  timeSeriesLatencies: LatencyData[];
}

export interface LatencyMetricsProps {
  quantile50latency: PrometheusApiResult[];
  quantile90latency: PrometheusApiResult[];
  quantile99latency: PrometheusApiResult[];
}

export interface Metrics {
  trafficDataSeries: TrafficMetrics | null;
  trafficDataSeriesPerSecond: TrafficMetrics | null;
  latencies: LatencyMetrics | null;
  requestSeries: RequestMetrics[] | null;
  requestPerSecondSeries: RequestMetrics[] | null;
  responseSeries: ResponseMetrics | null;
  responseRateSeries: ResponseMetrics | null;
}
