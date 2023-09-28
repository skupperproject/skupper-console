import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';

import { AvailableProtocols } from './REST.enum';

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

export interface PrometheusQueryParams {
  sourceProcess?: string;
  processIdDest?: string;
  protocol?: AvailableProtocols;
  step: string;
  isRate?: boolean;
  onlyErrors?: boolean;
  quantile?: 0.5 | 0.9 | 0.99;
  start?: number;
  end?: number;
}

export interface PrometheusQueryParamsSingleData {
  sourceProcess?: string;
  processIdDest?: string;
  protocol?: AvailableProtocols;
  seconds: number;
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
