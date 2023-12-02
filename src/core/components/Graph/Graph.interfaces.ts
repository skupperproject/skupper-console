import { MutableRefObject } from 'react';

import { GraphData, ModelConfig, ModelStyle, ShapeStyle } from '@antv/g6';

export interface GraphNode {
  id: string;
  label: string;
  comboId?: string;
  comboName?: string;
  groupId?: string;
  groupName?: string;
  groupCount?: number;
  type?: string;
  enableBadge1?: boolean;
  notificationValue?: number;
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
  style?: ShapeStyle;
  metrics?: {
    protocol: string | undefined;
    bytes: number | undefined;
    byteRate: number | undefined;
    latency: number | undefined;
    bytesReverse: number | undefined;
    byteRateReverse: number | undefined;
    latencyReverse: number | undefined;
  };
}

export interface GraphReactAdaptorExposedMethods {
  saveNodePositions: Function;
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
  ref?: MutableRefObject<GraphReactAdaptorExposedMethods | undefined>;
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
