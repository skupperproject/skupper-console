import { getCurrentAndPastTimestamps } from '@core/utils/getCurrentAndPastTimestamps';

import { axiosFetch } from './axiosMiddleware';
import {
  PrometheusApiResult as PrometheusMetricData,
  PrometheusApiSingleResult as PrometheusMetricSingleData,
  PrometheusQueryParams,
  PrometheusResponse
} from './Prometheus.interfaces';
import { gePrometheusQueryPATH, getPrometheusCredentials, queries } from './Prometheus.queries';

export const PrometheusApi = {
  fetchBytes: async ({
    id,
    range,
    processIdDest,
    protocol
  }: PrometheusQueryParams): Promise<PrometheusMetricSingleData[]> => {
    let param = '';

    if (id) {
      param = [param, `sourceProcess=~"${id}"`].filter(Boolean).join(',');
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
      params: { query: queries.getBytesByDirection(param, `${range.seconds + 60}s`) },
      auth: getPrometheusCredentials()
    });

    return result;
  },

  //When direction is outgoing, it is the response from from the server (sourceProcess) to the client (destProcess)
  fetchByteRateSeries: async ({
    id,
    range,
    processIdDest,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let param = '';

    if (id) {
      param = [param, `sourceProcess=~"${id}"`].filter(Boolean).join(',');
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
        step: range.step
      },
      auth: getPrometheusCredentials()
    });

    // it retrieves 2 arrays of [values, timestamps], 1) received traffic 2) sent traffic
    return result;
  },

  fetchAllProcessPairsByteRates: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllProcessPairsByteRates() },
      auth: getPrometheusCredentials()
    });

    return result;
  },

  fetchAllProcessPairsLatencies: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getAllProcessPairsLatencies() },
      auth: getPrometheusCredentials()
    });

    return result;
  },

  fetchLatencyByProcess: async ({
    id,
    range,
    processIdDest,
    quantile,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let param = `sourceProcess=~"${id}"`;

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
        step: range.step
      },
      auth: getPrometheusCredentials()
    });

    return result;
  },

  fetchRequestsByProcess: async ({
    id,
    range,
    processIdDest,
    protocol
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    const { start, end } = getCurrentAndPastTimestamps(range.seconds);
    let param = `sourceProcess=~"${id}"`;

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
        step: range.step
      },
      auth: getPrometheusCredentials()
    });

    return result;
  },

  fetchTotalRequests: async ({
    id,
    range,
    processIdDest,
    protocol
  }: PrometheusQueryParams): Promise<PrometheusMetricSingleData[]> => {
    let param = `sourceProcess=~"${id}"`;

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
        query: queries.getTotalRequestsTimeInterval(param, `${range.seconds}s`)
      },
      auth: getPrometheusCredentials()
    });

    return result;
  },

  fetchAvgRequestRate: async ({
    id,
    range,
    processIdDest,
    protocol
  }: PrometheusQueryParams): Promise<PrometheusMetricSingleData[]> => {
    let param = `sourceProcess=~"${id}"`;

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
        query: queries.getAvgRequestRateTimeInterval(param, `${range.seconds}s`)
      },
      auth: getPrometheusCredentials()
    });

    return result;
  },

  fetchResponsesByProcess: async ({
    id,
    range,
    processIdDest,
    isRate = false,
    onlyErrors = false,
    protocol
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    const { start, end } = getCurrentAndPastTimestamps(range.seconds);
    let param = `destProcess=~"${id}"`;

    if (onlyErrors) {
      const code = onlyErrors ? '"4.*|5.*"' : '"2.*|3.*|4.*|5.*"';
      param = [param, `code=~${code}`].join(',');
    }

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
        query: isRate ? queries.getHttpPartialStatusRateTimeInterval(param, '5m') : queries.getHttpPartialStatus(param),
        start,
        end,
        step: isRate ? range.step : range.value
      },
      auth: getPrometheusCredentials()
    });

    return result;
  },

  fetchFlowsByAddress: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getTotalFlowsByAddress() },
      auth: getPrometheusCredentials()
    });

    return result;
  },

  fetchActiveFlowsByAddress: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getActiveFlowsByAddress() },
      auth: getPrometheusCredentials()
    });

    return result;
  },

  fetchTcpByteRateByAddress: async ({
    addressName
  }: {
    addressName: string;
  }): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getTcpByteRateByAddress(addressName) },
      auth: getPrometheusCredentials()
    });

    return result;
  }
};
