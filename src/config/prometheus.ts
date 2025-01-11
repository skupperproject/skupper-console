import { IntervalTimeMap } from '../types/Prometheus.interfaces';

/**
 * Calculates the appropriate step for Prometheus range queries based on the time range.
 * This helps optimize query performance and data visualization by adjusting the data point density.
 */
export function calculateStep(range: number): string {
  const shortRangeThreshold = 60 * 60; // 1 hour
  const mediumRangeThreshold = 24 * 60 * 60; // 1 day
  const longRangeThreshold = 7 * 24 * 60 * 60; // 1 week
  const twoWeeksRangeThreshold = 2 * 7 * 24 * 60 * 60; // 2 weeks
  const fourWeeksRangeThreshold = 4 * 7 * 24 * 60 * 60; // 4 weeks

  if (range <= shortRangeThreshold) {
    // Up to 1 hour: aim for approximately 250 data points, but not less than 1 second.
    // This provides a good resolution for detailed views.
    const step = Math.max(Math.floor(range / 250), 1);

    return `${step}s`;
  } else if (range <= mediumRangeThreshold) {
    // 1 hour to 1 day: aim for approximately 1 data point per minute.
    // This balances detail and data volume.
    const step = Math.max(Math.floor(range / 1440), 1); // 1440 minutes in a day

    return `${step}m`;
  } else if (range <= longRangeThreshold) {
    // 1 day to 1 week: aim for approximately 1 data point every 5 minutes.
    const step = Math.max(Math.floor(range / (288 * 5)), 1); // 288 five-minute intervals in a day

    return `${step}m`;
  } else if (range <= twoWeeksRangeThreshold) {
    // 1 week to 2 weeks: aim for approximately 1 data point every 15 minutes.
    const step = Math.max(Math.floor(range / (96 * 15)), 1); // 96 fifteen-minute intervals in a day

    return `${step}m`;
  } else if (range <= fourWeeksRangeThreshold) {
    // 2 weeks to 4 weeks: aim for approximately 1 data point every hour.
    const step = Math.max(Math.floor(range / 24), 1); // 24 hours in a day

    return `${step}h`;
  }
  // More than 4 weeks: aim for approximately 1 data point per day.
  const step = Math.max(Math.floor(range / (24 * 60 * 60)), 1);

  return `${step}d`;
}

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
  twoDay: { seconds: 2 * 24 * 3600, label: 'Last 2 day' },
  fourDay: { seconds: 4 * 24 * 3600, label: 'Last 4 day' }
};

export const defaultTimeInterval = Object.values(timeIntervalMap)[0];

export enum PrometheusLabelsV2 {
  SourceSiteId = 'source_site_id',
  SourceSiteName = 'source_site_name',
  DestSiteId = 'dest_site_id',
  DestSiteName = 'dest_site_name',
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
  LatencySum = 'legacy_flow_latency_microseconds_sum',
  LatencyCount = 'legacy_flow_latency_microseconds_count',
  HttpRequests = 'skupper_requests_total',
  TcpOpenConnections = 'skupper_connections_opened_total',
  TcpCloseCOnnections = 'skupper_connections_closed_total'
}
