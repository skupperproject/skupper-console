export interface SkSankeyChartNode {
  id: string;
  nodeColor?: string;
}

export interface SkSankeyChartLink {
  source: string;
  target: string;
  value: number;
}
