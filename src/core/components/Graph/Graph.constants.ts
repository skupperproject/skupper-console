import { ILabelConfig, LayoutConfig, ModelStyle, Modes, GraphOptions } from '@antv/g6-core';

import { HexColors } from '@config/colors';

const NODE_COLOR_DEFAULT = '#FFFFFF';
const NODE_BORDER_COLOR_DEFAULT = '#6A6E73';
const NODE_COLOR_DEFAULT_LABEL = '#000000';
const NODE_COLOR_DEFAULT_LABEL_BG = '#FFFFFF';
export const EDGE_COLOR_DEFAULT = '#666666';
export const EDGE_COLOR_TEXT_DEFAULT = HexColors.Blue400;
export const EDGE_COLOR_HOVER_DEFAULT = HexColors.Blue400;
const COMBO__COLOR_DEFAULT = 'transparent';
const COMBO_BORDER_COLOR_DEFAULT = '#FFFFFF';
const COMBO_BORDER_COLOR_HOVER = '#000000';
const COMBO_COLOR_DEFAULT_LABEL = '#FFFFFF';
const COMBO_COLOR_DEFAULT_LABEL_BG = '#000000';
export const LEGEND_DEFAULT_BG_COLOR = '#FFFFFF';
export const LEGEND_DEFAULT_STROKE_COLOR = '#000000';

export const CUSTOM_ITEMS_NAMES = {
  animatedDashEdge: 'line-dash',
  siteEdge: 'site-edge',
  nodeWithBadges: 'nCircle',
  comboWithCustomLabel: 'cRect'
};

export const CUSTOM_CIRCLE_NODE_STYLE = {
  containerBg: '#666666',
  containerBorderColor: '#FFFFFF',
  textColor: '#FFFFFF',
  textFontSize: 12
};

export const NODE_SIZE = 44;

const INACTIVE_OPACITY_VALUE = 0.3;
const greyColor = '#808080';

const DEFAULT_MODE: Modes = {
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
  type: CUSTOM_ITEMS_NAMES.nodeWithBadges,
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
        padding: [5, 5],
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

const DEFAULT_EDGE_CONFIG: Partial<{
  type: string;
  size: number | number[];
  color: string;
}> &
  ModelStyle = {
  type: CUSTOM_ITEMS_NAMES.animatedDashEdge,
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

const DEFAULT_COMBO_CONFIG: ModelStyle & {
  labelBgCfg: {
    fill: string;
    radius: number;
    padding: number[];
  };
} = {
  type: CUSTOM_ITEMS_NAMES.comboWithCustomLabel,
  padding: [15, 15, 30, 15],
  style: {
    cursor: 'pointer',
    lineWidth: 4,
    fill: COMBO__COLOR_DEFAULT,
    stroke: COMBO_BORDER_COLOR_DEFAULT,
    radius: 30
  },
  labelCfg: {
    refY: 12,
    position: 'bottom',
    style: {
      fill: COMBO_COLOR_DEFAULT_LABEL,
      fontSize: 12
    }
  },
  labelBgCfg: {
    fill: COMBO_COLOR_DEFAULT_LABEL_BG,
    radius: 2,
    padding: [10, 10]
  }
};

const DEFAULT_NODE_STATE_CONFIG = {
  hover: {
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: 'black',
    shadowBlur: 10,

    [`${CUSTOM_ITEMS_NAMES.nodeWithBadges}-icon`]: {
      cursor: 'pointer'
    },
    'diamond-icon': {
      cursor: 'pointer'
    }
  },
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

    [`${CUSTOM_ITEMS_NAMES.nodeWithBadges}-icon`]: {
      opacity: INACTIVE_OPACITY_VALUE
    },

    [`${CUSTOM_ITEMS_NAMES.nodeWithBadges}-notification-container`]: {
      opacity: INACTIVE_OPACITY_VALUE
    },

    'diamond-icon': {
      opacity: INACTIVE_OPACITY_VALUE
    }
  }
};

const DEFAULT_COMBO_STATE_CONFIG = {
  hover: {
    stroke: COMBO_BORDER_COLOR_HOVER
  }
};

export const DEFAULT_GRAPH_CONFIG: Partial<GraphOptions> = {
  modes: DEFAULT_MODE,
  defaultNode: DEFAULT_NODE_CONFIG,
  defaultCombo: DEFAULT_COMBO_CONFIG,
  defaultEdge: DEFAULT_EDGE_CONFIG,
  nodeStateStyles: DEFAULT_NODE_STATE_CONFIG,
  comboStateStyles: DEFAULT_COMBO_STATE_CONFIG
};
