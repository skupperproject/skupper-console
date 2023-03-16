import { formatBytes } from '@core/utils/formatBytes';
import { PrometheusApi } from 'API/Prometheus';
import { PrometheusApiResult, ValidWindowTime } from 'API/Prometheus.interfaces';
import { ProcessResponse } from 'API/REST.interfaces';

import { ProcessAxisDataChart, ProcessMetrics } from '../Processes.interfaces';

const ProcessesController = {
  getMetrics: async (
    processesIdSource: string,
    durationFormatted: keyof ValidWindowTime,
    processIdDest: string
  ): Promise<ProcessMetrics> => {
    const params = {
      id: processesIdSource,
      range: durationFormatted,
      processIdDest
    };

    try {
      const trafficDataSeries = await PrometheusApi.fetchDataTraffic(params);
      const trafficDataSeriesPerSecond = await PrometheusApi.fetchDataTraffic({ ...params, isRate: true });

      return {
        trafficDataSeries: trafficDataSeries.length ? normalizeTrafficData(trafficDataSeries) : null,
        trafficDataSeriesPerSecond: trafficDataSeriesPerSecond.length
          ? normalizeTrafficData(trafficDataSeriesPerSecond)
          : null
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

function normalizeTrafficData(data: PrometheusApiResult[]) {
  const axisValues = normalizeMetric(data);

  const timeSeriesDataReceived = axisValues[0] || [];
  const timeSeriesDataSent = axisValues[1] || [];
  const trafficDataRx = axisValues[0] ? axisValues[0][axisValues[0].length - 1].y - axisValues[0][1].y : 0;
  const trafficDataTx = axisValues[1] ? axisValues[1][axisValues[1].length - 1].y - axisValues[1][1].y : 0;

  return {
    timeSeriesDataReceived,
    timeSeriesDataSent,
    totalDataReceived: trafficDataRx,
    totalDataSent: trafficDataTx,
    totalData: trafficDataTx + trafficDataRx
  };
}

function normalizeMetric(data: PrometheusApiResult[]): ProcessAxisDataChart[][] {
  return data.map(({ values }) =>
    values.map((value) => ({
      x: value[0],
      y: Number(value[1])
    }))
  );
}
