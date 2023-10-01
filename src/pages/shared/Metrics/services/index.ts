import { PrometheusApi } from '@API/Prometheus.api';
import {
  PrometheusApiResult,
  PrometheusQueryParams,
  PrometheusQueryParamsSingleData
} from '@API/Prometheus.interfaces';
import {
  extractPrometheusLabels,
  extractPrometheusValues,
  extractPrometheusValuesAndLabels
} from '@API/Prometheus.utils';
import { defaultTimeInterval, timeIntervalMap } from '@config/prometheus';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';
import { getCurrentAndPastTimestamps } from '@core/utils/getCurrentAndPastTimestamps';

import {
  LatencyMetricsProps,
  ByteRateMetrics,
  LatencyMetrics,
  RequestMetrics,
  ResponseMetrics,
  BytesMetric
} from './services.interfaces';
import { MetricsLabels } from '../Metrics.enum';
import { QueryMetricsParams } from '../Metrics.interfaces';

const MetricsController = {
  getLatency: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    protocol,
    timeInterval = timeIntervalMap[defaultTimeInterval.key]
  }: QueryMetricsParams): Promise<LatencyMetrics[] | null> => {
    const { start, end } = getCurrentAndPastTimestamps(timeInterval.seconds);
    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceProcess,
      destProcess,
      protocol,
      step: timeInterval.step,
      start,
      end
    };

    try {
      const [quantile50latency, quantile90latency, quantile99latency] = await Promise.all([
        PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.5 }),
        PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.9 }),
        PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.99 })
      ]);

      const latenciesData = normalizeLatencies({ quantile50latency, quantile90latency, quantile99latency });

      return latenciesData;
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getRequest: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    protocol,
    timeInterval = timeIntervalMap[defaultTimeInterval.key]
  }: QueryMetricsParams): Promise<{
    requestRateData: RequestMetrics[] | null;
    requestPerf: { avg: number; max: number; current: number; label: string }[] | undefined;
  }> => {
    const { start, end } = getCurrentAndPastTimestamps(timeInterval.seconds);

    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceProcess,
      destProcess,
      protocol,
      start,
      end,
      step: timeInterval.step
    };
    try {
      const requestsByProcess = await PrometheusApi.fetchRequestsByProcess({ ...params });

      const requestRateData = normalizeRequestFromSeries(requestsByProcess);

      const requestPerf = requestRateData?.map(({ data, label }) => ({
        label,
        max: formatToDecimalPlacesIfCents(data.reduce((acc, { y }) => (y > acc ? y : acc), 0)),
        avg: formatToDecimalPlacesIfCents(data.reduce((acc, { y }) => acc + y, 0) / data.length),
        current: formatToDecimalPlacesIfCents(data[data.length - 1].y)
      }));

      return {
        requestPerf,
        requestRateData
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getResponse: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    protocol,
    timeInterval = timeIntervalMap[defaultTimeInterval.key]
  }: QueryMetricsParams): Promise<{
    responseData: ResponseMetrics | null;
    responseRateData: ResponseMetrics | null;
  }> => {
    try {
      const { start, end } = getCurrentAndPastTimestamps(timeInterval.seconds);
      const params: PrometheusQueryParams = {
        sourceSite,
        destSite,
        sourceProcess,
        destProcess,
        protocol,
        start,
        end,
        step: timeInterval.step
      };

      const [responsesByProcess, responseRateByProcess] = await Promise.all([
        PrometheusApi.fetchResponseCountsByProcess({ ...params, step: timeInterval.value }),
        PrometheusApi.fetchErrorResponsesByProcess(params)
      ]);

      const responseData = normalizeResponsesFromSeries(responsesByProcess);
      const responseRateData = normalizeResponsesFromSeries(responseRateByProcess);

      return {
        responseData,
        responseRateData
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getTraffic: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    protocol,
    timeInterval = timeIntervalMap[defaultTimeInterval.key]
  }: QueryMetricsParams): Promise<{
    bytesData: BytesMetric;
    byteRateData: ByteRateMetrics;
  }> => {
    const params: QueryMetricsParams = {
      sourceSite,
      destSite,
      sourceProcess,
      destProcess,
      timeInterval,
      protocol
    };

    try {
      const [bytesData, byteRateData] = await Promise.all([getBytesData(params), getByteRateData(params)]);

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

async function getBytesData({
  sourceSite,
  destSite,
  sourceProcess,
  destProcess,
  protocol,
  timeInterval = timeIntervalMap[defaultTimeInterval.key]
}: QueryMetricsParams): Promise<BytesMetric> {
  const params: PrometheusQueryParamsSingleData = {
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    seconds: timeInterval.seconds + 60,
    protocol
  };

  try {
    const [bytesTx, bytesRx] = await Promise.all([
      PrometheusApi.fetchBytes(params),
      PrometheusApi.fetchBytes({
        ...params,
        sourceSite: destSite,
        destSite: sourceSite,
        sourceProcess: destProcess,
        destProcess: sourceProcess
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
}

async function getByteRateData({
  sourceSite,
  destSite,
  sourceProcess,
  destProcess,
  protocol,
  timeInterval = timeIntervalMap[defaultTimeInterval.key]
}: QueryMetricsParams): Promise<ByteRateMetrics> {
  const { start, end } = getCurrentAndPastTimestamps(timeInterval.seconds);
  const params: PrometheusQueryParams = {
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    step: timeInterval.step,
    protocol,
    start,
    end
  };

  try {
    const [byteRateDataTx, byteRateDataRx] = await Promise.all([
      PrometheusApi.fetchByteRateSeries(params),
      PrometheusApi.fetchByteRateSeries({
        ...params,
        sourceSite: destSite,
        destSite: sourceSite,
        sourceProcess: destProcess,
        destProcess: sourceProcess
      })
    ]);

    return normalizeByteRateFromSeries(byteRateDataTx, byteRateDataRx);
  } catch (e: unknown) {
    return Promise.reject(e);
  }
}

/* UTILS */
function normalizeResponsesFromSeries(data: PrometheusApiResult[]): ResponseMetrics | null {
  // Convert the Prometheus API result into a chart data format
  const axisValues = extractPrometheusValuesAndLabels(data);

  if (!axisValues) {
    return null;
  }

  const { values, labels } = axisValues;
  // Helper function to create a statusCodeMetric object
  const createStatusCodeMetric = (partialCode: string) => {
    const codeIndex = labels.findIndex((label) => label === partialCode);

    if (codeIndex === -1) {
      return { total: 0, label: partialCode, data: null };
    }

    let total = 0;
    const responseValues = values[codeIndex];

    if (responseValues.length === 1) {
      total = responseValues[0].y;
    }

    if (responseValues.length > 1) {
      total = responseValues[responseValues.length - 1].y - responseValues[0].y;
    }

    return { total, label: partialCode, data: responseValues };
  };

  // Create the statusCodeMetric objects for each status code
  const statusCode2xx = createStatusCodeMetric('2');
  const statusCode3xx = createStatusCodeMetric('3');
  const statusCode4xx = createStatusCodeMetric('4');
  const statusCode5xx = createStatusCodeMetric('5');

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

function normalizeByteRateFromSeries(txData: PrometheusApiResult[], rxData: PrometheusApiResult[]): ByteRateMetrics {
  // If there are not samples collected prometheus can send yoy an empty array and we can consider it invalid
  const axisValuesTx = extractPrometheusValues(txData);
  const axisValuesRx = extractPrometheusValues(rxData);

  const txTimeSerie = axisValuesTx ? axisValuesTx[0] : undefined;
  const rxTimeSerie = axisValuesRx ? axisValuesRx[axisValuesRx.length - 1] : undefined;

  // total data for byte rate. Used by "per second" time series
  const sumDataReceived = rxTimeSerie?.reduce((acc, { y }) => acc + y, 0);
  const sumDataSent = txTimeSerie?.reduce((acc, { y }) => acc + y, 0);

  return {
    txTimeSerie: txTimeSerie ? { data: txTimeSerie, label: 'Tx' } : undefined,
    rxTimeSerie: rxTimeSerie ? { data: rxTimeSerie, label: 'Rx' } : undefined,
    avgTxValue: sumDataSent && rxTimeSerie ? sumDataSent / rxTimeSerie.length : undefined,
    avgRxValue: sumDataReceived && rxTimeSerie ? sumDataReceived / rxTimeSerie.length : undefined,
    maxTxValue: txTimeSerie ? Math.max(...txTimeSerie.map(({ y }) => y)) : undefined,
    maxRxValue: rxTimeSerie ? Math.max(...rxTimeSerie.map(({ y }) => y)) : undefined,
    currentTxValue: txTimeSerie ? txTimeSerie[txTimeSerie.length - 1].y : undefined,
    currentRxValue: rxTimeSerie ? rxTimeSerie[rxTimeSerie.length - 1].y : undefined
  };
}
