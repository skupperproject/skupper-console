export type IntervalTimeMap = {
  [key: string]: { value: string; seconds: number; step: string; key: string; label: string };
};

export type IntervalTimeProp = IntervalTimeMap[keyof IntervalTimeMap];
export type IntervalTimePropValue = IntervalTimeMap[keyof IntervalTimeMap]['value'];

type PrometheusApiResultValue = [number, string];

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
  protocol?: string;
  quantile?: 0.5 | 0.9 | 0.99;
}
