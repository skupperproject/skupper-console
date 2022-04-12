export interface TotalByteProps {
  totalBytes: number;
  name: string;
}

export interface TrafficChartProps {
  totalBytesProps: TotalByteProps[];
  timestamp: number;
  options?: {
    chartColor?: string;
    showLegend?: boolean;
    dataLegend?: {
      name: string;
    }[];
  };
}

export interface SampleProps {
  x: string;
  y: number;
  timestamp: number;
}
