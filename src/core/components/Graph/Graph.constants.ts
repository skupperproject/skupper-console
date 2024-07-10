import {
  ComboOptions,
  GraphOptions,
  IPointerEvent,
  NodeOptions,
  EdgeOptions,
  ForceAtlas2Layout,
  GridLayout
} from '@antv/g6';
import { BaseLayoutOptions } from '@antv/g6/lib/layouts/types';

import { HexColors } from '@config/colors';

export const GRAPH_BG_COLOR = HexColors.Black100;
const NODE_COLOR_DEFAULT = HexColors.White;
const NODE_BORDER_COLOR_DEFAULT = HexColors.Black300;
const NODE_COLOR_DEFAULT_LABEL = HexColors.Black900;
const NODE_COLOR_DEFAULT_LABEL_BG = HexColors.White;
const EDGE_COLOR_DEFAULT = HexColors.Black600;
const EDGE_COLOR_ENDPOINT_SITE_CONNECTION_DEFAULT = HexColors.Blue400;
const EDGE_COLOR_DEFAULT_TEXT = HexColors.Black900;
const EDGE_COLOR_DEFAULT_BG_TEXT = HexColors.White;

const COMBO__BG_COLOR_DEFAULT = 'transparent';
const COMBO_BORDER_COLOR_DEFAULT = HexColors.Black400;
const COMBO_BORDER_COLOR_HOVER = HexColors.Blue400;
const COMBO_COLOR_DEFAULT_LABEL = HexColors.White;
const COMBO_COLOR_DEFAULT_LABEL_BG = HexColors.Black900;

export const GRAPH_CONTAINER_ID = 'container';
const NODE_SIZE = 36;
const ICON_SIZE = 14;
const LABEL_FONT_SIZE = 8;
const INACTIVE_OPACITY_VALUE = 0.3;

// Nodes
export const NODE_CONFIG: NodeOptions = {
  style: {
    opacity: 1,
    size: NODE_SIZE,
    fill: NODE_COLOR_DEFAULT,
    strokeWidth: 1,
    stroke: NODE_BORDER_COLOR_DEFAULT,
    lineWidth: 0.8,
    cursor: 'pointer',
    labelPosition: 'bottom',
    labelOffset: 8,
    labelFill: NODE_COLOR_DEFAULT_LABEL,
    labelFontSize: LABEL_FONT_SIZE,
    labelFontFamily: 'RedHatText',
    labelBackground: true,
    labelBackgroundFill: NODE_COLOR_DEFAULT_LABEL_BG,
    labelBackgroundStroke: NODE_BORDER_COLOR_DEFAULT,
    labelBackgroundLineWidth: 0.5,
    labelBackgroundRadius: 2,
    labelBackgroundOpacity: 1,
    icon: true,
    iconWidth: ICON_SIZE,
    iconHeight: ICON_SIZE
  },

  state: {
    hover: {
      stroke: HexColors.Blue400
    },

    activeElement: {
      stroke: HexColors.Blue400,
      labelFill: HexColors.White,
      labelBackgroundFill: HexColors.Blue400,
      labelBackgroundStroke: HexColors.Blue400
    },

    hidden: {
      opacity: INACTIVE_OPACITY_VALUE
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
    haloOpacity: 0.1,
    lineWidth: 0.5,
    increasedLineWidthForHitTesting: 20,
    stroke: EDGE_COLOR_DEFAULT,
    endArrow: true,
    endArrowSize: 8,
    labelFontFamily: 'RedHatText',
    labelBackground: true,
    labelFill: EDGE_COLOR_DEFAULT_TEXT,
    labelFontSize: LABEL_FONT_SIZE,
    labelBackgroundFill: EDGE_COLOR_DEFAULT_BG_TEXT,
    labelBackgroundRadius: 2,
    labelBackgroundOpacity: 1,
    labelBackgroundFillOpacity: 1,
    labelPadding: [2, 2]
  },

  state: {
    hidden: {
      visibility: 'hidden'
    },
    activeElement: {
      halo: true
    },
    hover: {
      halo: true
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
    lineWidth: 2,
    fill: COMBO__BG_COLOR_DEFAULT,
    stroke: COMBO_BORDER_COLOR_DEFAULT,
    radius: 10,
    cursor: 'grab',
    labelFill: COMBO_COLOR_DEFAULT_LABEL,
    labelFontFamily: 'RedHatText',
    labelPadding: [2, 5],
    labelFontSize: LABEL_FONT_SIZE + 2,
    labelPosition: 'bottom',
    labelBackground: true,
    labelOffsetY: 5,
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
    { type: 'drag-element', trigger: 'down' },
    {
      // state for the rest of the nodes
      key: 'click-select',
      type: 'click-select',
      degree: 1,
      state: 'activeElement',
      neighborState: 'hover',
      unselectedState: 'hidden',
      enable: ({ targetType }: IPointerEvent) => targetType === 'node' || targetType === 'edge'
    },
    {
      // state for the node with state hover
      key: 'hover-activate-single',
      type: 'hover-activate',
      degree: 0,
      state: 'hover',
      enable: ({ targetType }: IPointerEvent) => targetType === 'node' || targetType === 'edge',
      onHover: ({ view }: IPointerEvent) => {
        view.setCursor('pointer');
      },
      onHoverEnd: ({ view }: IPointerEvent) => {
        view.setCursor('default');
      }
    },
    {
      // state for the rest of the nodes
      key: 'hover-activate',
      type: 'hover-activate',
      degree: 1,
      state: '',
      inactiveState: 'hidden',
      enable: ({ targetType }: IPointerEvent) => targetType === 'node' || targetType === 'edge',
      onHover: ({ view }: IPointerEvent) => {
        view.setCursor('pointer');
      },
      onHoverEnd: ({ view }: IPointerEvent) => {
        view.setCursor('default');
      }
    },
    {
      key: 'hover-activate-combo',
      type: 'hover-activate',
      state: 'hover',
      enable: ({ targetType }: IPointerEvent) => targetType === 'combo',
      onHover: ({ view }: IPointerEvent) => {
        view.setCursor('pointer');
      },
      onHoverEnd: ({ view }: IPointerEvent) => {
        view.setCursor('default');
      }
    }
  ],
  node: { ...NODE_CONFIG },
  edge: { ...DATA_EDGE_CONFIG },
  combo: { ...COMBO_CONFIG }
};

export const LAYOUT_TOPOLOGY_DEFAULT = (): BaseLayoutOptions => ({
  type: 'force',
  nodeSize: NODE_SIZE,
  nodeSpacing: NODE_SIZE,
  preventOverlap: true
});

export const LAYOUT_TOPOLOGY_COMBO = (): BaseLayoutOptions => ({
  type: 'force',
  nodeSize: NODE_SIZE,
  preventOverlap: true,
  clustering: true,
  nodeClusterBy: 'cluster',
  distanceThresholdMode: 'max',
  clusterNodeStrength: 500000,
  nodeStrength: 7000,
  leafCluster: true,
  gravity: 1000,
  factor: 800
});

export const LAYOUT_TOPOLOGY_GRID = ({ sideLength }: { sideLength: number }): BaseLayoutOptions => ({
  type: 'grid',
  condense: false,
  rows: sideLength,
  cols: sideLength,
  height: NODE_SIZE * sideLength * 2,
  width: NODE_SIZE * sideLength * 4
});

export const LAYOUT_TOPOLOGY_GRID_COMBO = ({ sideLength }: { sideLength: number }): BaseLayoutOptions => ({
  type: 'combo-combined',
  comboPadding: 100,
  outerLayout: new ForceAtlas2Layout({ kr: sideLength * 200 }),
  innerLayout: new GridLayout({
    condense: false,
    rows: sideLength,
    cols: sideLength >= 8 ? sideLength - 4 : sideLength,
    height: NODE_SIZE * sideLength * 2,
    width: NODE_SIZE * sideLength * 3
  })
});

export const LAYOUT_TOPOLOGY_SINGLE_NODE: () => BaseLayoutOptions = () => ({
  type: 'antv-dagre',
  rankdir: 'BT',
  sortByCombo: true
});
