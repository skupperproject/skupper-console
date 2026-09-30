import { ComboCombinedLayoutOptions, ForceLayoutOptions, LayoutOptions } from '@antv/g6';

import { theme } from './config';
import { GraphLayouts } from '../../../types/Graph.interfaces';

const LAYOUT_TOPOLOGY_DEFAULT: ForceLayoutOptions & { type: 'force' } = {
  type: 'force',
  nodeSize: theme.node.size,
  nodeSpacing: theme.node.size,
  preventOverlap: true,
  linkDistance: 250,
  factor: 4
};

const LAYOUT_TOPOLOGY_COMBO: ComboCombinedLayoutOptions & { type: 'combo-combined' } = {
  type: 'combo-combined',
  nodeSize: theme.node.size / 2,
  nodeSpacing: theme.node.size,
  comboPadding: 0,
  comboSpacing: 0,
  layout: {
    type: 'antv-dagre',
    controlPoints: true,
    radial: true,
    rankdir: 'LR',
    ranksep: 45,
    nodesep: 30
  }
};

const LAYOUT_TOPOLOGY_DAGRE: LayoutOptions & { type: 'antv-dagre' } = {
  type: 'antv-dagre',
  rankdir: 'TB',
  ranksep: 45,
  nodesep: 30
};
export const LAYOUT_MAP: GraphLayouts = {
  default: LAYOUT_TOPOLOGY_DEFAULT,
  combo: LAYOUT_TOPOLOGY_COMBO,
  dagre: LAYOUT_TOPOLOGY_DAGRE
};
