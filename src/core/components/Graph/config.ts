import { LayoutConfig } from '@antv/g6-core';

import {
  COMBO_COLOR_DEFAULT,
  EDGE_COLOR_DEFAULT,
  NODE_COLOR_DEFAULT,
  NODE_COLOR_HOVER_DEFAULT,
  NODE_COLOR_HOVER_EDGE_DEFAULT
} from './Graph.constants';

const NODE_SIZE = 50;

export const DEFAULT_MODE = {
  default: [
    { type: 'drag-node', onlyChangeComboSize: true },
    {
      type: 'drag-combo',
      enableDelegate: true,
      activeState: 'actived',
      onlyChangeComboSize: true,
      shouldUpdate: () => true
    },
    'zoom-canvas',
    'drag-canvas'
  ]
};

export const DEFAULT_LAYOUT_COMBO_FORCE_CONFIG: LayoutConfig = {
  type: 'comboForce',
  nodeSize: 30,
  nodeSpacing: 30,
  comboSpacing: 50,
  linkDistance: 150,
  nodeStrength: -100,
  edgeStrength: 1,
  collideStrength: 1,
  preventOverlap: true,
  preventComboOverlap: true,
  comboCollideStrength: 1
};

export const DEFAULT_LAYOUT_FORCE_CONFIG: LayoutConfig = {
  type: 'force',
  linkDistance: 250,
  nodeStrength: -200,
  edgeStrength: 0.7,
  collideStrength: 1,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true,
  alphaMin: 0.08,
  alpha: 0.1
};

export const DEFAULT_LAYOUT_GFORCE_CONFIG: LayoutConfig = {
  type: 'gForce',
  linkDistance: 200,
  nodeStrength: 500,
  edgeStrength: 200,
  collideStrength: 1,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true,
  gpuEnabled: true
};

export const DEFAULT_NODE_CONFIG = {
  type: 'circle',
  size: [NODE_SIZE],

  style: {
    fillOpacity: 0.55,
    stroke: NODE_COLOR_DEFAULT,
    lineWidth: 2
  },
  labelCfg: {
    position: 'bottom',
    offset: 15,
    style: {
      fill: NODE_COLOR_DEFAULT,
      fontSize: 10,
      background: {
        fill: '#FFFFFF',
        stroke: NODE_COLOR_DEFAULT,
        lineWidth: 1,
        padding: [5, 8, 5, 8],
        radius: 2
      }
    }
  }
};

export const DEFAULT_EDGE_CONFIG = {
  type: 'line-dash',
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

export const DEFAULT_NODE_STATE_CONFIG = {
  hover: {
    fill: NODE_COLOR_HOVER_DEFAULT,
    stroke: NODE_COLOR_HOVER_EDGE_DEFAULT,
    shadowBlur: 10,
    shadowColor: NODE_COLOR_HOVER_EDGE_DEFAULT,
    cursor: 'pointer'
  }
};

export const DEFAULT_COMBO_CONFIG = {
  type: 'rect',

  style: {
    cursor: 'pointer',
    lineWidth: 2,
    fillOpacity: 0.1,
    shadowBlur: 10,
    radius: 8
  },

  labelCfg: {
    refY: -32,
    offset: 15,
    position: 'top',
    style: {
      fill: COMBO_COLOR_DEFAULT,
      fontSize: 28
    }
  }
};
