import { ILabelConfig, LayoutConfig, ModelStyle, Modes, GraphOptions } from '@antv/g6-core';

import { HexColors } from '@config/colors';

export const GRAPH_BG_COLOR = HexColors.White;
const NODE_COLOR_DEFAULT = HexColors.White;
const NODE_BORDER_COLOR_DEFAULT = HexColors.Black300;
const NODE_COLOR_DEFAULT_LABEL = HexColors.Black900;
const NODE_COLOR_DEFAULT_LABEL_BG = HexColors.White;
export const EDGE_COLOR_DEFAULT = HexColors.Black600;
export const EDGE_COLOR_ENDPOINT_SITE_CONNECTION_DEFAULT = HexColors.Blue400;
export const EDGE_COLOR_HOVER_DEFAULT = HexColors.Blue400;
export const EDGE_COLOR_DEFAULT_SITE_TEXT = HexColors.Black900;
export const EDGE_COLOR_DEFAULT_TEXT = HexColors.White;
export const EDGE_COLOR_DEFAULT_BG_TEXT = HexColors.Black500;

const COMBO__COLOR_DEFAULT = HexColors.Black100;
const COMBO_BORDER_COLOR_DEFAULT = HexColors.White;
const COMBO_BORDER_COLOR_HOVER = HexColors.Black900;
const COMBO_COLOR_DEFAULT_LABEL = HexColors.White;
const COMBO_COLOR_DEFAULT_LABEL_BG = HexColors.Black900;

export enum TopologyModeNames {
  Default = 'default',
  Performance = 'performance'
}

export const NODE_SIZE = 36;
const ICON_SIZE = 15;
const LABEL_FONT_SIZE = 8;
// number of nodes to start showing less topology details for events like zooming in/out and dragging
export const NODE_COUNT_PERFORMANCE_THRESHOLD = 150;

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
  textFontSize: LABEL_FONT_SIZE - 1
};

const INACTIVE_OPACITY_VALUE = 0.3;

const DEFAULT_MODE: Modes = {
  [TopologyModeNames.Default]: [
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
  ],
  [TopologyModeNames.Performance]: [
    { type: 'drag-node', onlyChangeComboSize: true, enableOptimize: true },
    {
      type: 'drag-combo',
      enableDelegate: true,
      activeState: 'actived',
      onlyChangeComboSize: true,
      shouldUpdate: () => true,
      enableOptimize: true
    },
    { type: 'drag-canvas', enableOptimize: true },
    { type: 'zoom-canvas', enableOptimize: true, optimizeZoom: 0.1 }
  ]
};

export const LAYOUT_TOPOLOGY_DEFAULT: LayoutConfig = {
  type: 'force2',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true,
  clustering: true,
  nodeClusterBy: 'cluster',
  distanceThresholdMode: 'max',
  clusterNodeStrength: 500000,
  nodeStrength: 5000,
  leafCluster: true,
  gravity: 10000,
  maxSpeed: 1000,
  animate: false,
  factor: 800
};

export const LAYOUT_TOPOLOGY_SINGLE_NODE = {
  type: 'dagre',
  rankdir: 'BT'
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
    lineWidth: 0.8,
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
        lineWidth: 0.5,
        padding: [3, 4],
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

// EDGE
export const DEFAUT_EDGE_BG_NO_LABEL = {
  fill: EDGE_COLOR_DEFAULT_BG_TEXT,
  padding: [0, 0, 0, 0],
  radius: 0
};

export const DEFAUT_EDGE_BG_LABEL = {
  ...DEFAUT_EDGE_BG_NO_LABEL,
  padding: [3, 4, 2, 4],
  radius: 2
};

export const DEFAULT_EDGE_CONFIG: Partial<{
  type: string;
  size: number | number[];
  color: string;
  labelCfg: ILabelConfig;
}> &
  ModelStyle = {
  type: CUSTOM_ITEMS_NAMES.animatedDashEdge,
  labelCfg: {
    autoRotate: true,
    style: {
      fill: EDGE_COLOR_DEFAULT_TEXT,
      fontSize: LABEL_FONT_SIZE,
      background: DEFAUT_EDGE_BG_NO_LABEL
    }
  },
  style: {
    opacity: 1,
    lineWidth: 0.5,
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
    padding: [12, 10]
  }
};

const DEFAULT_NODE_STATE_CONFIG = {
  hover: {
    stroke: HexColors.Blue400,
    strokeWidth: 1,

    [`${CUSTOM_ITEMS_NAMES.nodeWithBadges}-icon`]: {
      cursor: 'pointer'
    },
    'diamond-icon': {
      cursor: 'pointer'
    }
  },

  'selected-default': {
    stroke: HexColors.Blue400,
    strokeWidth: 1,

    'text-shape': {
      fill: HexColors.White
    },

    'text-bg-shape': {
      fill: HexColors.Blue400,
      stroke: HexColors.Blue400
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
  comboStateStyles: DEFAULT_COMBO_STATE_CONFIG,
  fitView: true,
  fitViewPadding: 20
};
