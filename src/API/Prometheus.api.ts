import { PROMETHEUS_URL } from '@config/config';
import {
  PrometheusQueryParams,
  PrometheusResponse,
  PrometheusLabels,
  PrometheusQueryParamsLatency,
  PrometheusMetric
} from '@sk-types/Prometheus.interfaces';

import { axiosFetch } from './apiMiddleware';
import { queries } from './Prometheus.queries';

export const PrometheusApi = {
  //When direction is outgoing, it is the response from from the server (sourceProcess) to the client (destProcess)
  fetchByteRateByDirectionInTimeRange: async (params: PrometheusQueryParams): Promise<PrometheusMetric<'matrix'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<'matrix'>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getByteRateByDirectionInTimeRange(queryFilterString, '1m'),
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
    filters?: PrometheusLabels
  ): Promise<PrometheusMetric<'vector'>[]> => {
    const queryFilterString = filters ? convertToPrometheusQueryParams(filters) : undefined;

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllPairsBytes(groupBy, queryFilterString) }
    });

    return result;
  },

  fetchAllProcessPairsByteRates: async (
    groupBy: string,
    filters?: PrometheusLabels
  ): Promise<PrometheusMetric<'vector'>[]> => {
    const queryFilterString = filters ? convertToPrometheusQueryParams(filters) : undefined;

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllPairsByteRates(groupBy, queryFilterString) }
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

  fetchtotalFlows: async (params: PrometheusQueryParams): Promise<PrometheusMetric<'vector'>[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<'vector'>>(gePrometheusQueryPATH('single'), {
      params: {
        query: queries.getTotalFlows(queryFilterString),
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
    const client = clientType === 'client' ? ' sourceProcess, sourceSite' : 'sourceSite';
    const server = serverType === 'server' ? 'destProcess,   destSite' : 'destSite';

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
      params: { query: queries.getResourcePairsByService(queryFilters, `${client}, ${server}`, '1h') }
    });

    return result;
  }
};

const gePrometheusQueryPATH = (queryType: 'single' | 'range' = 'range') =>
  queryType === 'range' ? `${PROMETHEUS_URL}/rangequery/` : `${PROMETHEUS_URL}/query/`;

function convertToPrometheusQueryParams({
  sourceSite,
  sourceProcess,
  destSite,
  destProcess,
  service,
  protocol,
  direction,
  code
}: PrometheusLabels) {
  let queryFilters: string[] = [];

  if (sourceSite) {
    queryFilters = [...queryFilters, `sourceSite=~"${sourceSite}"`];
  }

  if (destSite) {
    queryFilters = [...queryFilters, `destSite=~"${destSite}"`];
  }

  if (sourceProcess) {
    queryFilters = [...queryFilters, `sourceProcess=~"${sourceProcess}"`];
  }

  if (destProcess) {
    queryFilters = [...queryFilters, `destProcess=~"${destProcess}"`];
  }

  if (service) {
    queryFilters = [...queryFilters, `address=~"${service}"`];
  }

  if (protocol) {
    queryFilters = [...queryFilters, `protocol=~"${protocol}"`];
  }

  if (code) {
    queryFilters = [...queryFilters, `code=~"${code}"`];
  }

  if (direction) {
    queryFilters = [...queryFilters, `direction=~"${direction}"`];
  }

  return queryFilters.join(',');
}
