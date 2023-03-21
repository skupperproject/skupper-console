import { axiosFetch } from './axiosMiddleware';
import { gePrometheusQueryPATH, queries, rangeStepIntervalMap, startDateOffsetMap } from './Prometheus.constant';
import { PrometheusApiResult, PrometheusQueryParams, ValidWindowTimeValues } from './Prometheus.interfaces';

export const PrometheusApi = {
  fetchTotalRequestByProcess: async ({
    id,
    range,
    processIdDest,
    isRate = false
  }: PrometheusQueryParams): Promise<PrometheusApiResult[]> => {
    const { start, end } = getRangeTimestamp(range);
    let param = `sourceProcess="${id}"`;

    if (processIdDest) {
      param = [param, `destProcess="${processIdDest}"`].join(',');
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
        step: isRate ? rangeStepIntervalMap[range] : range
      }
    });

    return result;
  },

  fetchLatencyByProcess: async ({
    id,
    range,
    processIdDest,
    quantile,
    protocol
  }: PrometheusQueryParams): Promise<PrometheusApiResult[]> => {
    const { start, end } = getRangeTimestamp(range);
    let param = `sourceProcess="${id}"`;

    if (processIdDest) {
      param = [param, `destProcess="${processIdDest}"`].join(',');
    }

    if (processIdDest) {
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
        step: rangeStepIntervalMap[range]
      }
    });

    return result;
  },

  fetchStatusCodesByProcess: async ({
    id,
    range,
    processIdDest,
    isRate = false
  }: PrometheusQueryParams): Promise<PrometheusApiResult[]> => {
    const { start, end } = getRangeTimestamp(range);
    let param = `destProcess="${id} "`;

    if (processIdDest) {
      param = [param, `sourceProcess="${processIdDest}"`].join(',');
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
        step: isRate ? rangeStepIntervalMap[range] : range
      }
    });

    // it retrieves X arrays of [values, timestamps], 2XX, 3XX, 4XX, 5XX
    return result;
  },

  fetchDataTraffic: async ({
    id,
    range,
    processIdDest,
    isRate = false,
    protocol
  }: PrometheusQueryParams): Promise<PrometheusApiResult[]> => {
    const { start, end } = getRangeTimestamp(range);
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
        step: isRate ? rangeStepIntervalMap[range] : range
      }
    });

    // it retrieves 2 arrays of [values, timestamps], 1) received traffic 2) sent traffic
    return result;
  }
};

function getRangeTimestamp(range: ValidWindowTimeValues): { start: number; end: number } {
  const now = new Date().getTime() / 1000; // convert in second

  return {
    start: now - startDateOffsetMap[range] || 0,
    end: now
  };
}
