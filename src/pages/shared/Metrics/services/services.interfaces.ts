import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';
import { PrometheusApiResult } from 'API/Prometheus.interfaces';

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

export type LantencyBucketMetrics = {
  data: { x: string; y: number }[];
  label: string;
};

export interface ByteRateMetrics {
  rxTimeSerie: { data: skAxisXY[]; label: 'Rx' } | undefined;
  txTimeSerie: { data: skAxisXY[]; label: 'Tx' } | undefined;
  avgTxValue: number | undefined;
  avgRxValue: number | undefined;
  maxTxValue: number | undefined;
  maxRxValue: number | undefined;
  currentTxValue: number | undefined;
  currentRxValue: number | undefined;
  totalTxValue: number | undefined;
  totalRxValue: number | undefined;
}

export interface LatencyMetrics {
  data: skAxisXY[];
  label: string;
}

export interface LatencyMetricsProps {
  quantile50latency: PrometheusApiResult[];
  quantile90latency: PrometheusApiResult[];
  quantile95latency: PrometheusApiResult[];
  quantile99latency: PrometheusApiResult[];
}
