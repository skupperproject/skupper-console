import { GraphData, ModelStyle } from '@antv/g6';

export interface GraphNode {
  id: string;
  label: string;
  comboId?: string;
  icon?: {
    show?: boolean;
    img?: string;
    width?: number;
    height?: number;
  };
  style?: Record<string, string>;
  x?: number | undefined;
  y?: number | undefined;
  key?: string;
}

export interface GraphCombo {
  id: string;
  label: string;
  style?: ModelStyle;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceName?: string;
  targetName?: string;
  type?: string;
  label?: string;
  labelCfg?: Record<string, unknown>;
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
  fitScreen?: number | null;
  zoom?: number | null;
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
  x: number | undefined;
  y: number | undefined;
}
