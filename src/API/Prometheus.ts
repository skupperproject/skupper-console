import { axiosFetch } from './axiosMiddleware';
import { gePrometheusQueryPATH, queries } from './Prometheus.constant';
import { PrometheusApiResult, PrometheusQueryParams } from './Prometheus.interfaces';

export const PrometheusApi = {
  fetchDataTraffic: async ({
    id,
    range,
    processIdDest,
    isRate = false,
    protocol
  }: PrometheusQueryParams): Promise<PrometheusApiResult[]> => {
    const { start, end } = getRangeTimestamp(range.seconds);
    let param1 = `sourceProcess="${id}"`;
    let param2 = `destProcess="${id}"`;

    if (processIdDest) {
      param1 = [param1, `destProcess="${processIdDest}"`].join(',');
      param2 = [param2, `sourceProcess="${processIdDest}"`].join(',');
    }

    if (protocol) {
      param1 = [param1, `protocol=~"${protocol}"`].join(',');
      param2 = [param2, `protocol=~"${protocol}"`].join(',');
    }

    let query = queries.getDataTraffic(param1, param2);

    if (isRate) {
      query = queries.getDataTrafficPerSecondByProcess(param1, param2, '5m');
    }
    const {
      data: {
        data: { result }
      }
    } = await axiosFetch(gePrometheusQueryPATH(), {
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

  fetchLatencyByProcess: async ({
    id,
    range,
    processIdDest,
    quantile,
    protocol
  }: PrometheusQueryParams): Promise<PrometheusApiResult[]> => {
    const { start, end } = getRangeTimestamp(range.seconds);
    let param = `sourceProcess="${id}"`;

    if (processIdDest) {
      param = [param, `destProcess="${processIdDest}"`].join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].join(',');
    }
    const {
      data: {
        data: { result }
      }
    } = await axiosFetch(gePrometheusQueryPATH(), {
      params: {
        query: quantile
          ? queries.getLatencyIrateByProcess(param, '5m', quantile)
          : queries.getAvgLatencyIrateByProcess(param, '5m'),
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
  }: PrometheusQueryParams): Promise<PrometheusApiResult[]> => {
    const { start, end } = getRangeTimestamp(range.seconds);
    let param = `sourceProcess="${id}"`;

    if (processIdDest) {
      param = [param, `destProcess="${processIdDest}"`].join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: {
        data: { result }
      }
    } = await axiosFetch(gePrometheusQueryPATH(), {
      params: {
        query: isRate
          ? queries.getTotalRequestPerSecondByProcess(param, '5m')
          : queries.getTotalRequestsByProcess(param),
        start,
        end,
        step: isRate ? range.step : range.value
      }
    });

    return result;
  },

  fetchSResponsesByProcess: async ({
    id,
    range,
    processIdDest,
    isRate = false,
    onlyErrors = false,
    protocol
  }: PrometheusQueryParams): Promise<PrometheusApiResult[]> => {
    const { start, end } = getRangeTimestamp(range.seconds);
    let param = `destProcess="${id}"`;

    if (onlyErrors) {
      const code = onlyErrors ? '"4.*|5.*"' : '"2.*|3.*|4.*|5.*"';
      param = [param, `code=~${code}`].join(',');
    }

    if (processIdDest) {
      param = [param, `sourceProcess="${processIdDest}"`].join(',');
    }

    if (protocol) {
      param = [param, `protocol=~"${protocol}"`].join(',');
    }

    const {
      data: {
        data: { result }
      }
    } = await axiosFetch(gePrometheusQueryPATH(), {
      params: {
        query: isRate
          ? queries.getResponseStatusCodesPerSecondByProcess(param, '5m')
          : queries.getResponseStatusCodesByProcess(param),
        start,
        end,
        step: isRate ? range.step : range.value
      }
    });

    return result;
  }
};

function getRangeTimestamp(interval: number): { start: number; end: number } {
  const now = new Date().getTime() / 1000; // convert in second

  return {
    start: now - interval,
    end: now
  };
}
