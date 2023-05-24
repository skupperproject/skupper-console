export interface SkChartAreaData {
  x: number;
  y: number;
}

export interface SkChartAreaProps {
  data: SkChartAreaData[][];
  formatY?: Function;
  formatX?: Function;
  axisYLabel?: string;
  legendLabels?: string[];
  themeColor?: string;
  isChartLine?: boolean;
  showLegend?: boolean;
}
