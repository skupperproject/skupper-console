import { IntervalTimeMap, IntervalTimePropValue } from './Prometheus.interfaces';

export const timeIntervalMap: IntervalTimeMap = {
  thirtySeconds: { value: '30s', seconds: 30, step: '2s', key: 'thirtySeconds', label: '30 seconds' },
  oneMinute: { value: '1m', seconds: 60, step: '5s', key: 'oneMinute', label: '1 minute' },
  fiveMinutes: { value: '5m', seconds: 5 * 60, step: '15s', key: 'fiveMinutes', label: '5 minutes' },
  fifteenMinutes: { value: '15m', seconds: 15 * 60, step: '15s', key: 'fifteenMinutes', label: '15 minutes' },
  thirtyMinutes: { value: '30m', seconds: 30 * 60, step: '15s', key: 'thirtyMinutes', label: '30 minutes' },
  oneHours: { value: '1h', seconds: 3600, step: '15s', key: 'oneHours', label: '1 hour' },
  twoHours: { value: '2h', seconds: 2 * 3600, step: '30s', key: 'twoHours', label: '2 hours' },
  sixHours: { value: '6h', seconds: 6 * 3600, step: '1m', key: 'sixHours', label: '6 hours' },
  twelveHours: { value: '12h', seconds: 12 * 3600, step: '2m', key: 'twelveHours', label: '12 hours' },
  oneDay: { value: '1d', seconds: 24 * 3600, step: '4m', key: 'oneDay', label: '1 day' },
  twoDay: { value: '2d', seconds: 2 * 24 * 3600, step: '9m', key: 'twoDay', label: '2 day' },
  threeDay: { value: '3d', seconds: 3 * 24 * 3600, step: '12m', key: 'threeDay', label: '3 day' },
  oneWeek: { value: '1w', seconds: 7 * 24 * 3600, step: '10m', key: 'oneWeek', label: '1 week' },
  twoWeeks: { value: '2w', seconds: 14 * 24 * 3600, step: '20m', key: 'twoWeeks', label: '2 weeks' }
};

export const defaultTimeInterval = Object.values(timeIntervalMap)[0];

let PROMETHEUS_PATH: string | undefined = undefined;
let PROMETHEUS_START_TIME: number = new Date().getTime();

// Override the default prometheus path with the value from the skupper flow collector api
export const setPrometheusStartTime = (time: number) => (PROMETHEUS_START_TIME = time);
export const gePrometheusStartTime = () => PROMETHEUS_START_TIME;

export const setPrometheusUrl = (url: string | undefined) => (PROMETHEUS_PATH = url || '');
export const isPrometheusActive = () => !!PROMETHEUS_PATH;

export const gePrometheusQueryPATH = (queryType: 'single' | 'range' = 'range') =>
  queryType === 'range' ? `${PROMETHEUS_PATH}/query_range` : `${PROMETHEUS_PATH}/query`;

// Prometheus queries
export const queries = {
  // http request/response queries
  getTotalRequests(param: string) {
    return `sum(http_requests_method_total{${param}})`;
  },
  getTotalRequestRateByMethod(param: string, range: IntervalTimePropValue) {
    return `sum by (method)(rate(http_requests_method_total{${param}}[${range}]))`;
  },
  getHttpPartialStatus(param: string) {
    return `sum by (partial_code) (label_replace(http_requests_result_total{${param}},"partial_code", "$1", "code","(.*).{2}"))`;
  },
  getHttpPartialStatusRate(param: string, range: IntervalTimePropValue) {
    return `sum by (partial_code) (label_replace(rate((http_requests_result_total{${param}}[${range}])),"partial_code", "$1", "code","(.*).{2}"))`;
  },

  // latency queries
  getQuantile(param: string, range: IntervalTimePropValue, quantile: 0.5 | 0.9 | 0.99) {
    return `histogram_quantile(${quantile},sum(rate(flow_latency_microseconds_bucket{${param}}[${range}]))by(le))`;
  },
  getAvgLatency(param: string, range: IntervalTimePropValue) {
    return `sum(rate(flow_latency_microseconds_sum{${param}}[${range}])/rate(flow_latency_microseconds_count{${param}}[${range}]))`;
  },

  // data transfer queries
  getBytesByDirection(paramSource: string, paramDest: string) {
    return `sum by(direction)(octets_total{${paramSource}} or octets_total{${paramDest}})`;
  },
  getByteRateByDirection(paramSource: string, paramDest: string, range: IntervalTimePropValue) {
    return `sum by(direction)(rate(octets_total{${paramSource}}[${range}]) or rate(octets_total{${paramDest}}[${range}]))`;
  },

  // counters for addresses
  getTotalFlowsByAddress() {
    return `sum by(address)(flows_total)`;
  },
  getActiveFlowsByAddress() {
    return `sum by (address)(increase(active_flows{protocol=~"http.*"}[30s]) or active_flows{protocol="tcp"})`;
  }
};
