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

const MIN_COMBO_COLLISION_DIAMETER = 200;

const comboOuterSize = (node: unknown): number => {
  if (!node || typeof node !== 'object') {
    return theme.node.size;
  }

  const { size } = node as { size?: number | number[] };

  if (Array.isArray(size)) {
    const width = size[0] ?? 0;
    const height = size[1] ?? 0;

    return Math.max(width, height, MIN_COMBO_COLLISION_DIAMETER);
  }

  return typeof size === 'number' ? size : theme.node.size;
};

const LAYOUT_TOPOLOGY_COMBO: ComboCombinedLayoutOptions & { type: 'combo-combined' } = {
  type: 'combo-combined',
  nodeSize: theme.node.size,
  nodeSpacing: theme.node.size / 2,
  comboPadding: 60,
  comboSpacing: 30,
  layout: (comboId) =>
    comboId === null
      ? { type: 'force', preventOverlap: true, factor: 2, nodeSize: comboOuterSize }
      : { type: 'force', preventOverlap: true, linkDistance: theme.node.size * 2 }
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
