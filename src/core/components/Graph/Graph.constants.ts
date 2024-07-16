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
const NODE_COLOR_DEFAULT = HexColors.White;
const NODE_BORDER_COLOR_DEFAULT = HexColors.Black300;
const NODE_COLOR_DEFAULT_LABEL = HexColors.Black900;
const NODE_COLOR_DEFAULT_LABEL_BG = HexColors.White;

const EDGE_COLOR_DEFAULT = HexColors.Black600;
const EDGE_COLOR_ENDPOINT_SITE_CONNECTION_DEFAULT = HexColors.Blue400;
const EDGE_COLOR_DEFAULT_TEXT = HexColors.White;
const EDGE_COLOR_DEFAULT_BG_TEXT = HexColors.Black600;

const COMBO__BG_COLOR_DEFAULT = HexColors.Black100;
const COMBO_BORDER_COLOR_DEFAULT = HexColors.Black400;
const COMBO_BORDER_COLOR_HOVER = HexColors.Blue400;
const COMBO_COLOR_DEFAULT_LABEL = HexColors.White;
const COMBO_COLOR_DEFAULT_LABEL_BG = HexColors.Black900;

export const GRAPH_CONTAINER_ID = 'container';
const NODE_SIZE = 52;
const ICON_SIZE = NODE_SIZE / 2;
const LABEL_FONT_SIZE = 10;
const INACTIVE_OPACITY_VALUE = 0.3;
const LABEL_PADDING = [0, 4];

export enum GraphStates {
  Highlight = 'highlightElement',
  Exclude = 'excludeElement'
}

// Nodes
export const NODE_CONFIG: NodeOptions = {
  style: {
    opacity: 1,
    size: NODE_SIZE,
    fill: NODE_COLOR_DEFAULT,
    stroke: NODE_BORDER_COLOR_DEFAULT,
    lineWidth: 1,
    labelOffsetY: 4,
    labelFill: NODE_COLOR_DEFAULT_LABEL,
    labelFontSize: LABEL_FONT_SIZE,
    labelFontFamily: 'RedHatText',
    labelBackground: true,
    labelBackgroundFill: NODE_COLOR_DEFAULT_LABEL_BG,
    labelBackgroundStroke: NODE_BORDER_COLOR_DEFAULT,
    labelBackgroundLineWidth: 1,
    labelBackgroundRadius: 2,
    labelBackgroundOpacity: 1,
    labelPadding: LABEL_PADDING,
    icon: true,
    iconWidth: ICON_SIZE,
    iconHeight: ICON_SIZE,
    badgeFontSize: LABEL_FONT_SIZE,
    badgeBackgroundHeight: LABEL_FONT_SIZE * 2,
    badgeBackgroundWidth: LABEL_FONT_SIZE * 2,
    shadowColor: HexColors.Black400,
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    labelBackgroundShadowColor: HexColors.Black400,
    labelBackgroundShadowBlur: 0,
    labelBackgroundShadowOffsetX: 0,
    labelBackgroundShadowOffsetY: 4
  },

  state: {
    hover: {
      cursor: 'pointer',
      shadowBlur: 8,
      labelBackgroundShadowBlur: 8
    },

    activeElement: {
      cursor: 'pointer',
      stroke: HexColors.Blue400,
      labelFill: HexColors.White,
      labelBackgroundFill: HexColors.Blue400,
      labelBackgroundStroke: HexColors.Blue400,
      lineWidth: 2
    },

    [GraphStates.Highlight]: {
      stroke: 'orange',
      lineWidth: 2
    },

    hidden: {
      opacity: INACTIVE_OPACITY_VALUE
    },

    [GraphStates.Exclude]: {
      opacity: 0.5
    }
  }
};

export const REMOTE_NODE_CONFIG: NodeOptions = {
  style: {
    opacity: 1,
    fill: NODE_BORDER_COLOR_DEFAULT,
    stroke: NODE_COLOR_DEFAULT,
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
    halo: false,
    opacity: 1,
    haloOpacity: 0.1,
    lineWidth: 0.5,
    increasedLineWidthForHitTesting: 20,
    stroke: EDGE_COLOR_DEFAULT,
    endArrow: true,
    endArrowSize: 12,
    labelFontFamily: 'RedHatText',
    labelBackground: true,
    labelFill: EDGE_COLOR_DEFAULT_TEXT,
    labelFontSize: LABEL_FONT_SIZE,
    labelBackgroundFill: EDGE_COLOR_DEFAULT_BG_TEXT,
    labelBackgroundRadius: 2,
    labelBackgroundOpacity: 1,
    labelBackgroundFillOpacity: 1,
    labelPadding: LABEL_PADDING,
    labelAutoRotate: false
  },

  state: {
    hidden: {
      visibility: 'hidden'
    },

    active: {
      opacity: 1
    },

    [GraphStates.Exclude]: {
      opacity: 0.5
    },

    activeElement: {
      halo: true
    },

    hover: {
      //halo: true,
      cursor: 'pointer'
    }
  }
};

export const SITE_EDGE_CONFIG: EdgeOptions = {
  style: {
    ...DATA_EDGE_CONFIG.style,
    endArrowOffset: 0.5,
    lineDash: [4, 4],
    endArrowFill: EDGE_COLOR_ENDPOINT_SITE_CONNECTION_DEFAULT,
    endArrowType: 'circle'
  },

  state: DATA_EDGE_CONFIG.state
};

export const COMBO_CONFIG: ComboOptions = {
  style: {
    fillOpacity: 1,
    lineWidth: 4,
    fill: COMBO__BG_COLOR_DEFAULT,
    stroke: COMBO_BORDER_COLOR_DEFAULT,
    radius: 10,
    cursor: 'auto',
    labelFill: COMBO_COLOR_DEFAULT_LABEL,
    labelFontFamily: 'RedHatText',
    labelPadding: [2, 5],
    labelFontSize: LABEL_FONT_SIZE + 4,
    labelPosition: 'bottom',
    labelBackground: true,
    labelOffsetY: 15,
    labelBackgroundRadius: 2,
    labelBackgroundFill: COMBO_COLOR_DEFAULT_LABEL_BG,
    labelBackgroundStroke: COMBO_BORDER_COLOR_DEFAULT
  },

  state: {
    hover: {
      stroke: COMBO_BORDER_COLOR_HOVER
    }
  }
};

export const DEFAULT_GRAPH_CONFIG: GraphOptions = {
  behaviors: [
    'drag-canvas',
    'zoom-canvas',
    'drag-element',
    {
      key: 'click-select',
      type: 'click-select',
      degree: 1,
      state: 'activeElement',
      neighborState: 'hover',
      unselectedState: '',
      enable: ({ targetType }: IPointerEvent) => targetType === 'node' || targetType === 'edge'
    },
    {
      // state for the node with state hover
      key: 'hover-activate-single',
      type: 'hover-activate',
      degree: 0,
      state: 'hover',
      enable: ({ targetType }: IPointerEvent) => targetType === 'node'
    },
    {
      // state for the rest of the nodes
      key: 'hover-activate',
      type: 'hover-activate',
      degree: 1,
      state: 'active',
      inactiveState: 'hidden',
      enable: ({ targetType }: IPointerEvent) => targetType === 'node' || targetType === 'edge'
    },
    {
      key: 'hover-activate-combo',
      type: 'hover-activate',
      state: 'hover',
      enable: ({ targetType }: IPointerEvent) => targetType === 'combo'
    }
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
  preventOverlap: true,
  clustering: true,
  nodeClusterBy: 'cluster',
  clusterNodeStrength: 150,
  linkDistance: 600,
  factor: 15,
  gravity: 80
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
