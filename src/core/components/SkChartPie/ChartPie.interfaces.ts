import { ChartDonutProps } from '@patternfly/react-charts';

export interface SkChartPieProps extends ChartDonutProps {
  data: { x: string; y: number }[];
  format?: Function;
}
