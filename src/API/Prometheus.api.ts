import { PROMETHEUS_URL } from '@config/config';

import { axiosFetch } from './apiMiddleware';
import {
  PrometheusApiResult as PrometheusMetricData,
  PrometheusApiSingleResult as PrometheusMetricSingleData,
  PrometheusQueryParams,
  PrometheusQueryParamsSingleData,
  PrometheusResponse
} from './Prometheus.interfaces';
import { queries } from './Prometheus.queries';

export const PrometheusApi = {
  fetchBytes: async ({
    sourceProcess,
    destProcess,
    seconds,
    protocol
  }: PrometheusQueryParamsSingleData): Promise<PrometheusMetricSingleData[]> => {
    let queryFilters = '';

    if (sourceProcess) {
      queryFilters = [queryFilters, `sourceProcess=~"${sourceProcess}"`].filter(Boolean).join(',');
    }

    if (destProcess) {
      queryFilters = [queryFilters, `destProcess=~"${destProcess}"`].filter(Boolean).join(',');
    }

    if (protocol) {
      queryFilters = [queryFilters, `protocol=~"${protocol}"`].filter(Boolean).join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getBytesByDirection(queryFilters, `${seconds}s`) }
    });

    return result;
  },

  //When direction is outgoing, it is the response from from the server (sourceProcess) to the client (destProcess)
  fetchByteRateSeries: async ({
    sourceProcess,
    step,
    destProcess,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let queryFilters = '';

    if (sourceProcess) {
      queryFilters = [queryFilters, `sourceProcess=~"${sourceProcess}"`].filter(Boolean).join(',');
    }

    if (destProcess) {
      queryFilters = [queryFilters, `destProcess=~"${destProcess}"`].filter(Boolean).join(',');
    }

    if (protocol) {
      queryFilters = [queryFilters, `protocol=~"${protocol}"`].filter(Boolean).join(',');
    }

    const query = queries.getByteRateByDirectionTimeInterval(queryFilters, '1m');
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query,
        start,
        end,
        step
      }
    });

    // it retrieves 2 arrays of [values, timestamps], 1) received traffic 2) sent traffic
    return result;
  },

  fetchLatencyByProcess: async ({
    sourceProcess,
    destProcess,
    step,
    protocol,
    quantile,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let queryFilters = `sourceProcess=~"${sourceProcess}"`;

    if (destProcess) {
      queryFilters = [queryFilters, `destProcess=~"${destProcess}"`].join(',');
    }

    if (protocol) {
      queryFilters = [queryFilters, `protocol=~"${protocol}"`].join(',');
    }
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: quantile
          ? queries.getQuantileTimeInterval(queryFilters, '1m', quantile)
          : queries.getAvgLatencyTimeInterval(queryFilters, '1m'),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchRequestsByProcess: async ({
    sourceProcess,
    destProcess,
    step,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let queryFilters = `sourceProcess=~"${sourceProcess}"`;

    if (destProcess) {
      queryFilters = [queryFilters, `destProcess=~"${destProcess}"`].join(',');
    }

    if (protocol) {
      queryFilters = [queryFilters, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getTotalRequestRateByMethodTimeInterval(queryFilters, `1m`),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchTotalRequests: async ({
    sourceProcess,
    destProcess,
    seconds,
    protocol
  }: PrometheusQueryParamsSingleData): Promise<PrometheusMetricSingleData[]> => {
    let queryFilters = `sourceProcess=~"${sourceProcess}"`;

    if (destProcess) {
      queryFilters = [queryFilters, `destProcess=~"${destProcess}"`].join(',');
    }

    if (protocol) {
      queryFilters = [queryFilters, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: {
        query: queries.getTotalRequestsTimeInterval(queryFilters, `${seconds}s`)
      }
    });

    return result;
  },

  fetchAvgRequestRate: async ({
    sourceProcess,
    destProcess,
    seconds,
    protocol
  }: PrometheusQueryParamsSingleData): Promise<PrometheusMetricSingleData[]> => {
    let queryFilters = `sourceProcess=~"${sourceProcess}"`;

    if (destProcess) {
      queryFilters = [queryFilters, `destProcess=~"${destProcess}"`].join(',');
    }

    if (protocol) {
      queryFilters = [queryFilters, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: {
        query: queries.getAvgRequestRateTimeInterval(queryFilters, `${seconds}s`)
      }
    });

    return result;
  },

  fetchResponseCountsByProcess: async ({
    sourceProcess,
    destProcess,
    protocol,
    start,
    end,
    step
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let queryFilters = `destProcess=~"${sourceProcess}"`;

    if (destProcess) {
      queryFilters = [queryFilters, `sourceProcess=~"${destProcess}"`].join(',');
    }

    if (protocol) {
      queryFilters = [queryFilters, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getHttpPartialStatus(queryFilters),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchErrorResponsesByProcess: async ({
    sourceProcess,
    destProcess,
    step,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let queryFilters = `destProcess=~"${sourceProcess}"`;

    const code = '"4.*|5.*"';
    queryFilters = [queryFilters, `code=~${code}`].join(',');

    if (destProcess) {
      queryFilters = [queryFilters, `sourceProcess=~"${destProcess}"`].join(',');
    }

    if (protocol) {
      queryFilters = [queryFilters, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getHttpPartialStatusRateTimeInterval(queryFilters, '5m'),
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

  fethServicePairsByService: async ({
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
