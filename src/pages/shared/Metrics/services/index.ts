import { PrometheusApi } from '@API/Prometheus.api';
import { PrometheusApiResult, PrometheusQueryParams } from '@API/Prometheus.interfaces';
import {
  extractPrometheusLabels,
  extractPrometheusValues,
  extractPrometheusValuesAndLabels
} from '@API/Prometheus.utils';
import { calculateStep, defaultTimeInterval } from '@config/prometheus';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';
import { getCurrentAndPastTimestamps } from '@core/utils/getCurrentAndPastTimestamps';

import {
  LatencyMetricsProps,
  ByteRateMetrics,
  LatencyMetrics,
  RequestMetrics,
  ResponseMetrics
} from './services.interfaces';
import { MetricsLabels } from '../Metrics.enum';
import { QueryMetricsParams } from '../Metrics.interfaces';

const MetricsController = {
  getLatency: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    service,
    protocol,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<LatencyMetrics[] | null> => {
    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceProcess,
      destProcess,
      service,
      protocol,
      start,
      end,
      step: calculateStep(end - start)
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
    service,
    protocol,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<{
    requestRateData: RequestMetrics[] | null;
    requestPerf: { avg: number; max: number; current: number; label: string }[] | undefined;
  }> => {
    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceProcess,
      destProcess,
      service,
      protocol,
      start,
      end,
      step: calculateStep(end - start)
    };
    try {
      const requestsByProcess = await PrometheusApi.fetchRequestsByProcess(params);
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
    service,
    protocol,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<{
    responseData: ResponseMetrics | null;
    responseRateData: ResponseMetrics | null;
  }> => {
    try {
      const params: PrometheusQueryParams = {
        sourceSite: destSite,
        destSite: sourceSite,
        // who send a request (sourceProcess) should query the response as a destProcess
        sourceProcess: destProcess,
        destProcess: sourceProcess,
        service,
        protocol,
        start,
        end,
        step: calculateStep(end - start)
      };

      const [responsesByProcess, responseRateByProcess] = await Promise.all([
        PrometheusApi.fetchResponseCountsByProcess(params),
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
    service,
    protocol,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<ByteRateMetrics> => {
    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceProcess,
      destProcess,
      service,
      protocol,
      start,
      end,
      step: calculateStep(end - start)
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
};

export default MetricsController;

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
  const axisValuesTx = extractPrometheusValues(txData);
  const axisValuesRx = extractPrometheusValues(rxData);

  const txTimeSerie = axisValuesTx ? axisValuesTx[0] : undefined;
  const rxTimeSerie = axisValuesRx ? axisValuesRx[axisValuesRx.length - 1] : undefined;

  const totalRxValue = rxTimeSerie?.reduce((acc, { y }) => acc + y, 0);
  const totalTxValue = txTimeSerie?.reduce((acc, { y }) => acc + y, 0);

  return {
    txTimeSerie: txTimeSerie ? { data: txTimeSerie, label: 'Tx' } : undefined,
    rxTimeSerie: rxTimeSerie ? { data: rxTimeSerie, label: 'Rx' } : undefined,
    avgTxValue: totalTxValue && rxTimeSerie ? totalTxValue / rxTimeSerie.length : undefined,
    avgRxValue: totalRxValue && rxTimeSerie ? totalRxValue / rxTimeSerie.length : undefined,
    maxTxValue: txTimeSerie ? Math.max(...txTimeSerie.map(({ y }) => y)) : undefined,
    maxRxValue: rxTimeSerie ? Math.max(...rxTimeSerie.map(({ y }) => y)) : undefined,
    currentTxValue: txTimeSerie ? txTimeSerie[txTimeSerie.length - 1].y : undefined,
    currentRxValue: rxTimeSerie ? rxTimeSerie[rxTimeSerie.length - 1].y : undefined,
    totalTxValue,
    totalRxValue
  };
}
