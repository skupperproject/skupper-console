export interface GraphNode {
  id: string;
  name: string;
  color: string;
  group: number;
  img?: string;
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
  groupFx?: number;
  groupFy?: number;
}

export interface GraphEdge<T = GraphNode> {
  source: T;
  target: T;
  type?: 'dashed';
  clickable?: boolean;
}
