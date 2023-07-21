import { ILabelConfig, LayoutConfig, ModelStyle } from '@antv/g6-core';

import {
  COMBO_COLOR_DEFAULT_LABEL,
  EDGE_COLOR_ACTIVE_DEFAULT,
  EDGE_COLOR_DEFAULT,
  NODE_COLOR_DEFAULT,
  NODE_COLOR_DEFAULT_LABEL,
  NODE_COLOR_DEFAULT_LABEL_BG,
  NODE_COLOR_HOVER_DEFAULT,
  NODE_COLOR_HOVER_EDGE_DEFAULT
} from './Graph.constants';

const NODE_SIZE = 35;
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

export const DEFAULT_NODE_ICON = {
  show: true,
  width: 14,
  height: 14
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
    fillOpacity: 0.1,
    fill: NODE_COLOR_DEFAULT,
    stroke: NODE_COLOR_DEFAULT,
    lineWidth: 1
  },

  labelCfg: {
    position: 'bottom',
    offset: 8,
    style: {
      fill: NODE_COLOR_DEFAULT_LABEL,
      fontSize: 11,
      fillOpacity: 0.9,
      background: {
        fill: NODE_COLOR_DEFAULT_LABEL_BG,
        stroke: NODE_COLOR_DEFAULT_LABEL,
        lineWidth: 1,
        padding: [4, 5, 4, 5],
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

export const DEFAULT_EDGE_CONFIG = {
  type: 'line-dash',
  labelCfg: {
    autoRotate: true,
    refY: -6,
    style: {
      cursor: 'pointer',
      color: NODE_COLOR_DEFAULT_LABEL,
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
    lineWidth: 0.7,
    fillOpacity: 0.015,
    shadowBlur: 6,
    radius: 3
  },

  labelCfg: {
    refY: -24,
    offset: 15,
    position: 'top-center',
    style: {
      fill: COMBO_COLOR_DEFAULT_LABEL,
      stroke: COMBO_COLOR_DEFAULT_LABEL,
      fontSize: 14
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
