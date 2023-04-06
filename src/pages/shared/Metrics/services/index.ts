import { SkChartAreaData } from '@core/components/SkChartArea/SkChartArea.interfaces';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';
import { getCurrentAndPastTimestamps } from '@core/utils/getCurrentAndPastTimestamps';
import { PrometheusApi } from 'API/Prometheus';
import { PrometheusApiResult } from 'API/Prometheus.interfaces';
import { AvailableProtocols } from 'API/REST.enum';

import {
  Metrics,
  QueryMetricsParams,
  LatencyMetricsProps,
  TrafficMetrics,
  LatencyData,
  LatencyMetrics,
  MetricData,
  RequestMetrics,
  ResponseMetrics
} from './services.enum';
import { MetricsLabels } from '../Metrics.enum';

const MetricsController = {
  getMetrics: async ({ id, timeInterval, processIdDest, protocol }: QueryMetricsParams): Promise<Metrics | null> => {
    const params = {
      id,
      range: timeInterval,
      processIdDest,
      protocol
    };
    try {
      // traffic metrics
      const trafficDataSeriesResponse = await PrometheusApi.fetchDataTraffic(params);
      const trafficDataSeriesPerSecondResponse = await PrometheusApi.fetchDataTraffic({ ...params, isRate: true });

      // latency metrics
      let latencies = null;
      if (protocol !== AvailableProtocols.Tcp) {
        const { start, end } = getCurrentAndPastTimestamps(timeInterval.seconds);

        const quantile50latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.5, start, end });
        const quantile90latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.9, start, end });
        const quantile99latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.99, start, end });

        latencies = normalizeLatencies({ quantile50latency, quantile90latency, quantile99latency });
      }

      // requests metrics
      const requestPerSecondSeriesResponse = await PrometheusApi.fetchRequestsByProcess({
        ...params,
        isRate: true
      });
      const requestSeriesResponse = await PrometheusApi.fetchRequestsByProcess(params);

      // responses metrics
      const responseSeriesResponse = await PrometheusApi.fetchResponsesByProcess(params);
      const responseRateSeriesResponse = await PrometheusApi.fetchResponsesByProcess({
        ...params,
        isRate: true,
        onlyErrors: false
      });

      // data normalization
      const trafficDataSeries = normalizeTrafficData(trafficDataSeriesResponse);
      const trafficDataSeriesPerSecond = normalizeTrafficData(trafficDataSeriesPerSecondResponse);
      const requestSeries = normalizeRequests(requestSeriesResponse, id);
      const requestPerSecondSeries = normalizeRequests(requestPerSecondSeriesResponse, id);
      const responseSeries = normalizeResponses(responseSeriesResponse);
      const responseRateSeries = normalizeResponses(responseRateSeriesResponse);

      if (
        !(
          (trafficDataSeries && trafficDataSeriesPerSecond) ||
          latencies ||
          (requestSeries && requestPerSecondSeries) ||
          (responseSeries && responseRateSeries)
        )
      ) {
        return null;
      }

      return {
        trafficDataSeries,
        trafficDataSeriesPerSecond,
        latencies,
        requestSeries,
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

function normalizeResponses(data: PrometheusApiResult[]): ResponseMetrics | null {
  // Convert the Prometheus API result into a chart data format
  const prometheusData = convertPrometheusDataInChartData(data);

  if (!prometheusData) {
    return null;
  }

  const { values } = prometheusData;

  // Helper function to create a statusCodeMetric object
  const createStatusCodeMetric = (index: number, label: string): ResponseMetrics['statusCode2xx'] => {
    const responseValues = values[index] ?? [];

    // Calculate the total count of requests with the status code
    const total =
      responseValues.length > 1
        ? responseValues[responseValues.length - 1].y - responseValues[0].y
        : responseValues[0]?.y ?? 0;

    return { total, label, data: responseValues.length ? responseValues : undefined };
  };

  // Create the statusCodeMetric objects for each status code
  const statusCode2xx = createStatusCodeMetric(0, '2xx');
  const statusCode3xx = createStatusCodeMetric(1, '3xx');
  const statusCode4xx = createStatusCodeMetric(2, '4xx');
  const statusCode5xx = createStatusCodeMetric(3, '5xx');

  const total = statusCode2xx.total + statusCode3xx.total + statusCode4xx.total + statusCode5xx.total;

  return { statusCode2xx, statusCode3xx, statusCode4xx, statusCode5xx, total };
}

function normalizeRequests(data: PrometheusApiResult[], label: string): RequestMetrics[] | null {
  const axisValues = convertPrometheusDataInChartAxisValues(data);

  if (!axisValues) {
    return null;
  }

  const requestsNormalized: RequestMetrics[] = [];

  for (const values of axisValues) {
    const totalRequestInterval = values.length === 1 ? values[0].y : values[values.length - 1].y - values[0].y;
    const sumRequestRateInterval = values.reduce((acc, { y }) => acc + y, 0);
    const avgRequestRateInterval = formatToDecimalPlacesIfCents(sumRequestRateInterval / values.length, 2);

    requestsNormalized.push({
      data: values,
      label,
      totalRequestInterval,
      avgRequestRateInterval
    });
  }

  return requestsNormalized;
}

function normalizeLatencies({
  quantile50latency,
  quantile90latency,
  quantile99latency
}: LatencyMetricsProps): LatencyMetrics | null {
  const quantile50latencyNormalized = convertPrometheusDataInChartAxisValues(quantile50latency);
  const quantile90latencyNormalized = convertPrometheusDataInChartAxisValues(quantile90latency);
  const quantile99latencyNormalized = convertPrometheusDataInChartAxisValues(quantile99latency);

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

function normalizeTrafficData(data: PrometheusApiResult[]): TrafficMetrics | null {
  // If there are not samples collected prometheus can send yoy an empty array and we can consider it invalid
  const axisValues = convertPrometheusDataInChartAxisValues(data);
  if (!axisValues) {
    return null;
  }
  const timeSeriesDataReceived = axisValues[0];
  const timeSeriesDataSent = axisValues[1];

  const currentTrafficReceived = timeSeriesDataReceived[timeSeriesDataReceived.length - 1].y;
  const currentTrafficSent = timeSeriesDataSent[timeSeriesDataSent.length - 1].y;

  const maxTrafficReceived = Math.max(...timeSeriesDataReceived.map(({ y }) => y));
  const maxTrafficSent = Math.max(...timeSeriesDataSent.map(({ y }) => y));

  // total data for bytes
  const totalDataReceived =
    timeSeriesDataReceived.length === 1
      ? timeSeriesDataReceived[0].y
      : currentTrafficReceived - timeSeriesDataReceived[0].y;

  const totalDataSent =
    timeSeriesDataSent.length === 1 ? timeSeriesDataSent[0].y : currentTrafficSent - timeSeriesDataSent[0].y;

  // total data for byte rate. Used by "per second" time series
  const sumDataReceived = timeSeriesDataReceived.reduce((acc, { y }) => acc + y, 0);
  const sumDataSent = timeSeriesDataSent.reduce((acc, { y }) => acc + y, 0);

  const avgTrafficReceived = sumDataReceived / timeSeriesDataReceived.length;
  const avgTrafficSent = sumDataSent / timeSeriesDataReceived.length;

  return {
    timeSeriesDataReceived,
    timeSeriesDataSent,
    totalDataReceived,
    totalDataSent,
    avgTrafficSent,
    avgTrafficReceived,
    maxTrafficSent,
    maxTrafficReceived,
    currentTrafficSent,
    currentTrafficReceived,
    sumDataSent,
    sumDataReceived
  };
}

function convertPrometheusDataInChartAxisValues(data: PrometheusApiResult[]): SkChartAreaData[][] | null {
  if (!data.length) {
    return null;
  }

  return data.map(({ values }) =>
    values.map((value) => ({
      x: Number(value[0]),
      y: isNaN(Number(value[1])) ? 0 : Number(value[1])
    }))
  );
}

function convertPrometheusDataInChartLabels(data: PrometheusApiResult[]): string[][] | null {
  if (!data.length) {
    return null;
  }

  return data.map(({ metric }) => Object.values(metric).map((label) => label));
}

function convertPrometheusDataInChartData(data: PrometheusApiResult[]): MetricData | null {
  if (!data.length) {
    return null;
  }

  const values = convertPrometheusDataInChartAxisValues(data) as SkChartAreaData[][];
  const labels = convertPrometheusDataInChartLabels(data) as string[][];

  return { values, labels };
}

export function formatPercentage(value: number, total: number) {
  const percentage = (value / total) * 100;

  if (isNaN(percentage)) {
    return 0;
  }

  return `${formatToDecimalPlacesIfCents(percentage, 0)}%`;
}
