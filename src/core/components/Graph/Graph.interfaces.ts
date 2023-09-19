import { GraphData, ModelConfig, ModelStyle } from '@antv/g6';

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
  fx?: number | undefined;
  fy?: number | undefined;
  persistPositionKey?: string;
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
  saveConfigkey?: string;
  onGetZoom?: Function;
  onFitScreen?: Function;
  legendData?: GraphData;
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

export interface NodeWithBadgesProps extends ModelConfig {
  notificationValue?: number;
  notificationColor?: string;
  notificationFontSize?: number;
}

export interface ComboWithCustomLabel extends ModelConfig {
  labelBgCfg?: {
    fill?: string;
    padding?: number[];
  };
}
