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
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    seconds,
    protocol,
    direction
  }: PrometheusQueryParamsSingleData): Promise<PrometheusMetricSingleData[]> => {
    let queryFilters: string[] = [];

    if (sourceSite) {
      queryFilters = [...queryFilters, `sourceSite=~"${sourceSite}"`].filter(Boolean);
    }

    if (destSite) {
      queryFilters = [...queryFilters, `destSite=~"${destSite}"`].filter(Boolean);
    }

    if (sourceProcess) {
      queryFilters = [...queryFilters, `sourceProcess=~"${sourceProcess}"`].filter(Boolean);
    }

    if (destProcess) {
      queryFilters = [...queryFilters, `destProcess=~"${destProcess}"`].filter(Boolean);
    }

    if (protocol) {
      queryFilters = [...queryFilters, `protocol=~"${protocol}"`].filter(Boolean);
    }

    if (direction) {
      queryFilters = [...queryFilters, `direction=~"${direction}"`].filter(Boolean);
    }

    const queryFilterString = queryFilters.join(',');

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getBytesByDirection(queryFilterString, `${seconds}s`) }
    });

    return result;
  },

  //When direction is outgoing, it is the response from from the server (sourceProcess) to the client (destProcess)
  fetchByteRateSeries: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    direction,
    step,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let queryFilters: string[] = [];

    if (sourceSite) {
      queryFilters = [...queryFilters, `sourceSite=~"${sourceSite}"`].filter(Boolean);
    }

    if (destSite) {
      queryFilters = [...queryFilters, `destSite=~"${destSite}"`].filter(Boolean);
    }

    if (sourceProcess) {
      queryFilters = [...queryFilters, `sourceProcess=~"${sourceProcess}"`].filter(Boolean);
    }

    if (destProcess) {
      queryFilters = [...queryFilters, `destProcess=~"${destProcess}"`].filter(Boolean);
    }

    if (protocol) {
      queryFilters = [...queryFilters, `protocol=~"${protocol}"`].filter(Boolean);
    }

    if (direction) {
      queryFilters = [...queryFilters, `direction=~"${direction}"`].filter(Boolean);
    }

    const queryFilterString = queryFilters.join(',');

    const query = queries.getByteRateByDirectionTimeInterval(queryFilterString, '1m');
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
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    step,
    protocol,
    quantile,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let queryFilters: string[] = [];

    if (sourceSite) {
      queryFilters = [...queryFilters, `sourceSite=~"${sourceSite}"`].filter(Boolean);
    }

    if (destSite) {
      queryFilters = [...queryFilters, `destSite=~"${destSite}"`].filter(Boolean);
    }

    if (sourceProcess) {
      queryFilters = [...queryFilters, `sourceProcess=~"${sourceProcess}"`];
    }

    if (destProcess) {
      queryFilters = [...queryFilters, `destProcess=~"${destProcess}"`];
    }

    if (protocol) {
      queryFilters = [...queryFilters, `protocol=~"${protocol}"`];
    }

    const queryFilterString = queryFilters.join(',');

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: quantile
          ? queries.getQuantileTimeInterval(queryFilterString, '1m', quantile)
          : queries.getAvgLatencyTimeInterval(queryFilterString, '1m'),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchRequestsByProcess: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    step,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let queryFilters: string[] = [];

    if (sourceSite) {
      queryFilters = [...queryFilters, `sourceSite=~"${sourceSite}"`].filter(Boolean);
    }

    if (destSite) {
      queryFilters = [...queryFilters, `destSite=~"${destSite}"`].filter(Boolean);
    }

    if (sourceProcess) {
      queryFilters = [...queryFilters, `sourceProcess=~"${sourceProcess}"`];
    }

    if (destProcess) {
      queryFilters = [...queryFilters, `destProcess=~"${destProcess}"`];
    }

    if (protocol) {
      queryFilters = [...queryFilters, `protocol=~"${protocol}"`];
    }

    const queryFilterString = queryFilters.join(',');

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

  fetchResponseCountsByProcess: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    protocol,
    start,
    end,
    step
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let queryFilters: string[] = [`code=~"2.*|3.*|4.*|5.*"`];

    if (sourceSite) {
      queryFilters = [...queryFilters, `sourceSite=~"${sourceSite}"`].filter(Boolean);
    }

    if (destSite) {
      queryFilters = [...queryFilters, `destSite=~"${destSite}"`].filter(Boolean);
    }

    if (sourceProcess) {
      queryFilters = [...queryFilters, `sourceProcess=~"${sourceProcess}"`];
    }

    if (destProcess) {
      queryFilters = [...queryFilters, `destProcess=~"${destProcess}"`];
    }

    if (protocol) {
      queryFilters = [...queryFilters, `protocol=~"${protocol}"`];
    }

    const queryFilterString = queryFilters.join(',');

    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query: queries.getHttpPartialStatus(queryFilterString),
        start,
        end,
        step
      }
    });

    return result;
  },

  fetchErrorResponsesByProcess: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    step,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let queryFilters = [`code=~"4.*|5.*"`];
    if (sourceSite) {
      queryFilters = [...queryFilters, `sourceSite=~"${sourceSite}"`].filter(Boolean);
    }

    if (destSite) {
      queryFilters = [...queryFilters, `destSite=~"${destSite}"`].filter(Boolean);
    }

    if (sourceProcess) {
      queryFilters = [...queryFilters, `sourceProcess=~"${sourceProcess}"`];
    }

    if (destProcess) {
      queryFilters = [...queryFilters, `destProcess=~"${destProcess}"`];
    }

    if (protocol) {
      queryFilters = [...queryFilters, `protocol=~"${protocol}"`];
    }
    const queryFilterString = queryFilters.join(',');

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
