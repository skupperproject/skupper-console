import { IntervalTimeMap } from '../types/Prometheus.interfaces';

export const timeIntervalMap: IntervalTimeMap = {
  oneMinute: { seconds: 60, label: 'Last 1 min.' },
  fiveMinutes: { seconds: 5 * 60, label: 'Last 5 min.' },
  fifteenMinutes: { seconds: 15 * 60, label: 'Last 15 min.' },
  thirtyMinutes: { seconds: 30 * 60, label: 'Last 30 min.' },
  oneHours: { seconds: 3600, label: 'Last hour' },
  twoHours: { seconds: 2 * 3600, label: 'Last 2 hours' },
  sixHours: { seconds: 6 * 3600, label: 'Last 6 hours' },
  twelveHours: { seconds: 12 * 3600, label: 'Last 12 hours' },
  oneDay: { seconds: 24 * 3600, label: 'Last day' },
  twoDay: { seconds: 2 * 24 * 3600, label: 'Last 2 day' }
};

export const defaultTimeInterval = Object.values(timeIntervalMap)[0];

export enum PrometheusLabelsV2 {
  SourceSiteId = 'source_site_id',
  DestSiteId = 'dest_site_id',
  SourceProcessName = 'source_process_name',
  DestProcessName = 'dest_process_name',
  SourceComponentName = 'source_component_name',
  DestComponentName = 'dest_component_name',
  Direction = 'direction',
  Protocol = 'protocol',
  RoutingKey = 'routing_key',
  Code = 'code', // L7 response
  Method = 'method' // L7 request
}

export enum PrometheusMetricsV2 {
  SentBytes = 'skupper_sent_bytes_total',
  ReceivedBytes = 'skupper_received_bytes_total',
  LatencyBuckets = 'legacy_flow_latency_microseconds_bucket',
  HttpRequests = 'skupper_requests_total',
  TcpOpenConnections = 'skupper_connections_opened_total',
  TcpCloseCOnnections = 'skupper_connections_closed_total'
}
