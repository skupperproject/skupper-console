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

export interface ByteRateMetrics {
  rxTimeSerie?: { data: skAxisXY[]; label: 'Rx' };
  txTimeSerie?: { data: skAxisXY[]; label: 'Tx' };
  avgTxValue?: number;
  avgRxValue?: number;
  maxTxValue?: number;
  maxRxValue?: number;
  currentTxValue?: number;
  currentRxValue?: number;
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
