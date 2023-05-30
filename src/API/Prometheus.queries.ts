import { IntervalTimeMap, IntervalTimePropValue } from './Prometheus.interfaces';

export const timeIntervalMap: IntervalTimeMap = {
  oneMinute: { value: '1m', seconds: 60, step: '5s', key: 'oneMinute', label: 'Last min.' },
  fiveMinutes: { value: '5m', seconds: 5 * 60, step: '15s', key: 'fiveMinutes', label: 'Last 5 min.' },
  fifteenMinutes: { value: '15m', seconds: 15 * 60, step: '15s', key: 'fifteenMinutes', label: 'Last 15 min.' },
  thirtyMinutes: { value: '30m', seconds: 30 * 60, step: '15s', key: 'thirtyMinutes', label: 'Last 30 min.' },
  oneHours: { value: '1h', seconds: 3600, step: '15s', key: 'oneHours', label: 'Last hour' },
  twoHours: { value: '2h', seconds: 2 * 3600, step: '30s', key: 'twoHours', label: 'Last 2 hours' },
  sixHours: { value: '6h', seconds: 6 * 3600, step: '1m', key: 'sixHours', label: 'Last 6 hours' },
  twelveHours: { value: '12h', seconds: 12 * 3600, step: '2m', key: 'twelveHours', label: 'Last 12 hours' },
  oneDay: { value: '1d', seconds: 24 * 3600, step: '4m', key: 'oneDay', label: 'Last day' },
  twoDay: { value: '2d', seconds: 2 * 24 * 3600, step: '9m', key: 'twoDay', label: 'Last 2 day' },
  threeDay: { value: '3d', seconds: 3 * 24 * 3600, step: '12m', key: 'threeDay', label: 'Last 3 day' },
  oneWeek: { value: '1w', seconds: 7 * 24 * 3600, step: '10m', key: 'oneWeek', label: 'Last week' },
  twoWeeks: { value: '2w', seconds: 14 * 24 * 3600, step: '20m', key: 'twoWeeks', label: 'Last2 weeks' }
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
  // http request queries
  getTotalRequestsTimeInterval(param: string, range: IntervalTimePropValue) {
    return `sum(increase(http_requests_method_total{${param}}[${range}]))`;
  },

  getAvgRequestRateTimeInterval(param: string, range: IntervalTimePropValue) {
    return `sum(rate(http_requests_method_total{${param}}[${range}]))`;
  },

  getTotalRequestRateByMethodTimeInterval(param: string, range: IntervalTimePropValue) {
    return `sum by(method)(rate(http_requests_method_total{${param}}[${range}]))`;
  },

  // http response queries
  getHttpPartialStatus(param: string) {
    return `sum by(partial_code)(label_replace(http_requests_result_total{${param}},"partial_code", "$1", "code","(.*).{2}"))`;
  },
  getHttpPartialStatusRateTimeInterval(param: string, range: IntervalTimePropValue) {
    return `sum by(partial_code)(label_replace(rate((http_requests_result_total{${param}}[${range}])),"partial_code", "$1", "code","(.*).{2}"))`;
  },

  // latency queries
  getQuantileTimeInterval(param: string, range: IntervalTimePropValue, quantile: 0.5 | 0.9 | 0.99) {
    return `histogram_quantile(${quantile},sum(rate(flow_latency_microseconds_bucket{${param}}[${range}]))by(le))`;
  },
  getAvgLatencyTimeInterval(param: string, range: IntervalTimePropValue) {
    return `sum(rate(flow_latency_microseconds_sum{${param}}[${range}])/rate(flow_latency_microseconds_count{${param}}[${range}]))`;
  },

  // data transfer queries
  getBytesByDirection(param: string, range: IntervalTimePropValue) {
    return `sum by(direction)(increase(octets_total{${param}}[${range}]))`;
  },
  getByteRateByDirectionTimeInteval(paramSource: string, range: IntervalTimePropValue) {
    return `sum by(direction)(rate(octets_total{${paramSource}}[${range}]))`;
  },
  getAllProcessPairsByteRates() {
    return `sum by(destProcess, sourceProcess,direction)(rate(octets_total[1m]))`;
  },

  getAllProcessPairsLatencies() {
    return `sum by(sourceProcess, destProcess)(rate(flow_latency_microseconds_sum[1m]))`;
  },

  // counters for addresses
  getTotalFlowsByAddress() {
    return `sum by(address)(flows_total)`;
  },
  getActiveFlowsByAddress() {
    return `sum by(address)(increase(active_flows{protocol=~"http.*"}[30s]) or active_flows{protocol="tcp"})`;
  }
};
