import { fetchApiData } from './ApiClient';
import { PROMETHEUS_URL_RANGE_QUERY, PROMETHEUS_URL_SINGLE_QUERY } from '../config/api';
import { PrometheusLabelsV2 } from '../config/prometheus';
import {
  MetricData as MetricValuesAndLabels,
  MetricType,
  PrometheusLabels,
  PrometheusMetric,
  PrometheusResult,
  PrometheusQueryParams,
  PrometheusQueryParamsLatency,
  PrometheusResponse,
  ExecuteQueryQueryType,
  ExecuteQueryFunction
} from '../types/Prometheus.interfaces';
import { skAxisXY } from '../types/SkCharts';

const gePrometheusQueryPATH = (queryType: 'single' | 'range' = 'range') =>
  queryType === 'range' ? PROMETHEUS_URL_RANGE_QUERY : PROMETHEUS_URL_SINGLE_QUERY;

function convertToPrometheusQueryParams({
  sourceSite,
  sourceProcess,
  destSite,
  destProcess,
  sourceComponent,
  destComponent,
  service,
  protocol,
  direction,
  code
}: PrometheusLabels): string {
  const uiFilterValueToPrometheusLabelMapper = {
    [PrometheusLabelsV2.SourceSiteId]: sourceSite,
    [PrometheusLabelsV2.DestSiteId]: destSite,
    [PrometheusLabelsV2.SourceProcessName]: sourceProcess,
    [PrometheusLabelsV2.DestProcessName]: destProcess,
    [PrometheusLabelsV2.SourceComponentName]: sourceComponent,
    [PrometheusLabelsV2.DestComponentName]: destComponent,
    [PrometheusLabelsV2.RoutingKey]: service,
    [PrometheusLabelsV2.Protocol]: protocol,
    [PrometheusLabelsV2.Code]: code,
    [PrometheusLabelsV2.Direction]: direction
  };

  return Object.entries(uiFilterValueToPrometheusLabelMapper)
    .filter(([, value]) => value) // Keep only entries with non-empty values
    .map(([key, value]) => `${key}=~"${value}"`) // Format the key-value pair
    .join(','); // Join the filters with commas
}

function getHistoryValuesFromPrometheusData(data: PrometheusMetric<'matrix'>[] | []): skAxisXY[][] | null {
  if (!data.length || data.every(({ values }) => values.every(([, val]) => isNaN(Number(val))))) {
    return null;
  }

  return data.map(({ values }) =>
    values.map(([x, y]) => ({
      x: Number(x),
      y: isNaN(Number(y)) ? 0 : Number(y)
    }))
  );
}

/**
 * Converts an array of Prometheus result objects to a two-dimensional array of metric labels.
 */
function getHistoryLabelsFromPrometheusData(data: PrometheusMetric<'matrix'>[] | []): string[] | null {
  // Validate the input
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Map the input array to an array of label arrays using array destructuring
  return data.flatMap(({ metric }) => Object.values(metric));
}

function getHistoryFromPrometheusData(data: PrometheusMetric<'matrix'>[] | []): MetricValuesAndLabels | null {
  if (!data.length) {
    return null;
  }

  const values = getHistoryValuesFromPrometheusData(data) as skAxisXY[][];
  const labels = getHistoryLabelsFromPrometheusData(data) as string[];

  return { values, labels };
}

/**
 * Fills missing timestamp values in a Prometheus matrix result with zeros.
 * For each metric in the result, it adds data points with value 0 for any timestamp
 * between startTime and endTime that isn't present in the original data.
 */
function fillMatrixTimeseriesGaps(
  result: PrometheusResult<'matrix'> | [],
  startTime: number,
  endTime: number
): PrometheusResult<'matrix'> {
  if (!Array.isArray(result) || result.length === 0) {
    return result as PrometheusResult<'matrix'>;
  }

  const filledResult = result.map((metric: MetricType<'matrix'>) => {
    if (!('values' in metric)) {
      return metric;
    }

    const orderedTimes = metric.values.map(([t]) => t).sort((a, b) => a - b);
    const interval = orderedTimes[1] - orderedTimes[0];
    const filledValues: [number, number | typeof NaN][] = [];

    for (let t = startTime; t <= endTime; t += interval) {
      const value = metric.values.find(([time]) => time === t)?.[1] ?? 0;
      filledValues.push([t, value]);
    }

    return {
      ...metric,
      values: filledValues
    };
  });

  return filledResult as PrometheusResult<'matrix'>;
}

/**
 * Calculates the appropriate step for Prometheus range queries based on the time range.
 * This helps optimize query performance and data visualization by adjusting the data point density.
 */

function getPrometheusResolutionInSeconds(range: number): {
  step: string;
  loopback: string;
} {
  const K = 240;
  let loopback = 60;

  if (range >= 60 * 60 * 24) {
    loopback = 60 * 15;
  } else if (range >= 60 * 60 * 12) {
    loopback = 60 * 5;
  } else if (range >= 60 * 60 * 6) {
    loopback = 60 * 3;
  }

  const step = Math.ceil(range / K);

  return { step: `${step}s`, loopback: `${loopback}s` };
}

/**
 * Executes a Prometheus query with the provided parameters and handles the response based on query type (matrix/vector).
 * For matrix queries, it fills gaps in time series data.
 */
const executeQuery = async <T extends ExecuteQueryQueryType>(
  queryFn: ExecuteQueryFunction,
  params: Partial<PrometheusQueryParams & PrometheusQueryParamsLatency>,
  queryType: T,
  additionalArgs: unknown[] = []
) => {
  const { start, end, ...queryParams } = params;
  const queryFilterString = convertToPrometheusQueryParams(queryParams);
  const path = gePrometheusQueryPATH(queryType === 'vector' ? 'single' : undefined);
  const step = end && start ? getPrometheusResolutionInSeconds(end - start).step : undefined;

  const {
    data: { result }
  } = await fetchApiData<PrometheusResponse<T>>(path, {
    params: {
      query: queryFn(queryFilterString, ...additionalArgs),
      ...(queryType === 'matrix' && { start, end, step })
    }
  });

  if (queryType === 'matrix') {
    return fillMatrixTimeseriesGaps(result as PrometheusMetric<'matrix'>[], start!, end!) as PrometheusMetric<T>[];
  }

  return result;
};

export {
  executeQuery,
  fillMatrixTimeseriesGaps,
  gePrometheusQueryPATH,
  getPrometheusResolutionInSeconds,
  getHistoryFromPrometheusData,
  getHistoryLabelsFromPrometheusData,
  getHistoryValuesFromPrometheusData
};
