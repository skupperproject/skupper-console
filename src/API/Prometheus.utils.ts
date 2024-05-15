import { prometheusSiteNameAndIdSeparator } from '@config/prometheus';
import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';

import { MetricData as MetricValuesAndLabels, PrometheusMetric } from './Prometheus.interfaces';

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

// prometheus site label has this format: siteName@_@siteId
export const composePrometheusSiteLabel = (name?: string, id?: string) =>
  (name || '') + (prometheusSiteNameAndIdSeparator || '') + (id || '');

export const decomposePrometheusSiteLabel = (name?: string) => name?.split(prometheusSiteNameAndIdSeparator)[0];
