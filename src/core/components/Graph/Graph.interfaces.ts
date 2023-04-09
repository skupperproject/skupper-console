export interface GraphProps {
  $node: HTMLElement;
  width: number;
  height: number;
  nodeSelected?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  group: string;
  style: {
    img?: string;
    fill: string;
    opacity?: number;
  };
  x?: number;
  y?: number;
}

export interface GraphNodeWithForce extends GraphNode {
  index?: number;
  x: number;
  y: number;
  fx?: number;
  fy?: number;
  vx?: number;
  vy?: number;
  groupFx?: number;
  groupFy?: number;
}

export interface GraphGroup {
  id: string;
  name: string;
  color?: string;
}

export interface GraphEdge<T = GraphNodeWithForce> {
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
  onClickCombo?: Function;
  onClickNode?: Function;
  onClickEdge?: Function;
}
