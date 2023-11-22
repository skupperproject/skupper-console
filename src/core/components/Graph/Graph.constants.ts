import { ILabelConfig, LayoutConfig, ModelStyle, Modes, GraphOptions } from '@antv/g6-core';

import { HexColors } from '@config/colors';

export const GRAPH_BG_COLOR = HexColors.White;
const NODE_COLOR_DEFAULT = HexColors.White;
const NODE_BORDER_COLOR_DEFAULT = HexColors.Black600;
const NODE_COLOR_DEFAULT_LABEL = HexColors.Black900;
const NODE_COLOR_DEFAULT_LABEL_BG = HexColors.White;
export const EDGE_COLOR_DEFAULT = HexColors.Black600;
export const EDGE_COLOR_ENDPOINT_SITE_CONNECTION_DEFAULT = HexColors.Blue400;
export const EDGE_COLOR_HOVER_DEFAULT = HexColors.Blue400;
const EDGE_COLOR_DEFAULT_TEXT = HexColors.Black900;
const COMBO__COLOR_DEFAULT = HexColors.Black100;
const COMBO_BORDER_COLOR_DEFAULT = HexColors.White;
const COMBO_BORDER_COLOR_HOVER = HexColors.Black900;
const COMBO_COLOR_DEFAULT_LABEL = HexColors.White;
const COMBO_COLOR_DEFAULT_LABEL_BG = HexColors.Black900;

export const NODE_SIZE = 25;
const ICON_SIZE = 10;
const LABEL_FONT_SIZE = 8;

export const CUSTOM_ITEMS_NAMES = {
  animatedDashEdge: 'line-dash',
  siteEdge: 'site-edge',
  loopEdge: 'loop',
  nodeWithBadges: 'nCircle',
  comboWithCustomLabel: 'cRect'
};

export const BADGE_STYLE = {
  containerBg: HexColors.Black500,
  containerBorderColor: HexColors.White,
  textColor: HexColors.White,
  textFontSize: LABEL_FONT_SIZE - 4
};

const INACTIVE_OPACITY_VALUE = 0.3;

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
  edgeStrength: 1,
  animate: false,
  maxIteration: 200,
  linkDistance: 100
};

export const DEFAULT_NODE_ICON = {
  show: true,
  width: ICON_SIZE,
  height: ICON_SIZE
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
      fontSize: LABEL_FONT_SIZE,
      background: {
        fill: NODE_COLOR_DEFAULT_LABEL_BG,
        stroke: NODE_BORDER_COLOR_DEFAULT,
        lineWidth: 1,
        padding: [2, 3],
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
    fill: NODE_BORDER_COLOR_DEFAULT,
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
    style: {
      fill: EDGE_COLOR_DEFAULT_TEXT,
      stroke: GRAPH_BG_COLOR,
      lineWidth: 5,
      fontSize: LABEL_FONT_SIZE
    }
  },
  style: {
    lineWidth: 1,
    lineDash: [0, 0, 0, 0],
    lineAppendWidth: 20,
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
    radius: 10
  },
  labelCfg: {
    refY: 12,
    position: 'bottom',
    style: {
      fill: COMBO_COLOR_DEFAULT_LABEL,
      fontSize: LABEL_FONT_SIZE + 2
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
