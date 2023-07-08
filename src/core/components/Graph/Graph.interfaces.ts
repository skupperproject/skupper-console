import { GraphData, LayoutConfig, ModelStyle } from '@antv/g6';
import { EdgeModel, NodeModel } from '@patternfly/react-topology';

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
  x: number | undefined;
  y: number | undefined;
}

export interface GraphCombo {
  id: string;
  label: string;
  style?: ModelStyle;
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
  nodes: NodeModel[];
  edges: EdgeModel[];
  combos?: GraphCombo[];
  itemSelected?: string;
  onClickCombo?: Function;
  onClickNode?: Function;
  onClickEdge?: Function;
  onGetZoom?: Function;
  onFitScreen?: Function;
  legendData?: GraphData;
  layout?: LayoutConfig;
  config?: {
    zoom?: string | null;
    fitScreen?: number | null;
    fitCenter?: boolean | null;
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
  x: number | undefined;
  y: number | undefined;
}
