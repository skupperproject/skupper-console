import { LayoutConfig, ModelStyle } from '@antv/g6-core';

import {
  COMBO_COLOR_DEFAULT,
  EDGE_COLOR_ACTIVE_DEFAULT,
  EDGE_COLOR_DEFAULT,
  NODE_COLOR_DEFAULT,
  NODE_COLOR_HOVER_DEFAULT,
  NODE_COLOR_HOVER_EDGE_DEFAULT
} from './Graph.constants';

const NODE_SIZE = 40;
const greyColor = '#808080';

export const DEFAULT_MODE = {
  default: [
    { type: 'drag-node', onlyChangeComboSize: true, optimize: true },
    {
      type: 'drag-combo',
      enableDelegate: true,
      activeState: 'actived',
      onlyChangeComboSize: true,
      shouldUpdate: () => true,
      optimize: true
    },
    { type: 'drag-canvas', optimize: true },
    { type: 'zoom-canvas', optimize: true }
  ]
};

export const DEFAULT_LAYOUT_COMBO_FORCE_CONFIG: LayoutConfig = {
  type: 'comboForce',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true,
  comboCollideStrength: 1,
  comboSpacing: 10,
  linkDistance: 150
};

export const DEFAULT_LAYOUT_FORCE_CONFIG: LayoutConfig = {
  type: 'force2',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true,
  linkDistance: 150
};

export const DEFAULT_LAYOUT_FORCE_WITH_GPU_CONFIG: LayoutConfig = {
  type: 'gForce',
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
      fontSize: 12,
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
  },
  hidden: {
    opacity: 0,
    fill: 'transparent'
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
