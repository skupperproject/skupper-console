import { fetchApiData } from './apiClient';
import { queries } from './Prometheus.queries';
import { convertToPrometheusQueryParams, gePrometheusQueryPATH } from './Prometheus.utils';
import {
  PrometheusQueryParams,
  PrometheusResponse,
  PrometheusLabels,
  PrometheusQueryParamsLatency,
  PrometheusMetric,
  MetricType,
  PrometheusResult
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

    return fillMatrixTimeseriesGaps(result, start, end);
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
        query: queries.calculateHistogramPercentileTimeRange(queryFilterString, '1m', quantile),
        start,
        end,
        step
      }
    });

    return fillMatrixTimeseriesGaps(result, start, end);
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

    return fillMatrixTimeseriesGaps(result, start, end);
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

    return fillMatrixTimeseriesGaps(result, start, end);
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

    return fillMatrixTimeseriesGaps(result, start, end);
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

/**
 * Fills missing timestamp values in a Prometheus matrix result with zeros.
 * For each metric in the result, it adds data points with value 0 for any timestamp
 * between startTime and endTime that isn't present in the original data.
 */
function fillMatrixTimeseriesGaps(
  result: PrometheusResult<'matrix'> | [],
  startTime: number,
  endTime: number
): PrometheusResult<'matrix'> {
  if (!Array.isArray(result) || result.length === 0) {
    return result as PrometheusResult<'matrix'>;
  }

  const filledResult = result.map((metric: MetricType<'matrix'>) => {
    if (!('values' in metric)) {
      return metric;
    }

    const orderedTimes = metric.values.map(([t]) => t).sort((a, b) => a - b);
    const interval = orderedTimes[1] - orderedTimes[0];
    const filledValues: [number, number | typeof NaN][] = [];

    for (let t = startTime; t <= endTime; t += interval) {
      const value = metric.values.find(([time]) => time === t)?.[1] ?? 0;
      filledValues.push([t, value]);
    }

    return {
      ...metric,
      values: filledValues
    };
  });

  return filledResult as PrometheusResult<'matrix'>;
}
