import { formatBytes } from '@core/utils/formatBytes';
import { PrometheusApi } from 'API/Prometheus';
import { startDateOffsetMap } from 'API/Prometheus.constant';
import { PrometheusApiResult } from 'API/Prometheus.interfaces';
import { AvailableProtocols } from 'API/REST.enum';
import { ProcessResponse } from 'API/REST.interfaces';

import { ProcessesLabels } from '../Processes.enum';
import {
  MetricsFilters,
  ProcessAxisDataChart,
  ProcessDataChart,
  ProcessLatenciesChart,
  ProcessMetrics,
  ProcessRequestsChart
} from '../Processes.interfaces';

const ProcessesController = {
  getMetrics: async ({ id, timeInterval, processIdDest, protocol }: MetricsFilters): Promise<ProcessMetrics | null> => {
    const params = {
      id,
      range: timeInterval,
      processIdDest,
      protocol
    };
    try {
      // requests metrics
      const requestPerSecondSeriesResponse = await PrometheusApi.fetchTotalRequestByProcess({
        ...params,
        isRate: true
      });
      const requestSeriesResponse = await PrometheusApi.fetchTotalRequestByProcess(params);

      // traffic metrics
      const trafficDataSeriesResponse = await PrometheusApi.fetchDataTraffic(params);
      const trafficDataSeriesPerSecondResponse = await PrometheusApi.fetchDataTraffic({ ...params, isRate: true });

      // latency metrics
      let latencies = null;
      if (protocol !== AvailableProtocols.Tcp) {
        const quantile50latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.5 });
        const quantile90latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.9 });
        const quantile99latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.99 });

        latencies = normalizeLatencies({ quantile50latency, quantile90latency, quantile99latency });
      }

      const trafficDataSeries = normalizeTrafficData(trafficDataSeriesResponse, timeInterval);
      const trafficDataSeriesPerSecond = normalizeTrafficData(trafficDataSeriesPerSecondResponse, timeInterval);
      const requestSeries = normalizeRequests(requestSeriesResponse, id);
      const requestPerSecondSeries = normalizeRequests(requestPerSecondSeriesResponse, id);

      if (!(trafficDataSeries && trafficDataSeriesPerSecond)) {
        return null;
      }

      return {
        trafficDataSeries,
        trafficDataSeriesPerSecond,
        latencies,
        requestSeries,
        requestPerSecondSeries
      };
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  },

  formatProcessesBytesForChart: (
    processes: ProcessResponse[],
    property: keyof Pick<ProcessResponse, 'octetsSent' | 'octetsReceived'>
  ) => {
    const values = processes
      .map((process) => ({
        x: process.name,
        y: process[property]
      }))
      .filter(({ y }) => y);

    const labels = values.map(({ x, y }) => ({
      name: `${x}: ${formatBytes(y)}`
    }));

    return { labels, values };
  }
};

export default ProcessesController;

interface NormalizeLatenciesProps {
  quantile50latency: PrometheusApiResult[];
  quantile90latency: PrometheusApiResult[];
  quantile99latency: PrometheusApiResult[];
}

function normalizeRequests(data: PrometheusApiResult[], label: string) {
  const axisValues = normalizeMetric(data);

  if (!axisValues) {
    return null;
  }

  return axisValues.flatMap((values) => {
    const totalRequestInterval = values[values.length - 1].y - values[0].y;

    const sumRequestRateInterval = values.reduce((acc, { y }) => acc + y, 0);
    const avgRequestRateInterval = Number((sumRequestRateInterval / values.length).toFixed(2));

    const requestsNormalized: ProcessRequestsChart[] = [];
    requestsNormalized.push({
      data: values,
      label,
      totalRequestInterval,
      avgRequestRateInterval
    });

    return requestsNormalized;
  });
}

function normalizeLatencies({
  quantile50latency,
  quantile90latency,
  quantile99latency
}: NormalizeLatenciesProps): ProcessLatenciesChart[] | null {
  const quantile50latencyNormalized = normalizeMetric(quantile50latency);
  const quantile90latencyNormalized = normalizeMetric(quantile90latency);
  const quantile99latencyNormalized = normalizeMetric(quantile99latency);

  const latenciesNormalized: ProcessLatenciesChart[] = [];

  if (quantile50latencyNormalized) {
    latenciesNormalized.push({ data: quantile50latencyNormalized[0], label: ProcessesLabels.LatencyMetric50quantile });
  }

  if (quantile90latencyNormalized) {
    latenciesNormalized.push({ data: quantile90latencyNormalized[0], label: ProcessesLabels.LatencyMetric90quantile });
  }

  if (quantile99latencyNormalized) {
    latenciesNormalized.push({ data: quantile99latencyNormalized[0], label: ProcessesLabels.LatencyMetric99quantile });
  }

  return latenciesNormalized.length ? latenciesNormalized : null;
}

function normalizeTrafficData(data: PrometheusApiResult[], timeInterval: string): ProcessDataChart | null {
  // If there are not samples collected prometheus can send yoy an empty array and we can consider it invalid
  const axisValues = normalizeMetric(data);
  if (!axisValues) {
    return null;
  }

  const timeSeriesDataReceived = axisValues[0];
  const timeSeriesDataSent = axisValues[1];

  const fistTimeSample =
    timeSeriesDataSent[0].x - (new Date().getTime() / 1000 - startDateOffsetMap[timeInterval] || 0);

  const currentTrafficReceived = timeSeriesDataReceived[timeSeriesDataReceived.length - 1].y;
  const currentTrafficSent = timeSeriesDataSent[timeSeriesDataSent.length - 1].y;

  const maxTrafficReceived = Math.max(...timeSeriesDataReceived.map(({ y }) => y));
  const maxTrafficSent = Math.max(...timeSeriesDataSent.map(({ y }) => y));

  // total data for bytes
  const totalDataReceived = currentTrafficReceived - (fistTimeSample > 0 ? 0 : timeSeriesDataReceived[0].y);
  const totalDataSent = currentTrafficSent - (fistTimeSample > 0 ? 0 : timeSeriesDataSent[0].y);

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

function normalizeMetric(data: PrometheusApiResult[]): ProcessAxisDataChart[][] | null {
  if (!data.length) {
    return null;
  }

  return data.map(({ values }) =>
    values.map((value) => ({
      x: value[0],
      y: isNaN(Number(value[1])) ? 0 : Number(value[1])
    }))
  );
}
