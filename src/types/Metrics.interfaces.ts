import { PrometheusMetric } from './Prometheus.interfaces';
import { skAxisXY } from './SkCharts';
import { Protocols, Direction } from '../API/REST.enum';
import { Labels } from '../config/labels';

export interface ConfigMetricFilters {
  sourceSites?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  destSites?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  destinationProcesses?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  sourceProcesses?: { disabled?: boolean; placeholder?: string; hide?: boolean };
  protocols?: { disabled?: boolean; placeholder?: string };
  timeInterval?: { disabled?: boolean; placeholder?: number };
}

export enum QueriesMetrics {
  GetTraffic = 'get-metric-traffic-query',
  GetLatency = 'get-metric-latency-query',
  GetRequest = 'get-metric-request-query',
  GetResponse = 'get-metric-response-query',
  GetConnection = 'get-metric-connection-query'
}

export interface QueryMetricsParams {
  sourceSite?: string;
  destSite?: string;
  sourceProcess?: string;
  destProcess?: string;
  sourceComponent?: string;
  destComponent?: string;
  service?: string;
  protocol?: Protocols;
  start?: number;
  end?: number;
  duration?: number;
  direction?: Direction;
}

export interface ExpandedMetricSections {
  byterate?: boolean;
  [Labels.LatencyIn]?: boolean;
  [Labels.LatencyOut]?: boolean;
  request?: boolean;
  response?: boolean;
  connection?: boolean;
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
  rxTimeSerie: { data: skAxisXY[]; label: 'Rx' } | undefined;
  txTimeSerie: { data: skAxisXY[]; label: 'Tx' } | undefined;
  avgTxValue: number | undefined;
  avgRxValue: number | undefined;
  maxTxValue: number | undefined;
  maxRxValue: number | undefined;
  minTxValue: number | undefined;
  minRxValue: number | undefined;
  totalTxValue: number | undefined;
  totalRxValue: number | undefined;
}

export interface getDataTrafficMetrics {
  traffic: ByteRateMetrics;
  trafficClient: ByteRateMetrics;
  trafficServer: ByteRateMetrics;
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

export interface MetricProcess {
  id: string;
  destinationName: string;
  parentId?: string;
  parentName?: string;
}
