import { fetchApiData } from './apiClient';
import { queries } from './Prometheus.queries';
import { convertToPrometheusQueryParams, gePrometheusQueryPATH } from './Prometheus.utils';
import {
  PrometheusQueryParams,
  PrometheusResponse,
  PrometheusLabels,
  PrometheusQueryParamsLatency,
  PrometheusMetric
} from '../types/Prometheus.interfaces';

export const PrometheusApi = {
  fetchByteRateInTimeRange: async (
    params: PrometheusQueryParams,
    isRx = false
  ): Promise<PrometheusMetric<'matrix'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getByteRateInTimeRange(queryFilterString, '1m', isRx),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchPercentilesByLeInTimeRange: async (
    params: PrometheusQueryParamsLatency
  ): Promise<PrometheusMetric<'matrix'>[]> => {
    const { start, end, step, quantile, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getPercentilesByLeInTimeRange(queryFilterString, '1m', quantile),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchBucketCountsInTimeRange: async (params: PrometheusQueryParams): Promise<PrometheusMetric<'matrix'>[]> => {
    const { start, end, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getBucketCountsInTimeRange(queryFilterString, `${end - start}s`),
        start,
        end,
        step: `${end - start}s`
      }
    });

    return result;
  },

  fetchRequestRateByMethodInInTimeRange: async (
    params: PrometheusQueryParams
  ): Promise<PrometheusMetric<'matrix'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getRequestRateByMethodInInTimeRange(queryFilterString, `1m`),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchResponseCountsByPartialCodeInTimeRange: async (
    params: PrometheusQueryParams
  ): Promise<PrometheusMetric<'matrix'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams({ ...queryParams, code: '2.*|3.*|4.*|5.*' });

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getResponseCountsByPartialCodeInTimeRange(queryFilterString, `${end - start}s`),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchHttpErrorRateByPartialCodeInTimeRange: async (
    params: PrometheusQueryParams
  ): Promise<PrometheusMetric<'matrix'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams({ ...queryParams, code: '4.*|5.*' });

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getResponseRateByPartialCodeInTimeRange(queryFilterString, '5m'),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchAllProcessPairsBytes: async (
    groupBy: string,
    filters?: PrometheusLabels,
    isRx = false
  ): Promise<PrometheusMetric<'vector'>[]> => {
    const queryFilterString = filters ? convertToPrometheusQueryParams(filters) : undefined;

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllPairsBytes(groupBy, queryFilterString, isRx) }
    });

    return result;
  },

  fetchAllProcessPairsByteRates: async (
    groupBy: string,
    filters?: PrometheusLabels,
    isRx = false
  ): Promise<PrometheusMetric<'vector'>[]> => {
    const queryFilterString = filters ? convertToPrometheusQueryParams(filters) : undefined;

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllPairsByteRates(groupBy, queryFilterString, isRx) }
    });

    return result;
  },

  fetchAllProcessPairsLatencies: async (
    groupBy: string,
    filters?: PrometheusLabels
  ): Promise<PrometheusMetric<'vector'>[]> => {
    const queryFilterString = filters ? convertToPrometheusQueryParams(filters) : undefined;

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllPairsLatencies(groupBy, queryFilterString) }
    });

    return result;
  },

  fetchOpenConnectionsInTimeRange: async (params: PrometheusQueryParams): Promise<PrometheusMetric<'matrix'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getOpenConnections(queryFilterString),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchOpenConnections: async (params: PrometheusQueryParams): Promise<PrometheusMetric<'vector'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await fetchApiData<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: {
        query: queries.getOpenConnections(queryFilterString),
        start,
        end,
        step
      }
    });

    return result;
  }
};
