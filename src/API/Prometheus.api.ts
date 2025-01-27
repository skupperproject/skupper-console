import { queries } from './Prometheus.queries';
import { executeQuery, getPrometheusResolutionInSeconds } from './Prometheus.utils';
import { PrometheusQueryParams, PrometheusLabels, PrometheusQueryParamsLatency } from '../types/Prometheus.interfaces';

const fetchByteRateInTimeRange = async (params: PrometheusQueryParams, isRx = false) => {
  const interval = getPrometheusResolutionInSeconds(params.end - params.start).loopback;

  return executeQuery(queries.getByteRateInTimeRange, params, 'matrix', [interval, isRx]);
};

const fetchPercentilesByLeInTimeRange = async (params: PrometheusQueryParamsLatency) => {
  const interval = getPrometheusResolutionInSeconds(params.end - params.start).loopback;

  return executeQuery(queries.calculateHistogramPercentileTimeRange, params, 'matrix', [interval, params.quantile]);
};

const fetchRequestRateByMethodInTimeRange = async (params: PrometheusQueryParams) => {
  const interval = getPrometheusResolutionInSeconds(params.end - params.start).loopback;

  return executeQuery(queries.getRequestRateByMethodInInTimeRange, params, 'matrix', [interval]);
};

const fetchResponseCountsByPartialCodeInTimeRange = async (params: PrometheusQueryParams) =>
  executeQuery(queries.getResponseCountsByPartialCodeInTimeRange, { ...params, code: '2.*|3.*|4.*|5.*' }, 'matrix', [
    `${params.end - params.start}s`
  ]);

const fetchHttpErrorRateByPartialCodeInTimeRange = async (params: PrometheusQueryParams) =>
  executeQuery(queries.getResponseRateByPartialCodeInTimeRange, { ...params, code: '4.*|5.*' }, 'matrix', ['5m']);

const fetchNetworkTrafficData = async (
  groupBy: string,
  type: 'bytes' | 'rates',
  filters?: PrometheusLabels,
  isRx = false
) => {
  const queryMap = {
    bytes: queries.getCurrentBytes,
    rates: queries.getCurrentByteRate
  };

  return executeQuery(queryMap[type], { ...filters }, 'vector', [groupBy, isRx]);
};

const fetchOpenConnections = async (params: PrometheusQueryParams) =>
  executeQuery(queries.getOpenConnections, params, 'vector');

const fetchOpenConnectionsInTimeRange = async (params: PrometheusQueryParams) =>
  executeQuery(queries.getOpenConnections, params, 'matrix');

export const PrometheusApi = {
  fetchByteRateInTimeRange,
  fetchPercentilesByLeInTimeRange,
  fetchRequestRateByMethodInInTimeRange: fetchRequestRateByMethodInTimeRange,
  fetchResponseCountsByPartialCodeInTimeRange,
  fetchHttpErrorRateByPartialCodeInTimeRange,
  fetchProcessPairs: fetchNetworkTrafficData,
  fetchOpenConnections,
  fetchOpenConnectionsInTimeRange
};
