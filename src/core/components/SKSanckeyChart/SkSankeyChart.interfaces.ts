import { VarColors } from '@config/colors';

export interface ThemesProps {
  labelTextColor: VarColors;
  fontFamily: string;
  fontSize: number;
  tooltip: { container: { color: string } };
}

export interface Themes {
  [key: string]: ThemesProps;
}

export interface SkSankeyChartNode {
  id: string;
  nodeColor?: string;
}

interface SkSankeyChartLink {
  source: string;
  target: string;
  value: number;
}

export interface SkSankeyChartProps {
  nodes: SkSankeyChartNode[];
  links: SkSankeyChartLink[];
}

export interface SankeyFilterValues {
  [key: string]: string | undefined;
}
