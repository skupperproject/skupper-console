import { AvailableProtocols } from '@API/REST.enum';
import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';
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
  data: skAxisXY[];
}

export interface ResponseMetrics {
  statusCode2xx: StatusCodeResponse;
  statusCode3xx: StatusCodeResponse;
  statusCode4xx: StatusCodeResponse;
  statusCode5xx: StatusCodeResponse;
  total: number;
}

export interface RequestMetrics {
  data: skAxisXY[];
  label: string;
}

export interface ByteRateMetrics {
  rxTimeSerie: skAxisXY[];
  txTimeSerie: skAxisXY[];
  avgTxValue: number;
  avgRxValue: number;
  maxTxValue: number;
  maxRxValue: number;
  currentTxValue: number;
  currentRxValue: number;
}

export interface BytesMetric {
  bytesRx: number;
  bytesTx: number;
}

export interface MetricData {
  values: skAxisXY[][];
  labels: string[];
}

export interface LatencyData {
  data: skAxisXY[];
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
  bytes: BytesMetric | null;
  byteRate: ByteRateMetrics | null;
  latencies: LatencyMetrics | null;
  requestPerSecondSeries: RequestMetrics[] | null;
  avgRequestRateInterval: number;
  totalRequestsInterval: number;
  responseSeries: ResponseMetrics | null;
  responseRateSeries: ResponseMetrics | null;
}
