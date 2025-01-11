import { skAxisXY } from './SkChartArea.interfaces';
import { Direction, Protocols, Quantiles } from '../API/REST.enum';
// Common base type for result types
type PrometheusResultType = 'matrix' | 'vector' | 'scalar' | 'string';

// Interface for the overall Prometheus response
export interface PrometheusResponse<T extends PrometheusResultType> {
  status: string; // Response status (e.g., "success")
  data: {
    resultType: T; // Type of the result
    result: PrometheusResult<T> | [];
  };
}

// Union type representing different result data structures
type PrometheusResult<T extends PrometheusResultType> = T extends 'matrix'
  ? PrometheusMetric<'matrix'>[]
  : T extends 'vector'
    ? PrometheusMetric<'vector'>[]
    : T extends 'scalar'
      ? number
      : T extends 'string'
        ? string
        : never; // Enforces valid result types

export interface PrometheusMetric<T extends PrometheusResultType> {
  metric: { [key: string]: string }; // Object containing metric labels
  values: T extends 'matrix' ? [number, number | typeof NaN][] : never; // Array of samples for matrix results
  value: T extends 'vector' ? [number, number | typeof NaN] : never; // Single sample with timestamp and value for vector results
}

export interface PrometheusLabels {
  sourceSite?: string;
  destSite?: string;
  sourceProcess?: string;
  destProcess?: string;
  sourceComponent?: string;
  destComponent?: string;
  service?: string;
  code?: string;
  direction?: Direction;
  protocol?: Protocols;
}

export interface PrometheusQueryParams extends PrometheusLabels {
  step: string;
  start: number;
  end: number;
}

export interface PrometheusQueryParamsLatency extends PrometheusQueryParams {
  quantile: Quantiles;
}

export type IntervalTimeMap = {
  [key: string]: { seconds: number; label: string };
};

export interface MetricData {
  values: skAxisXY[][];
  labels: string[];
}
