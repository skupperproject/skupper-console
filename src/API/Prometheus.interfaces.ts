import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';

import { AvailableProtocols } from './REST.enum';
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

export interface PrometheusQueryParams {
  sourceSite?: string;
  destSite?: string;
  sourceProcess?: string;
  destProcess?: string;
  direction?: FlowDirections | '';
  protocol?: AvailableProtocols;
  step: string;
  quantile?: 0.5 | 0.9 | 0.99;
  start?: number;
  end?: number;
}

export interface PrometheusQueryParamsSingleData {
  sourceSite?: string;
  destSite?: string;
  sourceProcess?: string;
  destProcess?: string;
  direction?: FlowDirections | '';
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
