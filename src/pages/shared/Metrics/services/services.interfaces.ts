import { PrometheusMetric } from '@API/Prometheus.interfaces';
import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';

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

export interface LatencyBucketDistributionData {
  data: { x: string; y: number }[];
  label: string;
}
export interface LatencyBucketSummary {
  bound: string;
  lessThanCount: number;
  greaterThanCount: number;
  lessThanPerc: number;
  greaterThanPerc: number;
}

export interface LantencyBucketMetrics {
  distribution: LatencyBucketDistributionData[];
  summary: LatencyBucketSummary[];
}

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
  quantile50latency: PrometheusMetric<'matrix'>[];
  quantile90latency: PrometheusMetric<'matrix'>[];
  quantile95latency: PrometheusMetric<'matrix'>[];
  quantile99latency: PrometheusMetric<'matrix'>[];
}

export interface ConnectionMetrics {
  liveConnectionsCount: number;
  liveConnectionsSerie: skAxisXY[][] | null;
}
