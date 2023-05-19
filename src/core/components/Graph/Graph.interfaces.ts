import { GraphData } from '@antv/g6';

export interface GraphNode {
  id: string;
  label: string;
  comboId?: string;
  icon?: {
    show?: boolean;
    img?: string;
  };
  style?: Record<string, string>;
  x?: number;
  y?: number;
}

export interface GraphCombo {
  id: string;
  label: string;
  style?: Record<string, string | number>;
}

export interface GraphEdge {
  source: string;
  target: string;
  id: string;
  style?: Record<string, string | number[]>;
}

export interface GraphReactAdaptorProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  combos?: GraphCombo[];
  itemSelected?: string;
  onClickCombo?: Function;
  onClickNode?: Function;
  onClickEdge?: Function;
  legendData?: GraphData;
}

export interface LocalStorageData {
  id: string;
  x: number;
  y: number;
}
