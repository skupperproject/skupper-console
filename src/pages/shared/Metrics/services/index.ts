import { PrometheusApi } from '@API/Prometheus.api';
import { PrometheusApiResult } from '@API/Prometheus.interfaces';
import {
  extractPrometheusLabels,
  extractPrometheusValues,
  extractPrometheusValuesAndLabels
} from '@API/Prometheus.utils';
import { defaultTimeInterval, timeIntervalMap } from '@config/prometheus';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';
import { getCurrentAndPastTimestamps } from '@core/utils/getCurrentAndPastTimestamps';

import {
  QueryMetricsParams,
  LatencyMetricsProps,
  ByteRateMetrics,
  LatencyMetrics,
  RequestMetrics,
  ResponseMetrics,
  BytesMetric
} from './services.interfaces';
import { MetricsLabels } from '../Metrics.enum';

const MetricsController = {
  getBytesData: async ({
    processIdSource,
    timeInterval = timeIntervalMap[defaultTimeInterval.key],
    processIdDest,
    protocol
  }: QueryMetricsParams): Promise<BytesMetric | null> => {
    const { start, end } = getCurrentAndPastTimestamps(timeInterval.seconds);

    const params = {
      id: processIdSource,
      range: timeInterval,
      processIdDest,
      protocol,
      start,
      end
    };

    try {
      const [bytesTx, bytesRx] = await Promise.all([
        PrometheusApi.fetchBytes(params),
        PrometheusApi.fetchBytes({
          ...params,
          id: processIdDest,
          processIdDest: processIdSource
        })
      ]);

      const sumBytesTx = bytesTx.reduce((acc, { value }) => acc + Number(value[1] || 0), 0);
      const sumBytesRx = bytesRx.reduce((acc, { value }) => acc + Number(value[1] || 0), 0);

      return {
        bytesTx: formatToDecimalPlacesIfCents(sumBytesTx),
        bytesRx: formatToDecimalPlacesIfCents(sumBytesRx)
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getByteRateData: async ({
    processIdSource,
    timeInterval = timeIntervalMap[defaultTimeInterval.key],
    processIdDest,
    protocol
  }: QueryMetricsParams): Promise<ByteRateMetrics | null> => {
    const { start, end } = getCurrentAndPastTimestamps(timeInterval.seconds);

    const params = {
      id: processIdSource,
      range: timeInterval,
      processIdDest,
      protocol,
      start,
      end
    };

    try {
      const [byteRateDataTx, byteRateDataRx] = await Promise.all([
        PrometheusApi.fetchByteRateSeries(params),
        PrometheusApi.fetchByteRateSeries({
          ...params,
          id: processIdDest,
          processIdDest: processIdSource
        })
      ]);

      return normalizeByteRateFromSeries(byteRateDataTx, byteRateDataRx);
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getResponseData: async ({
    processIdSource,
    timeInterval = timeIntervalMap[defaultTimeInterval.key],
    processIdDest,
    protocol
  }: QueryMetricsParams): Promise<ResponseMetrics | null> => {
    const params = {
      id: processIdSource,
      range: timeInterval,
      processIdDest,
      protocol
    };

    try {
      const resposeRateDataSeries = await PrometheusApi.fetchResponsesByProcess(params);

      return normalizeResponsesFromSeries(resposeRateDataSeries);
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getResponseRateData: async ({
    processIdSource,
    timeInterval = timeIntervalMap[defaultTimeInterval.key],
    processIdDest,
    protocol
  }: QueryMetricsParams): Promise<ResponseMetrics | null> => {
    const params = {
      id: processIdSource,
      range: timeInterval,
      processIdDest,
      protocol
    };

    try {
      const resposeRateDataSeries = await PrometheusApi.fetchResponsesByProcess({
        ...params,
        onlyErrors: true,
        isRate: true
      });

      return normalizeResponsesFromSeries(resposeRateDataSeries);
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getLatency: async ({
    processIdSource,
    processIdDest,
    protocol,
    timeInterval = timeIntervalMap[defaultTimeInterval.key]
  }: QueryMetricsParams): Promise<LatencyMetrics[] | null> => {
    const params = {
      id: processIdSource,
      processIdDest,
      protocol,
      range: timeInterval
    };

    const { start, end } = getCurrentAndPastTimestamps(timeInterval.seconds);

    try {
      const [quantile50latency, quantile90latency, quantile99latency] = await Promise.all([
        PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.5, start, end }),
        PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.9, start, end }),
        PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.99, start, end })
      ]);

      const latenciesData = normalizeLatencies({ quantile50latency, quantile90latency, quantile99latency });

      return latenciesData;
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getRequest: async ({
    processIdSource,
    processIdDest,
    protocol,
    timeInterval = timeIntervalMap[defaultTimeInterval.key]
  }: QueryMetricsParams): Promise<{
    requestRateData: RequestMetrics[] | null;
    avgRequestRateInterval: number;
    totalRequestsInterval: number;
  }> => {
    const params = {
      id: processIdSource,
      processIdDest,
      protocol,
      range: timeInterval
    };

    try {
      const [requestsByProcess, avgRequestRate, totalRequests] = await Promise.all([
        PrometheusApi.fetchRequestsByProcess({
          ...params
        }),
        PrometheusApi.fetchAvgRequestRate(params),
        PrometheusApi.fetchTotalRequests(params)
      ]);

      const requestRateData = normalizeRequestFromSeries(requestsByProcess);
      const avgRequestRateInterval = formatToDecimalPlacesIfCents(Number(avgRequestRate[0]?.value[1] || 0));
      const totalRequestsInterval = formatToDecimalPlacesIfCents(Number(totalRequests[0]?.value[1] || 0), 0);

      return {
        avgRequestRateInterval,
        totalRequestsInterval,
        requestRateData
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getResponse: async ({
    processIdSource,
    timeInterval = timeIntervalMap[defaultTimeInterval.key],
    processIdDest,
    protocol
  }: QueryMetricsParams): Promise<{
    responseData: ResponseMetrics | null;
    responseRateData: ResponseMetrics | null;
  }> => {
    const props = {
      processIdSource,
      timeInterval,
      processIdDest,
      protocol
    };

    try {
      const [responseData, responseRateData] = await Promise.all([
        MetricsController.getResponseData(props),
        MetricsController.getResponseRateData(props)
      ]);

      return {
        responseData,
        responseRateData
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getTraffic: async ({
    processIdSource,
    timeInterval = timeIntervalMap[defaultTimeInterval.key],
    processIdDest,
    protocol
  }: QueryMetricsParams): Promise<{
    bytesData: BytesMetric | null;
    byteRateData: ByteRateMetrics | null;
  }> => {
    const props = {
      processIdSource,
      timeInterval,
      processIdDest,
      protocol
    };

    try {
      const [bytesData, byteRateData] = await Promise.all([
        MetricsController.getBytesData(props),
        MetricsController.getByteRateData(props)
      ]);

      return {
        bytesData,
        byteRateData
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  }
};

export default MetricsController;

/* UTILS */
function normalizeResponsesFromSeries(data: PrometheusApiResult[]): ResponseMetrics | null {
  // Convert the Prometheus API result into a chart data format
  const axisValues = extractPrometheusValuesAndLabels(data);

  if (!axisValues) {
    return null;
  }

  const { values } = axisValues;
  // Helper function to create a statusCodeMetric object
  const createStatusCodeMetric = (index: number, label: string) => {
    const responseValues = values[index] || null;

    // Calculate the total count of requests with the status code
    let total = 0;

    if (responseValues && responseValues.length === 1) {
      total = responseValues[0]?.y ?? 0;
    }

    if (responseValues && responseValues.length > 1) {
      total = responseValues[responseValues.length - 1].y - responseValues[0].y;
    }

    return { total, label, data: responseValues };
  };

  // Create the statusCodeMetric objects for each status code
  const statusCode2xx = createStatusCodeMetric(0, '2xx');
  const statusCode3xx = createStatusCodeMetric(1, '3xx');
  const statusCode4xx = createStatusCodeMetric(2, '4xx');
  const statusCode5xx = createStatusCodeMetric(3, '5xx');

  const total = statusCode2xx.total + statusCode3xx.total + statusCode4xx.total + statusCode5xx.total;

  return { statusCode2xx, statusCode3xx, statusCode4xx, statusCode5xx, total };
}

function normalizeRequestFromSeries(data: PrometheusApiResult[]): RequestMetrics[] | null {
  const axisValues = extractPrometheusValues(data);
  const labels = extractPrometheusLabels(data);

  if (!axisValues) {
    return null;
  }

  return axisValues.flatMap((values, index) => ({
    data: values,
    label: labels ? labels[index] : ''
  }));
}

function normalizeLatencies({
  quantile50latency,
  quantile90latency,
  quantile99latency
}: LatencyMetricsProps): LatencyMetrics[] | null {
  const quantile50latencyNormalized = extractPrometheusValues(quantile50latency);
  const quantile90latencyNormalized = extractPrometheusValues(quantile90latency);
  const quantile99latencyNormalized = extractPrometheusValues(quantile99latency);

  if (
    (!quantile50latencyNormalized || !quantile50latencyNormalized[0].filter(({ y }) => y).length) &&
    (!quantile90latencyNormalized || !quantile90latencyNormalized[0].filter(({ y }) => y).length) &&
    (!quantile99latencyNormalized || !quantile99latencyNormalized[0].filter(({ y }) => y).length)
  ) {
    return null;
  }
  const latenciesNormalized: LatencyMetrics[] = [];

  if (quantile50latencyNormalized) {
    latenciesNormalized.push({ data: quantile50latencyNormalized[0], label: MetricsLabels.LatencyMetric50quantile });
  }

  if (quantile90latencyNormalized) {
    latenciesNormalized.push({ data: quantile90latencyNormalized[0], label: MetricsLabels.LatencyMetric90quantile });
  }

  if (quantile99latencyNormalized) {
    latenciesNormalized.push({ data: quantile99latencyNormalized[0], label: MetricsLabels.LatencyMetric99quantile });
  }

  return latenciesNormalized;
}

function normalizeByteRateFromSeries(
  txData: PrometheusApiResult[],
  rxData: PrometheusApiResult[]
): ByteRateMetrics | null {
  // If there are not samples collected prometheus can send yoy an empty array and we can consider it invalid
  const axisValuesTx = extractPrometheusValues(txData);
  const axisValuesRx = extractPrometheusValues(rxData);

  if (!axisValuesTx || !axisValuesRx) {
    return null;
  }

  const rxTimeSerie = axisValuesRx[axisValuesRx.length - 1];
  const txTimeSerie = axisValuesTx[0];

  // total data for byte rate. Used by "per second" time series
  const sumDataReceived = rxTimeSerie.reduce((acc, { y }) => acc + y, 0);
  const sumDataSent = txTimeSerie.reduce((acc, { y }) => acc + y, 0);

  return {
    rxTimeSerie,
    txTimeSerie,
    avgTxValue: sumDataSent / rxTimeSerie.length,
    avgRxValue: sumDataReceived / rxTimeSerie.length,
    maxTxValue: Math.max(...txTimeSerie.map(({ y }) => y)),
    maxRxValue: Math.max(...rxTimeSerie.map(({ y }) => y)),
    currentTxValue: txTimeSerie[txTimeSerie.length - 1].y,
    currentRxValue: rxTimeSerie[rxTimeSerie.length - 1].y
  };
}
