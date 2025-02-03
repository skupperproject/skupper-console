import { skAxisXY } from './SkCharts';
import { Direction, Protocols, Quantiles } from '../API/REST.enum';
// Common base type for result types
type PrometheusResultType = 'matrix' | 'vector' | 'scalar' | 'string';

interface MatrixMetric {
  metric: { [key: string]: string };
  values: [number, number | typeof NaN][];
}

interface VectorMetric {
  metric: { [key: string]: string };
  value: [number, number | typeof NaN];
}

interface BaseMetric {
  metric: { [key: string]: string };
}

export type PrometheusMetric<T> = T extends 'matrix' ? MatrixMetric : T extends 'vector' ? VectorMetric : BaseMetric;

export type MetricType<T extends PrometheusResultType> = BaseMetric &
  (T extends 'matrix'
    ? { values: [number, number | typeof NaN][] }
    : T extends 'vector'
      ? { value: [number, number | typeof NaN] }
      : '');

// Union type representing different result data structures
export type PrometheusResult<T extends PrometheusResultType> = T extends 'matrix' | 'vector'
  ? MetricType<T>[]
  : T extends 'scalar'
    ? number
    : T extends 'string'
      ? string
      : never;

// Interface for the overall Prometheus response
export interface PrometheusResponse<T extends PrometheusResultType> {
  status: string;
  data: {
    resultType: T;
    result: PrometheusResult<T> | [];
  };
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

export type ExecuteQueryQueryType = 'matrix' | 'vector';
export type ExecuteQueryFunction = (filterString: string, ...args: any[]) => string;
