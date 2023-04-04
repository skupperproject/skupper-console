export interface GraphProps {
  $node: HTMLElement;
  width: number;
  height: number;
  nodeSelected?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  group: string;
  groupName: string;
  img?: string;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  index?: number;
  groupFx?: number;
  groupFy?: number;
  isDisabled?: boolean;
}

export interface GraphGroup {
  id: string;
  name: string;
  color?: string;
}

export interface GraphEdge<T = GraphNode> {
  source: T;
  target: T;
  type?: 'dashed';
  clickable?: boolean;
}

export interface GraphReactAdaptorProps {
  nodes: GraphNode[];
  edges: GraphEdge<string>[];
  groups?: GraphGroup[];
  nodeSelected?: string;
  onClickNode?: Function;
  onClickEdge?: Function;
}
