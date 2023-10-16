import { PROMETHEUS_URL } from '@config/config';

import { axiosFetch } from './apiMiddleware';
import {
  PrometheusApiResult as PrometheusMetricData,
  PrometheusApiSingleResult as PrometheusMetricSingleData,
  PrometheusQueryParams,
  PrometheusResponse,
  PrometheusLabels,
  PrometheusQueryParamsLatency
} from './Prometheus.interfaces';
import { queries } from './Prometheus.queries';

export const PrometheusApi = {
  //When direction is outgoing, it is the response from from the server (sourceProcess) to the client (destProcess)
  fetchByteRateSeries: async (params: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getByteRateByDirectionTimeInterval(queryFilterString, '1m'),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchPercentilesByProcess: async (params: PrometheusQueryParamsLatency): Promise<PrometheusMetricData[]> => {
    const { start, end, step, quantile, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getQuantileTimeInterval(queryFilterString, '1m', quantile),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchLatencyBuckets: async (params: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getLatencyBuckets(queryFilterString, `${end - start}s`),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchRequestsByProcess: async (params: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams(queryParams);

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getTotalRequestRateByMethodTimeInterval(queryFilterString, `1m`),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchResponseCountsByProcess: async (params: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams({ ...queryParams, code: '2.*|3.*|4.*|5.*' });

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getHttpPartialStatus(queryFilterString, `${end - start}s`),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchErrorResponsesByProcess: async (params: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    const { start, end, step, ...queryParams } = params;
    const queryFilterString = convertToPrometheusQueryParams({ ...queryParams, code: '4.*|5.*' });

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getHttpPartialStatusRateTimeInterval(queryFilterString, '5m'),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchAllProcessPairsBytes: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllProcessPairsBytes() }
    });

    return result;
  },

  fetchAllProcessPairsByteRates: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllProcessPairsByteRates() }
    });

    return result;
  },

  fetchAllProcessPairsLatencies: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllProcessPairsLatencies() }
    });

    return result;
  },

  fetchHttpFlowsByService: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getTotalHttpFlowByService() }
    });

    return result;
  },

  fetchTcpFlowsByService: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getTotalTcpFlowByService() }
    });

    return result;
  },

  fetchActiveFlowsByService: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getActiveFlowsByService() }
    });

    return result;
  },

  fetchTcpByteRateByService: async ({
    serviceName
  }: {
    serviceName: string;
  }): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getTcpByteRateByService(serviceName) }
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
  }): Promise<PrometheusMetricSingleData[]> => {
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
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
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
