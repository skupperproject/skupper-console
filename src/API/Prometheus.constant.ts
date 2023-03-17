import { ValidWindowTime, ValidWindowTimeValues } from './Prometheus.interfaces';

export const timeIntervalMap: ValidWindowTime = {
  FifteenMinutes: '15m',
  ThirtyMinutes: '30m',
  OneHours: '1h',
  TwoHours: '2h',
  SixHours: '6h',
  TwelveHours: '12h',
  OneDay: '1d',
  OneWeek: '1w',
  TwoWeeks: '2w'
};

// Bind the Time range selected to display prometheus metrics and seconds
export const startDateOffsetMap: Record<string, number> = {
  [timeIntervalMap.FifteenMinutes]: 15 * 60,
  [timeIntervalMap.ThirtyMinutes]: 30 * 60,
  [timeIntervalMap.OneHours]: 3600,
  [timeIntervalMap.TwoHours]: 2 * 3600,
  [timeIntervalMap.SixHours]: 6 * 3600,
  [timeIntervalMap.TwelveHours]: 12 * 3600,
  [timeIntervalMap.OneDay]: 24 * 3600,
  [timeIntervalMap.OneWeek]: 7 * 24 * 3600,
  [timeIntervalMap.TwoWeeks]: 14 * 24 * 3600
};

// Bind the Time range selected to display prometheus metrics  and Time interval before record a new sample
export const rangeStepIntervalMap: Record<string, string> = {
  [timeIntervalMap.FifteenMinutes]: `3s`,
  [timeIntervalMap.ThirtyMinutes]: `7s`,
  [timeIntervalMap.OneHours]: `14s`,
  [timeIntervalMap.TwoHours]: `28s`,
  [timeIntervalMap.SixHours]: `86s`,
  [timeIntervalMap.TwelveHours]: `172s`,
  [timeIntervalMap.OneDay]: `345s`,
  [timeIntervalMap.OneWeek]: `2419s`,
  [timeIntervalMap.TwoWeeks]: `4838`
};

export let PROMETHEUS_PATH: string | undefined = undefined;
// Override the default prometheus path with the value from the skupper flow collector api
export const setPrometheusUrl = (url: string | undefined) => (PROMETHEUS_PATH = url);
export const isPrometheusActive = () => !!PROMETHEUS_PATH;

export const gePrometheusQueryPATH = (queryType: 'single' | 'range' = 'range') =>
  queryType === 'range' ? `${PROMETHEUS_PATH}/query_range` : `${PROMETHEUS_PATH}/query`;

// Prometheus queries
export const queries = {
  getTotalRequestsByProcess(param: string) {
    return `sum(http_requests_method_total{${param}})`;
  },
  getTotalRequestPerSecondByProcess(param: string, range: ValidWindowTimeValues) {
    return `sum(rate(http_requests_method_total{${param}}[${range}]))`;
  },
  getLatencyByProcess(param: string, range: ValidWindowTimeValues, quantile: 0.5 | 0.9 | 0.99) {
    return `histogram_quantile(${quantile},sum(rate(flow_latency_microseconds_bucket{${param}}[${range}]))by(le))`;
  },
  getAvgLatencyByProcess(param: string, range: ValidWindowTimeValues) {
    return `sum(rate(flow_latency_microseconds_sum{${param}}[${range}])/rate(flow_latency_microseconds_count{${param}}[${range}]))`;
  },
  getResponseStatusCodesByProcess(param: string) {
    return `sum by (code) (http_requests_result_total{${param}})`;
  },
  getResponseStatusCodesPerSecondByProcess(param: string, range: ValidWindowTimeValues) {
    return `sum by (code) (rate(http_requests_result_total{${param}}[${range}]))`;
  },
  getDataTraffic(paramSource: string, paramDest: string) {
    return `sum by(direction)(octets_total{${paramSource}} or octets_total{${paramDest}})`;
  },
  getDataTrafficPerSecondByProcess(paramSource: string, paramDest: string, range: ValidWindowTimeValues) {
    return `sum by(direction)(irate(octets_total{${paramSource}}[${range}]) or irate(octets_total{${paramDest}}[${range}]))`;
  }
};
