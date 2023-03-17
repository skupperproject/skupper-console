import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';

export interface TopologyPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge<string>[];
  nodeSelected?: string | null;
  options?: { showGroup?: boolean };
  onGetSelectedNode?: Function;
  onGetSelectedEdge?: Function;
}
