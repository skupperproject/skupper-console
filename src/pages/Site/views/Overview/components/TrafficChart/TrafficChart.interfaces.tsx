export interface TotalByteProps {
  totalBytes: number;
  name: string;
}

export interface ChartThemeColors {
  blue: string;
  cyan: string;
  default: string;
  gold: string;
  gray: string;
  green: string;
  multi: string;
  multiOrdered: string;
  multiUnordered: string;
  orange: string;
  purple: string;
}

export interface TrafficChartProps {
  totalBytesProps: TotalByteProps[];
  timestamp: number;
  options?: {
    chartColor?: string;
  };
}

export interface SampleProps {
  x: string;
  y: number;
  timestamp: number;
}
