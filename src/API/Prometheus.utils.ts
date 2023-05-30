import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';

import { MetricData as MetricValuesAndLabels, PrometheusApiResult } from './Prometheus.interfaces';

export function extractPrometheusValues(data: PrometheusApiResult[]): skAxisXY[][] | null {
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
export function extractPrometheusLabels(data: PrometheusApiResult[]): string[] | null {
  // Validate the input
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Map the input array to an array of label arrays using array destructuring
  return data.flatMap(({ metric }) => Object.values(metric));
}

export function extractPrometheusValuesAndLabels(data: PrometheusApiResult[]): MetricValuesAndLabels | null {
  if (!data.length) {
    return null;
  }

  const values = extractPrometheusValues(data) as skAxisXY[][];
  const labels = extractPrometheusLabels(data) as string[];

  return { values, labels };
}
