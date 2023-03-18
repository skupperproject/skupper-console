import { formatBytes } from '@core/utils/formatBytes';
import { PrometheusApi } from 'API/Prometheus';
import { startDateOffsetMap } from 'API/Prometheus.constant';
import { PrometheusApiResult } from 'API/Prometheus.interfaces';
import { ProcessResponse } from 'API/REST.interfaces';

import { ProcessesLabels } from '../Processes.enum';
import {
  MetricsFilters,
  ProcessAxisDataChart,
  ProcessDataChart,
  ProcessLatenciesChart,
  ProcessMetrics
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
      const trafficDataSeriesResponse = await PrometheusApi.fetchDataTraffic(params);
      const trafficDataSeriesPerSecondResponse = await PrometheusApi.fetchDataTraffic({ ...params, isRate: true });
      const avgLatency = await PrometheusApi.fetchLatencyByProcess(params);
      const quantile50latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.5 });
      const quantile90latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.9 });
      const quantile99latency = await PrometheusApi.fetchLatencyByProcess({ ...params, quantile: 0.99 });

      const trafficDataSeries = normalizeTrafficData(trafficDataSeriesResponse, timeInterval);
      const trafficDataSeriesPerSecond = normalizeTrafficData(trafficDataSeriesPerSecondResponse, timeInterval);
      const latencies = normalizeLatencies({ avgLatency, quantile50latency, quantile90latency, quantile99latency });

      if (!(trafficDataSeries && trafficDataSeriesPerSecond && latencies)) {
        return null;
      }

      return {
        trafficDataSeries,
        trafficDataSeriesPerSecond,
        latencies
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
  avgLatency: PrometheusApiResult[];
  quantile50latency: PrometheusApiResult[];
  quantile90latency: PrometheusApiResult[];
  quantile99latency: PrometheusApiResult[];
}

function normalizeLatencies({
  avgLatency,
  quantile50latency,
  quantile90latency,
  quantile99latency
}: NormalizeLatenciesProps): ProcessLatenciesChart[] | null {
  const avgLatencyNormalized = normalizeMetric(avgLatency);
  const quantile50latencyNormalized = normalizeMetric(quantile50latency);
  const quantile90latencyNormalized = normalizeMetric(quantile90latency);
  const quantile99latencyNormalized = normalizeMetric(quantile99latency);

  const latenciesNormalized: ProcessLatenciesChart[] = [];

  if (avgLatencyNormalized) {
    latenciesNormalized.push({ data: avgLatencyNormalized[0], label: ProcessesLabels.LatencyMetricAvg });
  }

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
  const totalDataReceived = currentTrafficReceived - (fistTimeSample > 0 ? 0 : timeSeriesDataReceived[1].y);
  const totalDataSent = currentTrafficSent - (fistTimeSample > 0 ? 0 : timeSeriesDataSent[1].y);

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
