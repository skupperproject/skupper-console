export interface SkSankeyChartNode {
  id: string;
  nodeColor?: string;
}

export interface SkSankeyChartLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyFilterValues {
  [key: string]: string | undefined;
}
