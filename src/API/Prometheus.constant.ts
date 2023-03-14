import { ValidWindowTime } from './Prometheus.interfaces';

const MetricsDuration: ValidWindowTime = {
    FifteenMinutes: '15m',
    ThirtyMinutes: '30m',
    OneHours: '1h',
    TwoHours: '2h',
    SixHours: '6h',
    TwelveHours: '12h',
    OneDay: '1d',
    OneWeek: '1w',
    TwoWeeks: '2w',
};

// Bind the Time range selected to display prometheus metrics and seconds
export const startDateOffsetMap: Record<string, number> = {
    [MetricsDuration.FifteenMinutes]: 15 * 60,
    [MetricsDuration.ThirtyMinutes]: 30 * 60,
    [MetricsDuration.OneHours]: 3600,
    [MetricsDuration.TwoHours]: 2 * 3600,
    [MetricsDuration.SixHours]: 6 * 3600,
    [MetricsDuration.OneDay]: 24 * 3600,
    [MetricsDuration.OneWeek]: 7 * 24 * 3600,
    [MetricsDuration.TwoWeeks]: 14 * 24 * 3600,
};

// Bind the Time range selected to display prometheus metrics  and Time interval before record a new sample
export const rangeStepIntervalMap: Record<string, string> = {
    [MetricsDuration.FifteenMinutes]: `${startDateOffsetMap[MetricsDuration.FifteenMinutes] / 60}s`,
    [MetricsDuration.ThirtyMinutes]: `${startDateOffsetMap[MetricsDuration.ThirtyMinutes] / 60}s`,
    [MetricsDuration.OneHours]: `${startDateOffsetMap[MetricsDuration.OneHours] / 60}s`,
    [MetricsDuration.TwoHours]: `${startDateOffsetMap[MetricsDuration.TwoHours] / 60}s`,
    [MetricsDuration.SixHours]: `${startDateOffsetMap[MetricsDuration.SixHours] / 60}s`,
    [MetricsDuration.OneDay]: `${startDateOffsetMap[MetricsDuration.OneDay] / 60}s`,
    [MetricsDuration.OneWeek]: '12h',
    [MetricsDuration.TwoWeeks]: '24h',
};

export let PROMETHEUS_PATH: string | undefined = undefined;
// Override the default prometheus path with the value from the skupper flow collector api
export const setPrometheusUrl = (url: string | undefined) => (PROMETHEUS_PATH = url);

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
    getDataTrafficPerSecondByProcess(
        paramSource: string,
        paramDest: string,
        range: keyof ValidWindowTime,
    ) {
        return `sum by(direction)(rate(octets_total{${paramSource}}[${range}]) or rate(octets_total{${paramDest}}[${range}]))`;
    },
};
