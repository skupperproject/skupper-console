export interface skAxisXY {
  x: number;
  y: number;
}

export interface SkChartAreaProps {
  data: skAxisXY[][];
  formatY?: Function;
  formatYTooltip?: Function;
  formatX?: Function;
  axisYLabel?: string;
  legendLabels?: string[];
  themeColor?: string;
  isChartLine?: boolean;
  showLegend?: boolean;
}
