import { ILabelConfig, LayoutConfig, ModelStyle, Modes } from '@antv/g6-core';

import {
  COMBO_BORDER_COLOR_DEFAULT,
  COMBO_COLOR_DEFAULT_LABEL,
  COMBO__COLOR_DEFAULT,
  EDGE_COLOR_ACTIVE_DEFAULT,
  EDGE_COLOR_DEFAULT,
  NODE_BORDER_COLOR_DEFAULT,
  NODE_COLOR_DEFAULT,
  NODE_COLOR_DEFAULT_LABEL,
  NODE_COLOR_DEFAULT_LABEL_BG
} from './Graph.constants';

const NODE_SIZE = 40;
const INACTIVE_OPACITY_VALUE = 0.5;

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

export const DEFAULT_LAYOUT_COMBO_FORCE_CONFIG: LayoutConfig = {
  type: 'comboForce',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true,
  linkDistance: 50,
  nodeStrength: 30,
  edgeStrength: 0.1
};

export const DEFAULT_LAYOUT_FORCE_CONFIG: LayoutConfig = {
  type: 'force2',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true,
  nodeStrength: 1000,
  edgeStrength: 200
};

export const DEFAULT_LAYOUT_FORCE_WITH_GPU_CONFIG: LayoutConfig = {
  type: 'gForce',
  gpuEnabled: true
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
    refY: -6,
    style: {
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
    radius: 50
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
    stroke: 'black'
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
