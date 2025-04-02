import {
  getHistoryFromPrometheusData,
  getHistoryLabelsFromPrometheusData,
  getHistoryValuesFromPrometheusData
} from '../../../API/Prometheus.utils';
import { Labels } from '../../../config/labels';
import {
  ByteRateMetrics,
  LatencyMetrics,
  LatencyMetricsProps,
  RequestMetrics,
  ResponseMetrics
} from '../../../types/Metrics.interfaces';
import { PrometheusMetric } from '../../../types/Prometheus.interfaces';
import { skAxisXY } from '../../../types/SkCharts';

function normalizeResponsesFromSeries(data: PrometheusMetric<'matrix'>[]): ResponseMetrics | null {
  // Convert the Prometheus API result into a chart data format
  const axisValues = getHistoryFromPrometheusData(data);

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
      total = Math.round(responseValues[responseValues.length - 1].y);
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

function normalizeRequestFromSeries(data: PrometheusMetric<'matrix'>[]): RequestMetrics[] | null {
  const axisValues = getHistoryValuesFromPrometheusData(data);
  const labels = getHistoryLabelsFromPrometheusData(data);

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
  quantile95latency,
  quantile99latency
}: LatencyMetricsProps): LatencyMetrics[] | null {
  const quantile50latencyNormalized = getHistoryValuesFromPrometheusData(quantile50latency);
  const quantile90latencyNormalized = getHistoryValuesFromPrometheusData(quantile90latency);
  const quantile95latencyNormalized = getHistoryValuesFromPrometheusData(quantile95latency);
  const quantile99latencyNormalized = getHistoryValuesFromPrometheusData(quantile99latency);

  if (!quantile50latencyNormalized && !quantile90latencyNormalized && !quantile99latencyNormalized) {
    return null;
  }
  const latenciesNormalized: LatencyMetrics[] = [];

  if (quantile50latencyNormalized) {
    latenciesNormalized.push({ data: quantile50latencyNormalized[0], label: Labels.LatencyMetric50quantile });
  }

  if (quantile90latencyNormalized) {
    latenciesNormalized.push({ data: quantile90latencyNormalized[0], label: Labels.LatencyMetric90quantile });
  }

  if (quantile95latencyNormalized) {
    latenciesNormalized.push({ data: quantile95latencyNormalized[0], label: Labels.LatencyMetric95quantile });
  }

  if (quantile99latencyNormalized) {
    latenciesNormalized.push({ data: quantile99latencyNormalized[0], label: Labels.LatencyMetric99quantile });
  }

  return latenciesNormalized;
}

function normalizeByteRateFromSeries(
  txData: PrometheusMetric<'matrix'>[] | [],
  rxData: PrometheusMetric<'matrix'>[] | []
): ByteRateMetrics {
  const txTimeSerie = getHistoryValuesFromPrometheusData(txData)?.[0];
  const rxTimeSerie = getHistoryValuesFromPrometheusData(rxData)?.[rxData.length - 1];

  const totalAvgTxValue = txTimeSerie?.reduce((acc, { y }) => acc + y, 0);
  const totalAvgRxValue = rxTimeSerie?.reduce((acc, { y }) => acc + y, 0);

  const totalTxValue = txTimeSerie ? calculateTotalBytes(txTimeSerie) : 0;
  const totalRxValue = rxTimeSerie ? calculateTotalBytes(rxTimeSerie) : 0;

  const calculateAverage = (timeSerie: skAxisXY[] | undefined, totalValue: number | undefined): number | undefined => {
    if (!timeSerie || !totalValue) {
      return undefined;
    }

    return totalValue / timeSerie.length;
  };

  const calculateMaxValue = (timeSerie: skAxisXY[] | undefined): number | undefined => {
    if (!timeSerie) {
      return undefined;
    }

    return Math.max(...timeSerie.map(({ y }) => y));
  };

  const calculateMinValue = (timeSerie: skAxisXY[] | undefined): number | undefined => {
    if (!timeSerie) {
      return undefined;
    }

    return Math.min(...timeSerie.map(({ y }) => y));
  };

  return {
    txTimeSerie: txTimeSerie ? { data: txTimeSerie, label: 'Tx' } : undefined,
    rxTimeSerie: rxTimeSerie ? { data: rxTimeSerie, label: 'Rx' } : undefined,
    avgTxValue: calculateAverage(txTimeSerie, totalAvgTxValue),
    avgRxValue: calculateAverage(rxTimeSerie, totalAvgRxValue),
    maxTxValue: calculateMaxValue(txTimeSerie),
    maxRxValue: calculateMaxValue(rxTimeSerie),
    minTxValue: calculateMinValue(txTimeSerie),
    minRxValue: calculateMinValue(rxTimeSerie),
    totalTxValue,
    totalRxValue
  };
}

/**
 * The function iterates over each pair of adjacent data points (t1, r1) and (t2, r2).
 * It calculates the trapezoidal area using the formula:
 *  A = (r1 + r2) * (t2 - t1) / 2
 */
function calculateTotalBytes(timeSeries: { x: number; y: number }[]) {
  let totalBytes = 0;

  for (let i = 1; i < timeSeries.length; i++) {
    const t1 = timeSeries[i - 1].x;
    const r1 = timeSeries[i - 1].y;
    const t2 = timeSeries[i].x;
    const r2 = timeSeries[i].y;

    const trapezoidArea = ((r1 + r2) * (t2 - t1)) / 2;
    totalBytes += trapezoidArea;
  }

  return totalBytes;
}

/**
 * Ensure that both the "Tx" and "Rx" data series have the same number of data points, even if one of the series has fewer data points than the other.
 * If one of the two series is empty, it is filled with values where y=0 and x equals the timestamp of the other series.
 */
function alignDataSeriesWithZeros(rxSeries: skAxisXY[] = [], txSeries: skAxisXY[] = []) {
  if (rxSeries.length === 0 && txSeries.length > 0) {
    const filledRxSeries = txSeries.map(({ x }) => ({ y: 0, x }));

    return [filledRxSeries, txSeries];
  }

  if (txSeries.length === 0 && rxSeries.length > 0) {
    const filledTxSeries = rxSeries.map(({ x }) => ({ y: 0, x }));

    return [rxSeries, filledTxSeries];
  }

  return [rxSeries, txSeries];
}

function sumValuesByTimestamp(combinedArray: PrometheusMetric<'matrix'>[]): PrometheusMetric<'matrix'>[] {
  // Dictionary to store the sum of values for each unique timestamp
  const timestampSum: { [key: number]: number } = {};

  // Iterate through the combined array and sum the values for each timestamp
  combinedArray.forEach((metric) => {
    metric.values.forEach((item) => {
      const timestamp = item[0];
      const value = parseFloat(item[1].toString()); // Ensure the value is parsed as a number

      if (timestampSum[timestamp]) {
        timestampSum[timestamp] += value;
      } else {
        timestampSum[timestamp] = value;
      }
    });
  });

  // Convert the dictionary back into an array of [number, number] tuples
  const resultValues: [number, number][] = Object.keys(timestampSum).map((timestamp) => [
    parseFloat(timestamp),
    timestampSum[parseFloat(timestamp)]
  ]);

  // Return the result as an array of PrometheusMetric<'matrix'> objects
  return [
    {
      metric: {},
      values: resultValues
    }
  ];
}

const generateFilterItems = ({
  data,
  parentSelected
}: {
  data?: { id: string; destinationName: string; parentId?: string; parentName?: string }[];
  parentSelected?: string;
}): {
  id: string;
  label: string;
}[] =>
  data
    // parentSelected can be id`|id2 => we need to use includes instead === to check the presence of parentId
    ?.filter(({ parentId }) => (parentSelected ? parentSelected.includes(parentId || '') : true))
    .map(({ id, destinationName }) => ({
      id,
      label: destinationName
    })) || [];

export {
  alignDataSeriesWithZeros,
  generateFilterItems,
  normalizeByteRateFromSeries,
  normalizeLatencies,
  normalizeRequestFromSeries,
  normalizeResponsesFromSeries,
  sumValuesByTimestamp
};
