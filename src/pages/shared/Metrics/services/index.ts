import { PrometheusApi } from '../../../../API/Prometheus.api';
import {
  getTimeSeriesLabelsFromPrometheusData,
  getTimeSeriesValuesFromPrometheusData,
  getTimeSeriesFromPrometheusData
} from '../../../../API/Prometheus.utils';
import { Quantiles } from '../../../../API/REST.enum';
import { calculateStep, defaultTimeInterval } from '../../../../config/prometheus';
import { formatToDecimalPlacesIfCents } from '../../../../core/utils/formatToDecimalPlacesIfCents';
import { getCurrentAndPastTimestamps } from '../../../../core/utils/getCurrentAndPastTimestamps';
import {
  LatencyMetricsProps,
  ByteRateMetrics,
  LatencyMetrics,
  RequestMetrics,
  ResponseMetrics,
  LantencyBucketMetrics,
  ConnectionMetrics,
  QueryMetricsParams,
  getDataTrafficMetrics
} from '../../../../types/Metrics.interfaces';
import { PrometheusMetric, PrometheusQueryParams } from '../../../../types/Prometheus.interfaces';
import { skAxisXY } from '../../../../types/SkChartArea.interfaces';
import { MetricsLabels } from '../Metrics.enum';

export const MetricsController = {
  getLatencyPercentiles: async ({
    sourceSite,
    destSite,
    sourceComponent,
    destComponent,
    sourceProcess,
    destProcess,
    service,
    direction,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<LatencyMetrics[] | null> => {
    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceComponent,
      destComponent,
      sourceProcess,
      destProcess,
      service,
      direction,
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
    sourceComponent,
    destComponent,
    sourceProcess,
    destProcess,
    service,
    direction,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<LantencyBucketMetrics | null> => {
    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceComponent,
      destComponent,
      sourceProcess,
      destProcess,
      service,
      direction,
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
    sourceComponent,
    destComponent,
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
      sourceComponent,
      destComponent,
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
    sourceComponent,
    destComponent,
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
        sourceComponent,
        destComponent,
        // who send a request (sourceProcess) should query the response as a destProcess
        sourceProcess,
        destProcess,
        service,
        protocol,
        start,
        end,
        step: calculateStep(end - start)
      };

      const [responsesByProcess, errorRateByProcess] = await Promise.all([
        PrometheusApi.fetchResponseCountsByPartialCodeInTimeRange(params),
        PrometheusApi.fetchHttpErrorRateByPartialCodeInTimeRange(params)
      ]);

      const responseData = normalizeResponsesFromSeries(responsesByProcess);
      const responseRateData = normalizeResponsesFromSeries(errorRateByProcess);

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
    sourceComponent,
    destComponent,
    sourceProcess,
    destProcess,
    service,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<getDataTrafficMetrics> => {
    const params: PrometheusQueryParams = {
      service,
      start,
      end,
      step: calculateStep(end - start),
      sourceSite,
      destSite,
      sourceComponent,
      destComponent,
      sourceProcess,
      destProcess
    };

    const invertedParams = {
      ...params,
      sourceSite: destSite, //client
      destSite: sourceSite, //server
      sourceComponent: destComponent,
      destComponent: sourceComponent,
      sourceProcess: destProcess,
      destProcess: sourceProcess
    };

    const isServiceWIthoutSelecedResources = !!service && !sourceSite && !destSite && !sourceProcess && !destProcess;
    const isSameSite = !!sourceSite && !!destSite && sourceSite === destSite;

    try {
      const [sourceToDestByteRateTx, destToSourceByteRateRx, destToSourceByteRateTx, sourceToDestByteRateRx] =
        await Promise.all([
          // Outgoing byte rate: Data sent from the source to the destination
          isServiceWIthoutSelecedResources || (!service && isSameSite)
            ? []
            : PrometheusApi.fetchByteRateInTimeRange(params),
          // Incoming byte rate: Data received at the destination from the source
          isServiceWIthoutSelecedResources || (!service && isSameSite)
            ? []
            : PrometheusApi.fetchByteRateInTimeRange(params, true),
          // Outgoing byte rate from the other side: Data sent from the destination to the source
          !isServiceWIthoutSelecedResources && service ? [] : PrometheusApi.fetchByteRateInTimeRange(invertedParams),
          // Incoming byte rate from the other side: Data received at the source from the destination
          !isServiceWIthoutSelecedResources && service
            ? []
            : PrometheusApi.fetchByteRateInTimeRange(invertedParams, true)
        ]);

      return {
        traffic: normalizeByteRateFromSeries(
          sumValuesByTimestamp([...sourceToDestByteRateTx, ...sourceToDestByteRateRx]),
          sumValuesByTimestamp([...destToSourceByteRateTx, ...destToSourceByteRateRx])
        ),
        trafficClient: normalizeByteRateFromSeries(
          sumValuesByTimestamp(sourceToDestByteRateTx),
          sumValuesByTimestamp(destToSourceByteRateRx)
        ),
        trafficServer: normalizeByteRateFromSeries(
          sumValuesByTimestamp(destToSourceByteRateTx),
          sumValuesByTimestamp(sourceToDestByteRateRx)
        )
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },

  getConnections: async ({
    sourceSite,
    destSite,
    sourceComponent,
    destComponent,
    sourceProcess,
    destProcess,
    service,
    duration = defaultTimeInterval.seconds,
    start = getCurrentAndPastTimestamps(duration).start,
    end = getCurrentAndPastTimestamps(duration).end
  }: QueryMetricsParams): Promise<ConnectionMetrics | null> => {
    const params: PrometheusQueryParams = {
      sourceSite,
      destSite,
      sourceComponent,
      destComponent,
      sourceProcess,
      destProcess,
      service,
      start,
      end,
      step: calculateStep(end - start)
    };

    const invertedParams = {
      ...params,
      sourceSite: destSite, //client
      destSite: sourceSite, //server
      sourceComponent: destComponent,
      destComponent: sourceComponent,
      sourceProcess: destProcess,
      destProcess: sourceProcess
    };

    try {
      const [liveConnectionsIn, liveConnectionsInTimeRangeData, liveConnectionOut, liveConnectionsOutTimeRangeData] =
        await Promise.all([
          PrometheusApi.fetchOpenConnections(params),
          PrometheusApi.fetchOpenConnectionsInTimeRange(params),
          service ? [] : PrometheusApi.fetchOpenConnections(invertedParams),
          service ? [] : PrometheusApi.fetchOpenConnectionsInTimeRange(invertedParams)
        ]);

      if (
        !liveConnectionsIn.length &&
        !liveConnectionOut.length &&
        !liveConnectionsInTimeRangeData.length &&
        !liveConnectionsOutTimeRangeData.length
      ) {
        return null;
      }

      const liveConnectionsCount =
        (Number(liveConnectionsIn[0]?.value[1]) || 0) + (Number(liveConnectionOut[0]?.value[1]) || 0);

      const liveConnectionsSerie = getTimeSeriesValuesFromPrometheusData(
        sumValuesByTimestamp([...liveConnectionsInTimeRangeData, ...liveConnectionsOutTimeRangeData])
      );

      return {
        liveConnectionsCount,
        liveConnectionsSerie
      };
    } catch (e: unknown) {
      return Promise.reject(e);
    }
  },
  /**
   * Ensure that both the "Tx" and "Rx" data series have the same number of data points, even if one of the series has fewer data points than the other
   * If one of the two series is empty, it is filled with values where y=0 and x equals the timestamp of the other series.
   */
  fillMissingDataWithZeros(rxSeries: skAxisXY[] = [], txSeries: skAxisXY[] = []) {
    return alignDataSeriesWithZeros(rxSeries, txSeries);
  }
};

/* UTILS */
export function normalizeResponsesFromSeries(data: PrometheusMetric<'matrix'>[]): ResponseMetrics | null {
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

/**
 * Ensure that both the "Tx" and "Rx" data series have the same number of data points, even if one of the series has fewer data points than the other.
 * If one of the two series is empty, it is filled with values where y=0 and x equals the timestamp of the other series.
 */
export function alignDataSeriesWithZeros(rxSeries: skAxisXY[] = [], txSeries: skAxisXY[] = []) {
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
      values: resultValues,
      value: undefined as never // Explicitly set value to never for matrix type
    }
  ];
}

export const generateFilterItems = ({
  data,
  parentSelected
}: {
  data?: { destinationName: string; siteName?: string }[];
  parentSelected?: string;
}): {
  id: string;
  label: string;
}[] =>
  data
    ?.filter(({ siteName }) => (parentSelected ? siteName === parentSelected : true))
    .map(({ destinationName }) => ({
      id: destinationName,
      label: destinationName
    })) || [];
