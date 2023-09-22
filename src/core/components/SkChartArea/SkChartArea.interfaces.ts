import { ChartProps } from '@patternfly/react-charts';

export interface skAxisXY {
  x: number;
  y: number;
}

export interface SkChartAreaProps extends ChartProps {
  data: skAxisXY[][];
  formatY?: Function;
  formatYTooltip?: Function;
  formatX?: Function;
  axisYLabel?: string;
  legendLabels?: string[];
  isChartLine?: boolean;
  showLegend?: boolean;
}
