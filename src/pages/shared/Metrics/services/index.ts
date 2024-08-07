import { PrometheusApi } from '@API/Prometheus.api';
import { PrometheusMetric, PrometheusQueryParams } from '@API/Prometheus.interfaces';
import {
  getTimeSeriesLabelsFromPrometheusData,
  getTimeSeriesValuesFromPrometheusData,
  getTimeSeriesFromPrometheusData
} from '@API/Prometheus.utils';
import { Quantiles } from '@API/REST.enum';
import { calculateStep, defaultTimeInterval } from '@config/prometheus';
import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';
import { getCurrentAndPastTimestamps } from '@core/utils/getCurrentAndPastTimestamps';

import {
  LatencyMetricsProps,
  ByteRateMetrics,
  LatencyMetrics,
  RequestMetrics,
  ResponseMetrics,
  LantencyBucketMetrics,
  ConnectionMetrics
} from './services.interfaces';
import { MetricsLabels } from '../Metrics.enum';
import { QueryMetricsParams } from '../Metrics.interfaces';

const MetricsController = {
  getLatencyPercentiles: async ({
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
      const [quantile50latency, quantile90latency, quantile95latency, quantile99latency] = await Promise.all([
        PrometheusApi.fetchPercentilesByLeInTimeRange({ ...params, quantile: Quantiles.Median }),
        PrometheusApi.fetchPercentilesByLeInTimeRange({ ...params, quantile: Quantiles.Ninety }),
        PrometheusApi.fetchPercentilesByLeInTimeRange({ ...params, quantile: Quantiles.NinetyFive }),
        PrometheusApi.fetchPercentilesByLeInTimeRange({ ...params, quantile: Quantiles.NinetyNine })
      ]);

      const latenciesData = normalizeLatencies({
        quantile50latency,
        quantile90latency,
        quantile95latency,
        quantile99latency
      });

      return latenciesData;
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getLatencyBuckets: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    service,
    protocol,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<LantencyBucketMetrics | null> => {
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

    const bucketLabels: Record<string, { le: string; position: number }> = {
      '+Inf': { le: 'Other', position: 8 },
      '1e+07': { le: '10 sec', position: 7 },
      '1e+06': { le: '1 sec', position: 6 },
      '100000': { le: '100ms', position: 5 },
      '10000': { le: '10 ms', position: 4 },
      '5000': { le: '5 ms', position: 3 },
      '2000': { le: '2 ms', position: 2 },
      '1000': { le: '1 ms', position: 1 }
    };

    try {
      const distributionBuckets = await PrometheusApi.fetchBucketCountsInTimeRange(params);

      if (!distributionBuckets.length) {
        return null;
      }

      const buckets = distributionBuckets
        .map(({ values, metric }) => ({ values, metric: bucketLabels[metric?.le] }))
        .sort((a, b) => a.metric.position - b.metric.position);

      const bucketsNormalized = buckets?.map(({ metric, values }, index) => ({
        data: [
          {
            x: metric?.le,
            y: Number(values[values.length - 1][1]) - Number(buckets[index - 1]?.values[values.length - 1][1] || 0)
          }
        ],
        label: metric?.le || ''
      }));

      const lastBucket = buckets[buckets.length - 1].values;
      const total = Number(lastBucket[lastBucket.length - 1][1]) || 0;

      const summary = buckets.map(({ metric, values }) => {
        const lessThanCount = Number(values[values.length - 1][1]);
        const lessThanPerc = Math.round((lessThanCount / (total || 1)) * 100);
        const greaterThanCount = total - Number(values[values.length - 1][1]) || 0;
        const greaterThanPerc = Math.round((greaterThanCount / (total || 1)) * 100);

        return { bound: metric?.le, lessThanCount, lessThanPerc, greaterThanCount, greaterThanPerc };
      });

      return { distribution: bucketsNormalized, summary };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getRequests: async ({
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
      const requestsByProcess = await PrometheusApi.fetchRequestRateByMethodInInTimeRange(params);
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

  getResponses: async ({
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
        sourceSite,
        destSite,
        // who send a request (sourceProcess) should query the response as a destProcess
        sourceProcess,
        destProcess,
        service,
        protocol,
        start,
        end,
        step: calculateStep(end - start)
      };

      const [responsesByProcess, responseRateByProcess] = await Promise.all([
        PrometheusApi.fetchResponseCountsByPartialCodeInTimeRange(params),
        PrometheusApi.fetchResponseCountsByPartialCodeInTimeRange(params),
        PrometheusApi.fetchHttpErrorRateByPartialCodeInTimeRange(params)
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

  getDataTraffic: async ({
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
        PrometheusApi.fetchByteRateByDirectionInTimeRange(params),
        PrometheusApi.fetchByteRateByDirectionInTimeRange({
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
  },

  getConnections: async ({
    sourceSite,
    destSite,
    sourceProcess,
    destProcess,
    service,
    protocol,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<ConnectionMetrics | null> => {
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
      const [liveConnections, liveConnectionsInTimeRangeData] = await Promise.all([
        PrometheusApi.fetchLiveFlows(params),
        PrometheusApi.fetchFlowsDeltaInTimeRange(params)
      ]);

      if (!liveConnections.length && !liveConnectionsInTimeRangeData.length) {
        return null;
      }

      const liveConnectionsCount = Number(liveConnections[0]?.value[1]) || 0;
      const liveConnectionsSerie = getTimeSeriesValuesFromPrometheusData(liveConnectionsInTimeRangeData);

      return { liveConnectionsCount, liveConnectionsSerie };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },
  /**
   * Ensure that both the "Tx" and "Rx" data series have the same number of data points, even if one of the series has fewer data points than the other
   * If one of the two series is empty, it is filled with values where y=0 and x equals the timestamp of the other series.
   */
  fillMissingDataWithZeros(rxSeries: skAxisXY[] = [], txSeries: skAxisXY[] = []) {
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
};

export default MetricsController;

/* UTILS */
function normalizeResponsesFromSeries(data: PrometheusMetric<'matrix'>[]): ResponseMetrics | null {
  // Convert the Prometheus API result into a chart data format
  const axisValues = getTimeSeriesFromPrometheusData(data);

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

function normalizeRequestFromSeries(data: PrometheusMetric<'matrix'>[]): RequestMetrics[] | null {
  const axisValues = getTimeSeriesValuesFromPrometheusData(data);
  const labels = getTimeSeriesLabelsFromPrometheusData(data);

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
  const quantile50latencyNormalized = getTimeSeriesValuesFromPrometheusData(quantile50latency);
  const quantile90latencyNormalized = getTimeSeriesValuesFromPrometheusData(quantile90latency);
  const quantile95latencyNormalized = getTimeSeriesValuesFromPrometheusData(quantile95latency);
  const quantile99latencyNormalized = getTimeSeriesValuesFromPrometheusData(quantile99latency);

  if (!quantile50latencyNormalized && !quantile90latencyNormalized && !quantile99latencyNormalized) {
    return null;
  }
  const latenciesNormalized: LatencyMetrics[] = [];

  if (quantile50latencyNormalized) {
    latenciesNormalized.push({ data: quantile50latencyNormalized[0], label: MetricsLabels.LatencyMetric50quantile });
  }

  if (quantile90latencyNormalized) {
    latenciesNormalized.push({ data: quantile90latencyNormalized[0], label: MetricsLabels.LatencyMetric90quantile });
  }

  if (quantile95latencyNormalized) {
    latenciesNormalized.push({ data: quantile95latencyNormalized[0], label: MetricsLabels.LatencyMetric95quantile });
  }

  if (quantile99latencyNormalized) {
    latenciesNormalized.push({ data: quantile99latencyNormalized[0], label: MetricsLabels.LatencyMetric99quantile });
  }

  return latenciesNormalized;
}

function normalizeByteRateFromSeries(
  txData: PrometheusMetric<'matrix'>[] | [],
  rxData: PrometheusMetric<'matrix'>[] | []
): ByteRateMetrics {
  const txTimeSerie = getTimeSeriesValuesFromPrometheusData(txData)?.[0];
  const rxTimeSerie = getTimeSeriesValuesFromPrometheusData(rxData)?.[rxData.length - 1];

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

  const currentTxValue = txTimeSerie?.[txTimeSerie.length - 1]?.y;
  const currentRxValue = rxTimeSerie?.[rxTimeSerie.length - 1]?.y;

  return {
    txTimeSerie: txTimeSerie ? { data: txTimeSerie, label: 'Tx' } : undefined,
    rxTimeSerie: rxTimeSerie ? { data: rxTimeSerie, label: 'Rx' } : undefined,
    avgTxValue: calculateAverage(txTimeSerie, totalAvgTxValue),
    avgRxValue: calculateAverage(rxTimeSerie, totalAvgRxValue),
    maxTxValue: calculateMaxValue(txTimeSerie),
    maxRxValue: calculateMaxValue(rxTimeSerie),
    currentTxValue,
    currentRxValue,
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
