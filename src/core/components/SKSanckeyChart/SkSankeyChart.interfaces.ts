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
