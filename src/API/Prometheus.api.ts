import { queries } from './Prometheus.queries';
import { executeQuery, getPrometheusResolutionInSeconds } from './Prometheus.utils';
import { PrometheusQueryParams, PrometheusLabels, PrometheusQueryParamsLatency } from '../types/Prometheus.interfaces';

const fetchByteRateHistory = async (params: PrometheusQueryParams, isRx = false) => {
  const interval = getPrometheusResolutionInSeconds(params.end - params.start).loopback;

  return executeQuery(queries.getByteRateInTimeRange, params, 'matrix', [interval, isRx]);
};

const fetchPercentilesByLeHistory = async (params: PrometheusQueryParamsLatency) => {
  const interval = getPrometheusResolutionInSeconds(params.end - params.start).loopback;

  return executeQuery(queries.calculateHistogramPercentileTimeRange, params, 'matrix', [interval, params.quantile]);
};

const fetchRequestRateByMethodHistory = async (params: PrometheusQueryParams) => {
  const interval = getPrometheusResolutionInSeconds(params.end - params.start).loopback;

  return executeQuery(queries.getRequestRateByMethodInInTimeRange, params, 'matrix', [interval]);
};

const fetchResponseCountsByPartialCodeHistory = async (params: PrometheusQueryParams) =>
  executeQuery(queries.getResponseCountsByPartialCodeInTimeRange, { ...params, code: '2.*|3.*|4.*|5.*' }, 'matrix', [
    `${params.end - params.start}s`
  ]);

const fetchHttpErrorRateByPartialCodeHistory = async (params: PrometheusQueryParams) =>
  executeQuery(queries.getResponseRateByPartialCodeInTimeRange, { ...params, code: '4.*|5.*' }, 'matrix', ['5m']);

const fetchInstantOpenConnections = async (params: PrometheusQueryParams) =>
  executeQuery(queries.getOpenConnections, params, 'vector');

const fetchOpenConnectionsHistory = async (params: PrometheusQueryParams) =>
  executeQuery(queries.getOpenConnections, params, 'matrix');

const fetchInstantTrafficValue = async (
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

export const PrometheusApi = {
  fetchByteRateHistory,
  fetchPercentilesByLeHistory,
  fetchRequestRateByMethodHistory,
  fetchResponseCountsByPartialCodeHistory,
  fetchHttpErrorRateByPartialCodeHistory,
  fetchInstantTrafficValue,
  fetchInstantOpenConnections,
  fetchOpenConnectionsHistory
};
