import { PrometheusApi } from '@API/Prometheus';
import { PrometheusApiResult } from '@API/Prometheus.interfaces';
import { defaultTimeInterval, timeIntervalMap } from '@API/Prometheus.queries';
import { AvailableProtocols } from '@API/REST.enum';
import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';
import { getCurrentAndPastTimestamps } from '@core/utils/getCurrentAndPastTimestamps';

import {
  Metrics,
  QueryMetricsParams,
  LatencyMetricsProps,
  ByteRateMetrics,
  LatencyData,
  LatencyMetrics,
  MetricData,
  RequestMetrics,
  ResponseMetrics,
  BytesMetric
} from './services.interfaces';
import { MetricsLabels } from '../Metrics.enum';

const MetricsController = {
  getBytes: async ({
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
      isRate: true,
      start,
      end
    };

    try {
      const bytesTx = await PrometheusApi.fetchDataTrafficOut({ ...params, start, end });
      const bytesRx = await PrometheusApi.fetchDataTrafficIn({ ...params, start, end });

      return normalizeBytesMaxMinValues(bytesTx, bytesRx);
    } catch (e: unknown) {
      throw new Error(e as string);
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
      isRate: true,
      start,
      end
    };

    try {
      const byteRateDataTx = await PrometheusApi.fetchDataTrafficOut(params);
      const byteRateDataRx = await PrometheusApi.fetchDataTrafficIn(params);

      return normalizeByteRateFromSeries(byteRateDataTx, byteRateDataRx);
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  },
  getMetrics: async ({
    processIdSource,
    timeInterval = timeIntervalMap[defaultTimeInterval.key],
    processIdDest,
    protocol
  }: QueryMetricsParams): Promise<Metrics> => {
    const params = {
      id: processIdSource,
      range: timeInterval,
      processIdDest,
      protocol
    };

    try {
      // traffic metrics
      const { start, end } = getCurrentAndPastTimestamps(timeInterval.seconds);

      // latency metrics
      let latencies = null;
      let requestPerSecondSeries = null;
      let avgRequestRateInterval = 0;
      let totalRequestsInterval = 0;
      let responseRateSeries = null;
      let responseSeries = null;

      if (protocol !== AvailableProtocols.Tcp) {
        const quantile50latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.5, start, end });
        const quantile90latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.9, start, end });
        const quantile99latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.99, start, end });

        latencies = normalizeLatencies({ quantile50latency, quantile90latency, quantile99latency });

        // requests metrics
        const requestPerSecondSeriesResponse = await PrometheusApi.fetchRequestsByProcess({
          ...params
        });
        requestPerSecondSeries = normalizeRequestFromSeries(requestPerSecondSeriesResponse);

        const avgRequestRate = await PrometheusApi.fetchAvgRequestRate(params);
        avgRequestRateInterval = formatToDecimalPlacesIfCents(Number(avgRequestRate[0]?.value[1] || 0));

        const totalRequests = await PrometheusApi.fetchTotalRequests(params);
        totalRequestsInterval = formatToDecimalPlacesIfCents(Number(totalRequests[0]?.value[1] || 0), 0);

        // responses metrics
        const responseRateSeriesResponse = await PrometheusApi.fetchResponsesByProcess({
          ...params,
          isRate: true,
          onlyErrors: false
        });
        responseRateSeries = normalizeResponsesFromSeries(responseRateSeriesResponse);

        const responseSeriesResponse = await PrometheusApi.fetchResponsesByProcess(params);
        responseSeries = normalizeResponsesFromSeries(responseSeriesResponse);
      }

      const props = {
        processIdSource,
        timeInterval,
        processIdDest,
        protocol
      };

      const bytes = await MetricsController.getBytes(props);
      const byteRate = await MetricsController.getByteRateData(props);

      return {
        bytes,
        byteRate,
        latencies,
        avgRequestRateInterval,
        totalRequestsInterval,
        requestPerSecondSeries,
        responseSeries,
        responseRateSeries
      };
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }
};

export default MetricsController;

function normalizeResponsesFromSeries(data: PrometheusApiResult[]): ResponseMetrics | null {
  // Convert the Prometheus API result into a chart data format
  const prometheusData = getChartValuesAndLabels(data);

  if (!prometheusData) {
    return null;
  }

  const { values } = prometheusData;
  // Helper function to create a statusCodeMetric object
  const createStatusCodeMetric = (index: number, label: string): ResponseMetrics['statusCode2xx'] => {
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
}: LatencyMetricsProps): LatencyMetrics | null {
  const quantile50latencyNormalized = extractPrometheusValues(quantile50latency);
  const quantile90latencyNormalized = extractPrometheusValues(quantile90latency);
  const quantile99latencyNormalized = extractPrometheusValues(quantile99latency);

  if (
    (!quantile50latencyNormalized || !quantile50latencyNormalized[0]?.filter(({ y }) => y).length) &&
    (!quantile90latencyNormalized || !quantile90latencyNormalized[0]?.filter(({ y }) => y).length) &&
    (!quantile99latencyNormalized || !quantile99latencyNormalized[0]?.filter(({ y }) => y).length)
  ) {
    return null;
  }
  const latenciesNormalized: LatencyData[] = [];

  if (quantile50latencyNormalized) {
    latenciesNormalized.push({ data: quantile50latencyNormalized[0], label: MetricsLabels.LatencyMetric50quantile });
  }

  if (quantile90latencyNormalized) {
    latenciesNormalized.push({ data: quantile90latencyNormalized[0], label: MetricsLabels.LatencyMetric90quantile });
  }

  if (quantile99latencyNormalized) {
    latenciesNormalized.push({ data: quantile99latencyNormalized[0], label: MetricsLabels.LatencyMetric99quantile });
  }

  return { timeSeriesLatencies: latenciesNormalized };
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

function normalizeBytesMaxMinValues(txData: PrometheusApiResult[], rxData: PrometheusApiResult[]): BytesMetric | null {
  // If there are not samples collected prometheus can send yoy an empty array and we can consider it invalid
  const axisValuesTx = extractPrometheusValues(txData);
  const axisValuesRx = extractPrometheusValues(rxData);

  if (!axisValuesTx || !axisValuesRx) {
    return null;
  }

  const rxTimeSerie = axisValuesRx[axisValuesRx.length - 1];
  const txTimeSerie = axisValuesTx[0];

  const currentTrafficReceived = rxTimeSerie[rxTimeSerie.length - 1].y;
  const currentTrafficSent = txTimeSerie[txTimeSerie.length - 1].y;

  const bytesRx = rxTimeSerie.length === 1 ? rxTimeSerie[0].y : currentTrafficReceived - rxTimeSerie[0].y;
  const bytesTx = txTimeSerie.length === 1 ? txTimeSerie[0].y : currentTrafficSent - txTimeSerie[0].y;

  return { bytesRx, bytesTx };
}

function extractPrometheusValues(data: PrometheusApiResult[]): skAxisXY[][] | null {
  // Prometheus can retrieve empty arrays wich are not valid data for us
  if (!data.length) {
    return null;
  }

  return data.map(({ values }) =>
    values.map((value) => ({
      x: Number(value[0]),
      // y should be a numeric value, we convert 'NaN' in 0
      y: isNaN(Number(value[1])) ? 0 : Number(value[1])
    }))
  );
}

/**
 * Converts an array of Prometheus result objects to a two-dimensional array of metric labels.
 */
function extractPrometheusLabels(data: PrometheusApiResult[]): string[] | null {
  // Validate the input
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Map the input array to an array of label arrays using array destructuring
  return data.flatMap(({ metric }) => Object.values(metric));
}

function getChartValuesAndLabels(data: PrometheusApiResult[]): MetricData | null {
  if (!data.length) {
    return null;
  }

  const values = extractPrometheusValues(data) as skAxisXY[][];
  const labels = extractPrometheusLabels(data) as string[];

  return { values, labels };
}
