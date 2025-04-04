import { IntervalTimeMap } from '../types/Prometheus.interfaces';

// This file defines constants and enums used for querying and displaying data from Prometheus, particularly related to network metrics collected by Skupper.
// It provides a mapping of time intervals, default time interval, and enumerations for Prometheus labels and metrics.

// `timeIntervalMap`: Defines a mapping of human-readable time interval labels (e.g., "Last 1 min.") to their corresponding durations in seconds.
// This map is used to configure the time range for Prometheus queries.
export const timeIntervalMap: IntervalTimeMap = {
  oneMinute: { seconds: 60, label: 'Last 1 min.' },
  fiveMinutes: { seconds: 5 * 60, label: 'Last 5 min.' },
  fifteenMinutes: { seconds: 15 * 60, label: 'Last 15 min.' },
  thirtyMinutes: { seconds: 30 * 60, label: 'Last 30 min.' },
  oneHour: { seconds: 3600, label: 'Last hour' },
  twoHours: { seconds: 2 * 3600, label: 'Last 2 hours' },
  sixHours: { seconds: 6 * 3600, label: 'Last 6 hours' },
  twelveHours: { seconds: 12 * 3600, label: 'Last 12 hours' },
  oneDay: { seconds: 24 * 3600, label: 'Last day' },
  twoDays: { seconds: 48 * 3600, label: 'Last 2 days' }
};

export const defaultTimeInterval = Object.values(timeIntervalMap)[0];

// The enum values correspond to the Prometheus label names. This enum serves as a reusable mapping, allowing easy updates if the Prometheus metric names change.
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
