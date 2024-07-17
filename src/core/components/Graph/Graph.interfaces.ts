export interface GraphNode {
  id: string;
  type?: CustomItemsProps;
  label: string;
  combo?: string;
  comboName?: string;
  groupId?: string;
  groupName?: string;
  groupCount?: number;
  groupedNodeCount?: number;
  x?: number | undefined;
  y?: number | undefined;
  persistPositionKey?: string;
  iconSrc: string;
}

export interface GraphCombo {
  id: string;
  type?: CustomItemsProps;
  label: string;
}

interface GraphEdgeMetrics {
  protocol: string | undefined;
  bytes: number | undefined;
  byteRate: number | undefined;
  latency: number | undefined;
  bytesReverse: number | undefined;
  byteRateReverse: number | undefined;
  latencyReverse: number | undefined;
}

export interface GraphEdge {
  id: string;
  type?: CustomItemsProps;
  source: string;
  target: string;
  sourceName?: string;
  targetName?: string;
  label?: string;
  protocolLabel?: string;
  metricValue?: number;
  metrics?: GraphEdgeMetrics;
}

export interface GraphReactAdaptorProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  combos?: GraphCombo[];
  itemsToHighlight?: string[];
  itemSelected?: string;
  onClickNode?: (id: string) => void;
  onClickEdge?: (id: string) => void;
  layout?: 'combo' | 'default' | 'neighbour';
  moveToSelectedNode?: boolean;
  savePositions?: boolean;
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

export type CustomItemsProps =
  | 'SkDataEdge'
  | 'SkSiteDataEdge'
  | 'SkSiteEdge'
  | 'SkLoopEdge'
  | 'SkNode'
  | 'SkNodeUnexposed'
  | 'SkNodeRemote'
  | 'SkCombo';
