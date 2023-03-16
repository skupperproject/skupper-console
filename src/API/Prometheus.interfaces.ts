export type ValidWindowTime = {
  FifteenMinutes: '15m';
  ThirtyMinutes: '30m';
  OneHours: '1h';
  TwoHours: '2h';
  SixHours: '6h';
  TwelveHours: '12h';
  OneDay: '1d';
  OneWeek: '1w';
  TwoWeeks: '2w';
};

export type PrometheusApiResultValue = [number, string];

export type PrometheusApiResult = {
  metric: Record<string, string>;
  values: PrometheusApiResultValue[];
};

export interface PrometheusQueryParams {
  id: string;
  range: keyof ValidWindowTime;
  processIdDest?: string;
  isRate?: boolean;
  quantile?: 0.5 | 0.9 | 0.99;
}
