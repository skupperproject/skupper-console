import { ValidWindowTime } from './Prometheus.interfaces';

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
  [timeIntervalMap.FifteenMinutes]: `${startDateOffsetMap[timeIntervalMap.FifteenMinutes] / 60}s`,
  [timeIntervalMap.ThirtyMinutes]: `${startDateOffsetMap[timeIntervalMap.ThirtyMinutes] / 60}s`,
  [timeIntervalMap.OneHours]: `${startDateOffsetMap[timeIntervalMap.OneHours] / 60}s`,
  [timeIntervalMap.TwoHours]: `${startDateOffsetMap[timeIntervalMap.TwoHours] / 60}s`,
  [timeIntervalMap.SixHours]: `${startDateOffsetMap[timeIntervalMap.SixHours] / 60}s`,
  [timeIntervalMap.TwelveHours]: `${startDateOffsetMap[timeIntervalMap.TwelveHours] / 60}s`,
  [timeIntervalMap.OneDay]: `${startDateOffsetMap[timeIntervalMap.OneDay] / 60}s`,
  [timeIntervalMap.OneWeek]: `${startDateOffsetMap[timeIntervalMap.OneWeek] / 60}s`,
  [timeIntervalMap.TwoWeeks]: `${startDateOffsetMap[timeIntervalMap.TwoWeeks] / 60}s`
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
  getTotalRequestPerSecondByProcess(param: string, range: keyof ValidWindowTime) {
    return `sum(rate(http_requests_method_total{${param}}[${range}]))`;
  },
  getLatencyByProcess(param: string, range: keyof ValidWindowTime, quantile: 0.5 | 0.9 | 0.99) {
    return `histogram_quantile(${quantile},sum(rate(flow_latency_microseconds_bucket{${param}}[${range}]))by(le))`;
  },
  getAvgLatencyByProcess(param: string, range: keyof ValidWindowTime) {
    return `sum(rate(flow_latency_microseconds_sum{${param}}[${range}])/rate(flow_latency_microseconds_count{${param}}[${range}]))`;
  },
  getResponseStatusCodesByProcess(param: string) {
    return `sum by (code) (http_requests_result_total{${param}})`;
  },
  getResponseStatusCodesPerSecondByProcess(param: string, range: keyof ValidWindowTime) {
    return `sum by (code) (rate(http_requests_result_total{${param}}[${range}]))`;
  },
  getDataTraffic(paramSource: string, paramDest: string) {
    return `sum by(direction)(octets_total{${paramSource}} or octets_total{${paramDest}})`;
  },
  getDataTrafficPerSecondByProcess(paramSource: string, paramDest: string, range: keyof ValidWindowTime) {
    return `sum by(direction)(rate(octets_total{${paramSource}}[${range}]) or rate(octets_total{${paramDest}}[${range}]))`;
  }
};
