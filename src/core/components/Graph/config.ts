import { LayoutConfig, ModelStyle } from '@antv/g6-core';

import {
  COMBO_COLOR_DEFAULT,
  EDGE_COLOR_ACTIVE_DEFAULT,
  EDGE_COLOR_DEFAULT,
  NODE_COLOR_DEFAULT,
  NODE_COLOR_HOVER_DEFAULT,
  NODE_COLOR_HOVER_EDGE_DEFAULT
} from './Graph.constants';

const NODE_SIZE = 50;
const greyColor = '#808080';

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
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE / 3,
  comboSpacing: 0,
  linkDistance: 300,
  nodeStrength: 10,
  edgeStrength: 1,
  collideStrength: 0.3,
  preventOverlap: true,
  preventComboOverlap: true,
  comboCollideStrength: 1
};

export const DEFAULT_LAYOUT_FORCE_CONFIG: LayoutConfig = {
  type: 'force',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE / 3,
  linkDistance: 300,
  nodeStrength: 60,
  edgeStrength: 1,
  collideStrength: 1,
  preventOverlap: true,
  alphaMin: 0.07,
  alpha: 0.1
};

export const DEFAULT_LAYOUT_GFORCE_CONFIG: LayoutConfig = {
  type: 'gForce',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE / 3,
  linkDistance: 200,
  nodeStrength: 500,
  edgeStrength: 200,
  collideStrength: 1,
  preventOverlap: true,
  gpuEnabled: true
};

export const DEFAULT_NODE_CONFIG: ModelStyle = {
  type: 'circle',
  size: [NODE_SIZE],

  style: {
    fillOpacity: 0.4,
    stroke: NODE_COLOR_DEFAULT,
    lineWidth: 1
  },
  labelCfg: {
    position: 'bottom',
    offset: 15,
    style: {
      fill: NODE_COLOR_DEFAULT,
      cursor: 'pointer',
      fontSize: 14,
      background: {
        fill: '#FFFFFF',
        fillOpacity: 0.9,
        stroke: NODE_COLOR_DEFAULT,
        lineWidth: 1,
        padding: [5, 8, 5, 8],
        radius: 2
      }
    }
  }
};

export const DEFAULT_REMOTE_NODE_CONFIG: ModelStyle = {
  ...DEFAULT_NODE_CONFIG,
  type: 'circle',
  size: [NODE_SIZE / 2],

  style: {
    fill: greyColor,
    stroke: NODE_COLOR_DEFAULT
  },

  icon: {
    show: false
  }
};

export const DEFAULT_EDGE_CONFIG = {
  type: 'line-dash',
  labelCfg: {
    autoRotate: true,
    refY: -6,
    style: {
      cursor: 'pointer',
      color: NODE_COLOR_DEFAULT,
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
    fillOpacity: 0.02,
    shadowBlur: 10,
    radius: 8
  },

  labelCfg: {
    refY: -24,
    offset: 15,
    position: 'top-center',
    style: {
      fill: COMBO_COLOR_DEFAULT,
      stroke: COMBO_COLOR_DEFAULT,
      fontSize: 16
    }
  }
};

export const legendTypeConfigs = {
  type1: {
    type: 'diamond',
    size: 12,
    style: {
      fillOpacity: 0.4,
      fill: greyColor
    }
  },
  type2: {
    type: 'circle',
    size: 20,
    style: {
      fillOpacity: 0.4,
      fill: greyColor
    }
  },
  type3: {
    type: 'rect',
    size: [20, 20],
    style: {
      fillOpacity: 0.4,
      fill: greyColor
    }
  },
  type4: {
    type: 'circle',
    size: [10],
    style: {
      fillOpacity: 0.4,
      fill: greyColor
    }
  },
  eType1: {
    type: 'line',
    style: {
      width: 25,
      stroke: EDGE_COLOR_DEFAULT
    }
  },
  eType2: {
    type: 'line',
    style: {
      width: 25,
      stroke: EDGE_COLOR_ACTIVE_DEFAULT
    }
  }
};
