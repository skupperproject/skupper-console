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
    seconds,
    processIdDest,
    protocol
  }: PrometheusQueryParamsSingleData): Promise<PrometheusMetricSingleData[]> => {
    let param = '';

    if (sourceProcess) {
      param = [param, `sourceProcess=~"${sourceProcess}"`].filter(Boolean).join(',');
    }

    if (processIdDest) {
      param = [param, `destProcess=~"${processIdDest}"`].filter(Boolean).join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].filter(Boolean).join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getBytesByDirection(param, `${seconds}s`) }
    });

    return result;
  },

  //When direction is outgoing, it is the response from from the server (sourceProcess) to the client (destProcess)
  fetchByteRateSeries: async ({
    sourceProcess,
    step,
    processIdDest,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let param = '';

    if (sourceProcess) {
      param = [param, `sourceProcess=~"${sourceProcess}"`].filter(Boolean).join(',');
    }

    if (processIdDest) {
      param = [param, `destProcess=~"${processIdDest}"`].filter(Boolean).join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].filter(Boolean).join(',');
    }

    const query = queries.getByteRateByDirectionTimeInterval(param, '1m');
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
    step,
    processIdDest,
    protocol,
    quantile,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let param = `sourceProcess=~"${sourceProcess}"`;

    if (processIdDest) {
      param = [param, `destProcess=~"${processIdDest}"`].join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].join(',');
    }
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: quantile
          ? queries.getQuantileTimeInterval(param, '1m', quantile)
          : queries.getAvgLatencyTimeInterval(param, '1m'),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchRequestsByProcess: async ({
    sourceProcess,
    step,
    processIdDest,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let param = `sourceProcess=~"${sourceProcess}"`;

    if (processIdDest) {
      param = [param, `destProcess=~"${processIdDest}"`].join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getTotalRequestRateByMethodTimeInterval(param, `1m`),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchTotalRequests: async ({
    sourceProcess,
    seconds,
    processIdDest,
    protocol
  }: PrometheusQueryParamsSingleData): Promise<PrometheusMetricSingleData[]> => {
    let param = `sourceProcess=~"${sourceProcess}"`;

    if (processIdDest) {
      param = [param, `destProcess=~"${processIdDest}"`].join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: {
        query: queries.getTotalRequestsTimeInterval(param, `${seconds}s`)
      }
    });

    return result;
  },

  fetchAvgRequestRate: async ({
    sourceProcess,
    seconds,
    processIdDest,
    protocol
  }: PrometheusQueryParamsSingleData): Promise<PrometheusMetricSingleData[]> => {
    let param = `sourceProcess=~"${sourceProcess}"`;

    if (processIdDest) {
      param = [param, `destProcess=~"${processIdDest}"`].join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: {
        query: queries.getAvgRequestRateTimeInterval(param, `${seconds}s`)
      }
    });

    return result;
  },

  fetchResponseCountsByProcess: async ({
    sourceProcess,
    processIdDest,
    protocol,
    start,
    end,
    step
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let param = `destProcess=~"${sourceProcess}"`;

    if (processIdDest) {
      param = [param, `sourceProcess=~"${processIdDest}"`].join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getHttpPartialStatus(param),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchErrorResponsesByProcess: async ({
    sourceProcess,
    processIdDest,
    step,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let param = `destProcess=~"${sourceProcess}"`;

    const code = '"4.*|5.*"';
    param = [param, `code=~${code}`].join(',');

    if (processIdDest) {
      param = [param, `sourceProcess=~"${processIdDest}"`].join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getHttpPartialStatusRateTimeInterval(param, '5m'),
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

    let param = `address="${serviceName}", direction="incoming"`;

    if (sourceProcesses) {
      param = [param, `sourceProcess=~"${sourceProcesses}"`].join(',');
    }

    if (destProcesses) {
      param = [param, `destProcess=~"${destProcesses}"`].join(',');
    }

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getResourcePairsByService(param, `${client}, ${server}`, '1h') }
    });

    return result;
  }
};

const gePrometheusQueryPATH = (queryType: 'single' | 'range' = 'range') =>
  queryType === 'range' ? `${PROMETHEUS_URL}/rangequery/` : `${PROMETHEUS_URL}/query/`;
