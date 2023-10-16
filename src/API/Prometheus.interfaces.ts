import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';

import { AvailableProtocols, Quantiles } from './REST.enum';
import { FlowDirections } from './REST.interfaces';

type PrometheusApiResultValue = [number, `${number}` | 'NaN'];

export interface PrometheusResponse<T> {
  data: {
    result: T;
  };
}

export type PrometheusApiSingleResult = {
  metric: Record<string, string>;
  value: PrometheusApiResultValue;
};

export type PrometheusApiResult = {
  metric: Record<string, string>;
  values: PrometheusApiResultValue[];
};

export interface PrometheusLabels {
  sourceSite?: string;
  destSite?: string;
  sourceProcess?: string;
  destProcess?: string;
  service?: string;
  code?: string;
  direction?: FlowDirections;
  protocol?: AvailableProtocols;
}
export interface PrometheusQueryParams extends PrometheusLabels {
  step: string;
  start: number;
  end: number;
}

export interface PrometheusQueryParamsLatency extends PrometheusQueryParams {
  quantile: Quantiles;
}

export type IntervalTimeProp = IntervalTimeMap[keyof IntervalTimeMap];
export type IntervalTimePropValue = IntervalTimeMap[keyof IntervalTimeMap]['value'];
export type IntervalTimeMap = {
  [key: string]: { value: string; seconds: number; step: string; key: string; label: string };
};

export interface MetricData {
  values: skAxisXY[][];
  labels: string[];
}
