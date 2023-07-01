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
  x: number | null;
  y: number | null;
}

export interface GraphCombo {
  id: string;
  label: string;
  style?: Record<string, string | number>;
}

export interface GraphEdge {
  source: string;
  sourceName?: string;
  target: string;
  targetName?: string;
  id: string;
  label?: string;
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
  onGetZoom?: Function;
  onFitScreen?: Function;
  legendData?: GraphData;
  config?: {
    zoom?: string | null;
    fitScreen?: number | null;
  };
}

export interface LocalStorageDataSavedPayload {
  x: number;
  y: number;
}

export interface LocalStorageDataSaved {
  [key: string]: LocalStorageDataSavedPayload;
}

export interface LocalStorageData extends LocalStorageDataSavedPayload {
  id: string;
}

export interface LocalStorageDataWithNullXY extends Omit<LocalStorageData, 'x' | 'y'> {
  x: number | null;
  y: number | null;
}
