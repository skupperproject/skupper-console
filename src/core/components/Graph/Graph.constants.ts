import {
  ComboOptions,
  GraphOptions,
  IPointerEvent,
  NodeOptions,
  EdgeOptions,
  ForceLayoutOptions,
  AntVDagreLayoutOptions,
  LayoutOptions
} from '@antv/g6';

import { HexColors } from '@config/colors';

export const GRAPH_BG_COLOR = HexColors.White;
const NODE_BACKGROUND_COLOR = HexColors.White;
const NODE_BORDER_COLOR = HexColors.DefaultBorder;
const NODE_LABEL_TEXT_COLOR = HexColors.Black900;
const NODE_LABEL_BACKGROUND_COLOR = HexColors.White;
const NODE_SELECT_BORDER = HexColors.Blue400;
const NODE_HIGHLIGHT_BORDER = HexColors.Orange200;
const NODE_BACKGROUND_COLOR_DARK = HexColors.DarkThemeBackground;
const NODE_LABEL_TEXT_COLOR_DARK = HexColors.DarkThemeText;

const EDGE_LINE_COLOR = HexColors.DefaultEdge;
const EDGE_TERMINAL_COLOR = HexColors.DefaultEdge;
const EDGE_TERMINAL_COLOR_2 = HexColors.Blue400;
const EDGE_BORDER_COLOR = HexColors.DefaultBorder;
const EDGE_LABEL_TEXT_COLOR = HexColors.Black900;
const EDGE_LABEL_BACKGROUND_COLOR = HexColors.White;
const EDGE_SELECT_LINE = HexColors.Blue400;

const COMBO__BG_COLOR_DEFAULT = HexColors.DefaultBackground;
const COMBO_BORDER_COLOR_DEFAULT = HexColors.DefaultBorder;
const COMBO_BORDER_COLOR_HOVER = HexColors.Blue400;
const COMBO_COLOR_DEFAULT_LABEL = HexColors.DarkThemeText;
const COMBO_COLOR_DEFAULT_LABEL_BG = HexColors.DarkThemeBackground;

export const GRAPH_CONTAINER_ID = 'container';
const NODE_SIZE = 50;
const ICON_SIZE = NODE_SIZE / 2;
const LABEL_FONT_SIZE = 9;
const INACTIVE_OPACITY_VALUE = 0.35;
const LABEL_PADDING = [0, 4];
const LABEL_EDGE_PADDING = [1, 4];
const LABEL_EDGE_BADGE_PADDING = [2, 6];

export enum GraphStates {
  Select = 'activeElement',
  Highlight = 'highlightElement',
  Exclude = 'excludeElement'
}

// Nodes
export const NODE_CONFIG: NodeOptions = {
  style: {
    opacity: 1,
    size: NODE_SIZE,
    fill: NODE_BACKGROUND_COLOR,
    stroke: NODE_BORDER_COLOR,
    lineWidth: 1,
    labelOffsetY: 4,
    labelFill: NODE_LABEL_TEXT_COLOR,
    labelFontSize: LABEL_FONT_SIZE,
    labelFontFamily: 'RedHatText',
    labelBackground: true,
    labelBackgroundFill: NODE_LABEL_BACKGROUND_COLOR,
    labelBackgroundStroke: NODE_BORDER_COLOR,
    labelBackgroundLineWidth: 1,
    labelBackgroundRadius: 2,
    labelBackgroundOpacity: 1,
    labelPadding: LABEL_PADDING,
    icon: true,
    iconWidth: ICON_SIZE,
    iconHeight: ICON_SIZE,
    badgeFontSize: LABEL_FONT_SIZE,
    badgeDx: -NODE_SIZE / 6,
    badgeFill: NODE_LABEL_TEXT_COLOR_DARK,
    badgeBackgroundFill: NODE_BACKGROUND_COLOR_DARK,
    badgeBackgroundStroke: NODE_BACKGROUND_COLOR_DARK,
    badgeBackgroundLineWidth: 1,
    badgeBackgroundHeight: LABEL_FONT_SIZE * 2,
    badgeBackgroundWidth: LABEL_FONT_SIZE * 2,
    badgeFontWeight: 'bold',
    shadowColor: NODE_BORDER_COLOR,
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    labelBackgroundShadowColor: NODE_BORDER_COLOR,
    labelBackgroundShadowBlur: 0,
    labelBackgroundShadowOffsetX: 0,
    labelBackgroundShadowOffsetY: 4
  },

  state: {
    hover: {
      cursor: 'pointer',
      shadowBlur: 8,
      labelBackgroundShadowBlur: 8,
      opacity: 1
    },

    visible: {
      opacity: 1
    },

    [GraphStates.Select]: {
      cursor: 'pointer',
      lineWidth: 2,
      stroke: NODE_SELECT_BORDER,
      labelFill: NODE_BACKGROUND_COLOR,
      labelBackgroundFill: NODE_SELECT_BORDER,
      labelBackgroundStroke: NODE_SELECT_BORDER
    },

    [GraphStates.Highlight]: {
      stroke: NODE_HIGHLIGHT_BORDER,
      lineWidth: 2
    },

    hidden: {
      opacity: INACTIVE_OPACITY_VALUE
    },

    [GraphStates.Exclude]: {
      opacity: INACTIVE_OPACITY_VALUE
    }
  }
};

export const REMOTE_NODE_CONFIG: NodeOptions = {
  style: {
    opacity: 1,
    fill: NODE_BORDER_COLOR,
    stroke: NODE_BACKGROUND_COLOR,
    size: NODE_SIZE / 2,
    icon: false,
    badge: false,
    halo: true
  },

  state: NODE_CONFIG.state
};

// EDGE
export const DATA_EDGE_CONFIG: EdgeOptions = {
  style: {
    visibility: 'visible',
    opacity: 1,
    haloOpacity: 0.15,
    haloStroke: EDGE_LINE_COLOR,
    lineWidth: 0.5,
    increasedLineWidthForHitTesting: 20,
    stroke: EDGE_LINE_COLOR,
    endArrow: true,
    endArrowSize: 12,
    endArrowFill: EDGE_TERMINAL_COLOR,
    labelFontFamily: 'RedHatText',
    labelBackground: true,
    labelFontSize: LABEL_FONT_SIZE,
    labelFill: EDGE_LABEL_TEXT_COLOR,
    labelBackgroundFill: EDGE_LABEL_BACKGROUND_COLOR,
    labelBackgroundStroke: EDGE_BORDER_COLOR,
    labelBackgroundLineWidth: 1,
    labelBackgroundRadius: 2,
    labelBackgroundOpacity: 1,
    labelBackgroundFillOpacity: 1,
    labelPlacement: 'center',
    labelPadding: LABEL_EDGE_PADDING,
    labelAutoRotate: false,
    badgeFontSize: LABEL_FONT_SIZE,
    badgePadding: LABEL_EDGE_BADGE_PADDING,
    badgeBackgroundFill: EDGE_LABEL_BACKGROUND_COLOR,
    badgeFill: EDGE_LABEL_TEXT_COLOR,
    badgeBackgroundStroke: EDGE_BORDER_COLOR,
    badgeBackgroundLineWidth: 1
  },

  state: {
    hidden: {
      visibility: 'hidden'
    },

    [GraphStates.Exclude]: {
      opacity: INACTIVE_OPACITY_VALUE
    },

    [GraphStates.Select]: {
      cursor: 'pointer',
      lineWidth: 2,
      opacity: 1,
      stroke: EDGE_SELECT_LINE
    },

    visible: {
      opacity: 1
    },

    'hover-edge': {
      cursor: 'pointer',
      lineWidth: 2,
      haloOpacity: 0.35,
      zIndex: 2
    }
  }
};

export const SITE_EDGE_CONFIG: EdgeOptions = {
  style: {
    ...DATA_EDGE_CONFIG.style,
    endArrowOffset: 0.5,
    lineDash: [4, 4],
    endArrowFill: EDGE_TERMINAL_COLOR_2,
    endArrowType: 'circle'
  },

  state: DATA_EDGE_CONFIG.state
};

export const COMBO_CONFIG: ComboOptions = {
  style: {
    fillOpacity: 1,
    lineWidth: 3,
    fill: COMBO__BG_COLOR_DEFAULT,
    stroke: COMBO_BORDER_COLOR_DEFAULT,
    radius: 10,
    cursor: 'auto',
    labelFill: COMBO_COLOR_DEFAULT_LABEL,
    labelFontFamily: 'RedHatText',
    labelPadding: [2, 5],
    labelFontSize: LABEL_FONT_SIZE + 2,
    labelPosition: 'bottom',
    labelBackground: true,
    labelOffsetY: 15,
    labelBackgroundRadius: 2,
    labelBackgroundFill: COMBO_COLOR_DEFAULT_LABEL_BG,
    labelBackgroundOpacity: 1
  },

  state: {
    hover: {
      stroke: COMBO_BORDER_COLOR_HOVER
    }
  }
};

const CLICK_SELECT_BEHAVIOR = {
  key: 'click-select',
  type: 'click-select',
  degree: 1,
  state: GraphStates.Select,
  neighborState: 'hover',
  unselectedState: '',
  enable: ({ targetType }: IPointerEvent) => targetType === 'node' || targetType === 'edge'
};

const HOVER_ACTIVATE_BEHAVIOR = {
  HOVER_DEGREE_0_NODE: {
    // state for the node/edge with state hover
    key: 'hover-activate-single-node',
    type: 'hover-activate',
    degree: 0,
    state: 'hover',
    enable: ({ targetType }: IPointerEvent) => targetType === 'node'
  },

  HOVER_DEGREE_1_NODE: {
    // state for the rest of the nodes
    key: 'hover-activate',
    type: 'hover-activate',
    degree: 1,
    state: 'visible',
    inactiveState: 'hidden',
    enable: ({ targetType }: IPointerEvent) => targetType === 'node'
  },

  HOVER_DEGREE_0_EDGE: {
    // state for the node/edge with state hover
    key: 'hover-activate-single-edge',
    type: 'hover-activate',
    degree: 0,
    state: 'hover-edge',
    enable: ({ targetType }: IPointerEvent) => targetType === 'edge'
  }
};

export const DEFAULT_GRAPH_CONFIG: GraphOptions = {
  behaviors: [
    'drag-canvas',
    'zoom-canvas',
    'drag-element',
    CLICK_SELECT_BEHAVIOR,
    HOVER_ACTIVATE_BEHAVIOR.HOVER_DEGREE_0_NODE,
    HOVER_ACTIVATE_BEHAVIOR.HOVER_DEGREE_0_EDGE,
    HOVER_ACTIVATE_BEHAVIOR.HOVER_DEGREE_1_NODE
  ],
  node: { ...NODE_CONFIG },
  edge: { ...DATA_EDGE_CONFIG },
  combo: { ...COMBO_CONFIG },
  autoResize: false,
  animation: false,
  padding: 15
};

// LAYOUTS
const LAYOUT_TOPOLOGY_DEFAULT: ForceLayoutOptions & { type: 'force' } = {
  type: 'force',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true,
  linkDistance: 250,
  factor: 4
};

const LAYOUT_TOPOLOGY_COMBO: ForceLayoutOptions & { type: 'force' } = {
  type: 'force',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true,
  clustering: true,
  nodeClusterBy: 'cluster',
  distanceThresholdMode: 'max',
  clusterNodeStrength: 300000,
  nodeStrength: 8000,
  leafCluster: true,
  factor: 1000
};

const LAYOUT_TOPOLOGY_SINGLE_NODE: AntVDagreLayoutOptions & { type: 'antv-dagre' } = {
  type: 'antv-dagre',
  rankdir: 'BT',
  sortByCombo: true
};

export const LAYOUT_MAP: Record<string, LayoutOptions> = {
  default: LAYOUT_TOPOLOGY_DEFAULT,
  combo: LAYOUT_TOPOLOGY_COMBO,
  neighbour: LAYOUT_TOPOLOGY_SINGLE_NODE
};
