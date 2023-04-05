import { AvailableProtocols } from './REST.enum';

export type IntervalTimeMap = {
  [key: string]: { value: string; seconds: number; step: string; key: string; label: string };
};

export type IntervalTimeProp = IntervalTimeMap[keyof IntervalTimeMap];
export type IntervalTimePropValue = IntervalTimeMap[keyof IntervalTimeMap]['value'];

type PrometheusApiResultValue = [number, string];

export interface PrometheusResponse<T> {
  data: {
    result: T;
  };
}

export type PrometheusApiResultSingle = {
  metric: Record<string, string>;
  value: PrometheusApiResultValue;
};

export type PrometheusApiResult = {
  metric: Record<string, string>;
  values: PrometheusApiResultValue[];
};

export interface PrometheusQueryParams {
  id: string;
  range: IntervalTimeProp;
  processIdDest?: string;
  isRate?: boolean;
  onlyErrors?: boolean;
  protocol?: AvailableProtocols;
  quantile?: 0.5 | 0.9 | 0.99;
}

export interface PrometheusQueryParamsWithStartAndEndTime extends PrometheusQueryParams {
  start: number;
  end: number;
}

export interface PrometheusFlowsQueryParams {
  onlyActive?: boolean;
}
