import { PrometheusLabelsV2 } from '@config/prometheus';
import {
  PrometheusQueryParams,
  PrometheusResponse,
  PrometheusLabels,
  PrometheusQueryParamsLatency,
  PrometheusMetric
} from '@sk-types/Prometheus.interfaces';

import { axiosFetch } from './apiMiddleware';
import { queries } from './Prometheus.queries';
import { convertToPrometheusQueryParams, gePrometheusQueryPATH } from './Prometheus.utils';

export const PrometheusApi = {
  //When direction is outgoing, it is the response from from the server (sourceProcess) to the client (destProcess)
  fetchByteRateByDirectionInTimeRange: async (
    params: PrometheusQueryParams,
    isRx = false
  ): Promise<PrometheusMetric<'matrix'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getByteRateByDirectionInTimeRange(queryFilterString, '1m', isRx),
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
    } = await axiosFetch<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
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
    } = await axiosFetch<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
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
    } = await axiosFetch<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
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
    } = await axiosFetch<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
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
    } = await axiosFetch<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
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
    } = await axiosFetch<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
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
    } = await axiosFetch<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
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
    } = await axiosFetch<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllPairsLatencies(groupBy, queryFilterString) }
    });

    return result;
  },

  fetchTcpActiveFlowsByService: async (): Promise<PrometheusMetric<'vector'>[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getTcpActiveFlowsByService() }
    });

    return result;
  },

  fetchTcpByteRateByService: async ({
    serviceName
  }: {
    serviceName: string;
  }): Promise<PrometheusMetric<'vector'>[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getTcpByteRateByService(serviceName) }
    });

    return result;
  },

  fetchFlowsDeltaInTimeRange: async (params: PrometheusQueryParams): Promise<PrometheusMetric<'matrix'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getActiveFlowsInTimeRange(queryFilterString),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchLiveFlows: async (params: PrometheusQueryParams): Promise<PrometheusMetric<'vector'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: {
        query: queries.getActiveFlows(queryFilterString),
        start,
        end,
        step
      }
    });

    return result;
  },

  fethResourcePairsByService: async ({
    serviceName,
    clientType,
    serverType,
    sourceProcesses,
    destProcesses
  }: {
    serviceName: string;
    clientType: 'client' | 'clientSite';
    serverType: 'server' | 'serverSite';
    sourceProcesses?: string;
    destProcesses?: string;
  }): Promise<PrometheusMetric<'vector'>[]> => {
    const client =
      clientType === 'client'
        ? `${PrometheusLabelsV2.SourceProcess},${PrometheusLabelsV2.SourceSiteName}`
        : PrometheusLabelsV2.SourceSiteName;
    const server =
      serverType === 'server'
        ? `${PrometheusLabelsV2.DestProcess},${PrometheusLabelsV2.DestSiteName}`
        : PrometheusLabelsV2.DestSiteName;

    let queryFilters = `address="${serviceName}", direction="incoming"`;

    if (sourceProcesses) {
      queryFilters = [queryFilters, `sourceProcess=~"${sourceProcesses}"`].join(',');
    }

    if (destProcesses) {
      queryFilters = [queryFilters, `destProcess=~"${destProcesses}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getResourcePairsByService(queryFilters, `${client},${server}`, '1h') }
    });

    return result;
  }
};
