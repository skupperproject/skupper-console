import { ChartProps } from '@patternfly/react-charts';

export interface SkChartBarProps extends ChartProps {
  data: { x: string; y: number }[][];
  formatY?: Function;
  formatYTooltip?: Function;
  formatX?: Function;
  axisYLabel?: string;
  legendLabels?: string[];
  isChartLine?: boolean;
  showLegend?: boolean;
}
