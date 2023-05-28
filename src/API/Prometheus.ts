import { getCurrentAndPastTimestamps } from '@core/utils/getCurrentAndPastTimestamps';

import { axiosFetch } from './axiosMiddleware';
import {
  PrometheusApiResult as PrometheusMetricData,
  PrometheusApiSingleResult as PrometheusMetricSingleData,
  PrometheusQueryParams,
  PrometheusResponse
} from './Prometheus.interfaces';
import { gePrometheusQueryPATH, queries } from './Prometheus.queries';

export const PrometheusApi = {
  // When direction is incoming, the sourceProcess is the client and the destProcess is the server.
  fetchDataTrafficOut: async ({
    id,
    range,
    processIdDest,
    isRate = false,
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

    param = [param, `direction="incoming"`].join(',');

    let query = queries.getBytesByDirection(param);

    if (isRate) {
      query = queries.getByteRateByDirection(param, '1m');
    }
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query,
        start,
        end,
        step: isRate ? range.step : range.value
      }
    });

    // it retrieves 2 arrays of [values, timestamps], 1) received traffic 2) sent traffic
    return result;
  },
  //When direction is outoing, it is the response from from the server (sourceProcess) to the client (destProcess)
  fetchDataTrafficIn: async ({
    id,
    range,
    processIdDest,
    isRate = false,
    protocol,
    start,
    end
  }: PrometheusQueryParams): Promise<PrometheusMetricData[]> => {
    let param = `destProcess=~"${id}"`;

    if (processIdDest) {
      param = [param, `sourceProcess=~"${processIdDest}"`].join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].join(',');
    }

    param = [param, `direction="outgoing"`].join(',');

    let query = queries.getBytesByDirection(param);

    if (isRate) {
      query = queries.getByteRateByDirection(param, '1m');
    }
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricData[]>>(gePrometheusQueryPATH(), {
      params: {
        query,
        start,
        end,
        step: isRate ? range.step : range.value
      }
    });

    // it retrieves 2 arrays of [values, timestamps], 1) received traffic 2) sent traffic
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
        query: quantile ? queries.getQuantile(param, '1m', quantile) : queries.getAvgLatency(param, '1m'),
        start,
        end,
        step: range.step
      }
    });

    return result;
  },

  fetchRequestsByProcess: async ({
    id,
    range,
    processIdDest,
    isRate = false,
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
        query: isRate ? queries.getTotalRequestRateByMethod(param, '1m') : queries.getTotalRequests(param),
        start,
        end,
        step: isRate ? range.step : range.value
      }
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
        query: isRate ? queries.getHttpPartialStatusRate(param, '5m') : queries.getHttpPartialStatus(param),
        start,
        end,
        step: isRate ? range.step : range.value
      }
    });

    return result;
  },

  fetchFlowsByAddress: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getTotalFlowsByAddress() }
    });

    return result;
  },

  fetchActiveFlowsByAddress: async (): Promise<PrometheusMetricSingleData[]> => {
    const {
      data: { result }
    } = await axiosFetch<PrometheusResponse<PrometheusMetricSingleData[]>>(gePrometheusQueryPATH('single'), {
      params: { query: queries.getActiveFlowsByAddress() }
    });

    return result;
  }
};
