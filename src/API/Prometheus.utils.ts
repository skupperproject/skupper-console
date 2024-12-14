import { PROMETHEUS_URL_RANGE_QUERY, PROMETHEUS_URL_SINGLE_QUERY } from '../config/api';
import { PrometheusLabelsV2 } from '../config/prometheus';
import {
  MetricData as MetricValuesAndLabels,
  PrometheusLabels,
  PrometheusMetric
} from '../types/Prometheus.interfaces';
import { skAxisXY } from '../types/SkChartArea.interfaces';

export const gePrometheusQueryPATH = (queryType: 'single' | 'range' = 'range') =>
  queryType === 'range' ? PROMETHEUS_URL_RANGE_QUERY : PROMETHEUS_URL_SINGLE_QUERY;

export function convertToPrometheusQueryParams({
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

export function getTimeSeriesValuesFromPrometheusData(data: PrometheusMetric<'matrix'>[] | []): skAxisXY[][] | null {
  // Prometheus can retrieve empty arrays wich are not valid data for us
  if (!data.length) {
    return null;
  }

  return data.map(({ values }) =>
    values.map((value) => ({
      x: Number(value[0]),
      // y should be a numeric value, we sanitize 'NaN' in 0
      y: isNaN(Number(value[1])) ? 0 : Number(value[1])
    }))
  );
}

/**
 * Converts an array of Prometheus result objects to a two-dimensional array of metric labels.
 */
export function getTimeSeriesLabelsFromPrometheusData(data: PrometheusMetric<'matrix'>[] | []): string[] | null {
  // Validate the input
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Map the input array to an array of label arrays using array destructuring
  return data.flatMap(({ metric }) => Object.values(metric));
}

export function getTimeSeriesFromPrometheusData(data: PrometheusMetric<'matrix'>[] | []): MetricValuesAndLabels | null {
  if (!data.length) {
    return null;
  }

  const values = getTimeSeriesValuesFromPrometheusData(data) as skAxisXY[][];
  const labels = getTimeSeriesLabelsFromPrometheusData(data) as string[];

  return { values, labels };
}
