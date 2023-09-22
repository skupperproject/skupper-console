import { AvailableProtocols } from '@API/REST.enum';
import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';
import { IntervalTimeProp, PrometheusApiResult } from 'API/Prometheus.interfaces';

export enum QueriesMetrics {
  GetTraffic = 'get-metric-traffic-query',
  GetLatency = 'get-metric-latency-query',
  GetRequest = 'get-metric-request-query',
  GetResponse = 'get-metric-response-query'
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
  data: skAxisXY[] | null;
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

export interface LatencyMetrics {
  data: skAxisXY[];
  label: string;
}

export interface LatencyMetricsProps {
  quantile50latency: PrometheusApiResult[];
  quantile90latency: PrometheusApiResult[];
  quantile99latency: PrometheusApiResult[];
}
