import { ILabelConfig, LayoutConfig, ModelStyle, Modes } from '@antv/g6-core';

import {
  COMBO_BORDER_COLOR_DEFAULT,
  COMBO_BORDER_COLOR_HOVER,
  COMBO_COLOR_DEFAULT_LABEL,
  COMBO__COLOR_DEFAULT,
  EDGE_COLOR_DEFAULT,
  NODE_BORDER_COLOR_DEFAULT,
  NODE_COLOR_DEFAULT,
  NODE_COLOR_DEFAULT_LABEL,
  NODE_COLOR_DEFAULT_LABEL_BG
} from './Graph.constants';

const NODE_SIZE = 40;
const INACTIVE_OPACITY_VALUE = 0.3;

const greyColor = '#808080';

export const DEFAULT_MODE: Modes = {
  default: [
    { type: 'drag-node', onlyChangeComboSize: true },
    {
      type: 'drag-combo',
      enableDelegate: true,
      activeState: 'actived',
      onlyChangeComboSize: true,
      shouldUpdate: () => true
    },
    { type: 'drag-canvas' },
    { type: 'zoom-canvas' }
  ]
};

export const DEFAULT_LAYOUT_FORCE_CONFIG: LayoutConfig = {
  type: 'force2',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true,
  clustering: true,
  leafCluster: false,
  nodeClusterBy: 'cluster',
  clusterNodeStrength: 100,
  gravity: 10,
  edgeStrength: 1
};

export const DEFAULT_NODE_ICON = {
  show: true,
  width: 16,
  height: 16
};

export const DEFAULT_NODE_CONFIG: Partial<{
  type: string;
  size: number | number[];
  labelCfg: ILabelConfig;
  color: string;
}> &
  ModelStyle = {
  type: 'circle',
  size: [NODE_SIZE],

  icon: DEFAULT_NODE_ICON,

  style: {
    fill: NODE_COLOR_DEFAULT,
    stroke: NODE_BORDER_COLOR_DEFAULT,
    lineWidth: 1,
    cursor: 'pointer'
  },

  labelCfg: {
    position: 'bottom',
    offset: 8,
    style: {
      fill: NODE_COLOR_DEFAULT_LABEL,
      fontSize: 11,
      background: {
        fill: NODE_COLOR_DEFAULT_LABEL_BG,
        stroke: NODE_BORDER_COLOR_DEFAULT,
        lineWidth: 1,
        padding: [5, 7, 4, 7],
        radius: 2
      }
    }
  }
};

export const DEFAULT_REMOTE_NODE_CONFIG: Partial<{
  type: string;
  size: number | number[];
  color: string;
}> &
  ModelStyle = {
  ...DEFAULT_NODE_CONFIG,
  type: 'circle',
  size: [NODE_SIZE / 2],

  icon: {
    show: false
  },

  style: {
    fill: greyColor,
    stroke: NODE_COLOR_DEFAULT
  }
};

export const DEFAULT_EDGE_CONFIG: Partial<{
  type: string;
  size: number | number[];
  color: string;
}> &
  ModelStyle = {
  type: 'line-dash',
  labelCfg: {
    autoRotate: true,
    refY: 10,
    style: {
      fill: EDGE_COLOR_DEFAULT,
      cursor: 'pointer',
      fontSize: 12
    }
  },
  style: {
    lineWidth: 1,
    lineDash: [0, 0, 0, 0],
    stroke: EDGE_COLOR_DEFAULT,
    endArrow: {
      path: 'M 0,0 L 8,4 L 8,-4 Z',
      fill: EDGE_COLOR_DEFAULT
    }
  }
};

export const DEFAULT_COMBO_CONFIG: Partial<{
  type: string;
  size: number | number[];
  color: string;
}> &
  ModelStyle = {
  type: 'rect',
  padding: [15, 15, 30, 15],
  style: {
    cursor: 'pointer',
    lineWidth: 4,
    fill: COMBO__COLOR_DEFAULT,
    stroke: COMBO_BORDER_COLOR_DEFAULT,
    radius: 30
  },

  labelCfg: {
    refY: 14,
    position: 'bottom',
    style: {
      fill: COMBO_COLOR_DEFAULT_LABEL,
      stoke: 'white',
      fontSize: 16
    }
  }
};

export const DEFAULT_NODE_STATE_CONFIG = {
  hidden: {
    opacity: INACTIVE_OPACITY_VALUE,

    'text-shape': {
      fillOpacity: INACTIVE_OPACITY_VALUE
    },

    'text-bg-shape': {
      opacity: INACTIVE_OPACITY_VALUE
    },

    'circle-icon': {
      opacity: INACTIVE_OPACITY_VALUE
    },

    'diamond-icon': {
      opacity: INACTIVE_OPACITY_VALUE
    }
  }
};

export const DEFAULT_COMBO_STATE_CONFIG = {
  hover: {
    stroke: COMBO_BORDER_COLOR_HOVER
  }
};
