import { formatBytes } from '@core/utils/formatBytes';
import { PrometheusApi } from 'API/Prometheus';
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

      const trafficDataSeries = normalizeTrafficData(trafficDataSeriesResponse);
      const trafficDataSeriesPerSecond = normalizeTrafficData(trafficDataSeriesPerSecondResponse);
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

function normalizeLatencies({
  avgLatency,
  quantile50latency,
  quantile90latency,
  quantile99latency
}: {
  avgLatency: PrometheusApiResult[];
  quantile50latency: PrometheusApiResult[];
  quantile90latency: PrometheusApiResult[];
  quantile99latency: PrometheusApiResult[];
}): ProcessLatenciesChart[] | null {
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

function normalizeTrafficData(data: PrometheusApiResult[]): ProcessDataChart | null {
  // If there are not samples collected prometheus can send yoy an empty array and we can consider it invalid
  const axisValues = normalizeMetric(data);
  if (!axisValues) {
    return null;
  }

  const timeSeriesDataReceived = axisValues[0];
  const timeSeriesDataSent = axisValues[1];
  const totalDataReceived = timeSeriesDataReceived[timeSeriesDataReceived.length - 1].y - timeSeriesDataReceived[1].y;
  const totalDataSent = timeSeriesDataSent[timeSeriesDataSent.length - 1].y - timeSeriesDataSent[1].y;

  return {
    timeSeriesDataReceived,
    timeSeriesDataSent,
    totalDataReceived,
    totalDataSent,
    totalData: totalDataSent + totalDataReceived
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
