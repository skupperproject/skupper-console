import {
  Circle,
  CircleStyleProps,
  ComboOptions,
  Diamond,
  DiamondStyleProps,
  EdgeOptions,
  ExtensionCategory,
  NodeOptions,
  Polyline,
  PolylineStyleProps,
  Quadratic,
  QuadraticStyleProps,
  RectCombo,
  RectComboStyleProps,
  register
} from '@antv/g6';

import {
  COMBO__BG_COLOR_DEFAULT,
  COMBO_BORDER_COLOR_DEFAULT,
  COMBO_COLOR_DEFAULT_LABEL,
  COMBO_COLOR_DEFAULT_LABEL_BG,
  EDGE_BORDER_COLOR,
  EDGE_LINE_DOWN_COLOR,
  EDGE_LABEL_BACKGROUND_COLOR,
  EDGE_LABEL_TEXT_COLOR,
  EDGE_LINE_COLOR,
  EDGE_SELECT_LINE,
  EDGE_TERMINAL_COLOR,
  FONT_FAMILY,
  ICON_SIZE,
  INACTIVE_OPACITY_VALUE,
  LABEL_EDGE_BADGE_PADDING,
  LABEL_EDGE_PADDING,
  LABEL_FONT_SIZE,
  LABEL_PADDING,
  NODE_BACKGROUND_COLOR,
  NODE_BADGE_PRIMARY_BACKGROUND,
  NODE_BADGE_PRIMARY_TEXT,
  NODE_BORDER_COLOR,
  NODE_HIGHLIGHT_BORDER,
  NODE_LABEL_BACKGROUND_COLOR,
  NODE_LABEL_TEXT_COLOR,
  NODE_SELECT_BORDER,
  NODE_SIZE,
  EDGE_LINE_PARTIAL_DOWN_COLOR,
  EDGE_BADGE_PRIMARY_BACKGROUND,
  EDGE_BADGE_PRIMARY_TEXT,
  EDGE_BADGE_FONT_SIZE
} from '../Graph.constants';
import { GraphElementStates } from '../Graph.enum';

const DEFAULT_NODE_CONFIG: NodeOptions = {
  style: {
    opacity: 1,
    size: NODE_SIZE,
    fill: NODE_BACKGROUND_COLOR,
    stroke: NODE_BORDER_COLOR,
    lineWidth: 1,
    labelOffsetY: 4,
    labelFill: NODE_LABEL_TEXT_COLOR,
    labelFontSize: LABEL_FONT_SIZE,
    labelFontFamily: FONT_FAMILY,
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
    badgeFontSize: LABEL_FONT_SIZE + 2,
    badgeFill: NODE_BADGE_PRIMARY_TEXT,
    badgeBackgroundFill: NODE_BADGE_PRIMARY_BACKGROUND,
    badgeBackgroundStroke: NODE_BACKGROUND_COLOR,
    badgeBackgroundLineWidth: 1,
    badgeBackgroundHeight: LABEL_FONT_SIZE * 2,
    badgeBackgroundWidth: LABEL_FONT_SIZE * 2,
    shadowColor: NODE_BORDER_COLOR,
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    labelBackgroundShadowColor: NODE_BORDER_COLOR,
    labelBackgroundShadowBlur: 0,
    labelBackgroundShadowOffsetX: 0,
    labelBackgroundShadowOffsetY: 4,
    zIndex: 3
  },

  state: {
    [GraphElementStates.HoverNode]: {
      cursor: 'pointer',
      opacity: 1,
      stroke: NODE_SELECT_BORDER
    },

    [GraphElementStates.Visible]: {
      opacity: 1
    },

    [GraphElementStates.Select]: {
      cursor: 'pointer',
      lineWidth: 2,
      stroke: NODE_SELECT_BORDER,
      labelFill: NODE_BACKGROUND_COLOR,
      labelBackgroundFill: NODE_SELECT_BORDER,
      labelBackgroundStroke: NODE_SELECT_BORDER
    },

    [GraphElementStates.HighlightNode]: {
      stroke: NODE_HIGHLIGHT_BORDER,
      lineWidth: 2
    },

    [GraphElementStates.Hidden]: {
      opacity: INACTIVE_OPACITY_VALUE
    },

    [GraphElementStates.Exclude]: {
      opacity: INACTIVE_OPACITY_VALUE
    }
  }
};

// EDGE
const DEFAULT_DATA_EDGE_CONFIG: EdgeOptions = {
  style: {
    visibility: 'visible',
    opacity: 1,
    haloOpacity: 0.15,
    haloStroke: EDGE_LINE_COLOR,
    lineWidth: 0.5,
    increasedLineWidthForHitTesting: 20,
    stroke: EDGE_LINE_COLOR,
    endArrow: true,
    endArrowFill: EDGE_TERMINAL_COLOR,
    labelFontFamily: FONT_FAMILY,
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
    [GraphElementStates.Hidden]: {
      visibility: 'hidden'
    },

    [GraphElementStates.Exclude]: {
      opacity: INACTIVE_OPACITY_VALUE
    },

    [GraphElementStates.Select]: {
      cursor: 'pointer',
      lineWidth: 2,
      opacity: 1,
      stroke: EDGE_SELECT_LINE,
      haloStroke: EDGE_SELECT_LINE
    },

    [GraphElementStates.Visible]: {
      opacity: 1
    },

    [GraphElementStates.HoverEdge]: {
      cursor: 'pointer',
      lineWidth: 2,
      haloOpacity: 0.35,
      zIndex: 2
    }
  }
};

const DEFAULT_COMBO_CONFIG: ComboOptions = {
  style: {
    fillOpacity: 1,
    lineWidth: 3,
    fill: COMBO__BG_COLOR_DEFAULT,
    stroke: COMBO_BORDER_COLOR_DEFAULT,
    radius: 10,
    cursor: 'auto',
    labelFill: COMBO_COLOR_DEFAULT_LABEL,
    labelFontFamily: FONT_FAMILY,
    labelPadding: [2, 5],
    labelFontSize: LABEL_FONT_SIZE + 2,
    labelPosition: 'bottom',
    labelBackground: true,
    labelOffsetY: 15,
    labelBackgroundRadius: 2,
    labelBackgroundFill: COMBO_COLOR_DEFAULT_LABEL_BG,
    labelBackgroundOpacity: 1
  }
};

class SkNode extends Circle {
  render(attrs: Required<CircleStyleProps>) {
    super.render(attrs);
  }
}

class SkEmptyNode extends Circle {
  render(attrs: Required<CircleStyleProps>) {
    super.render({
      ...attrs,
      opacity: 1,
      stroke: 'transparent',
      size: NODE_SIZE / 2,
      icon: true
    });
  }
}

class SkNodeRemote extends SkNode {
  render(attrs: Required<CircleStyleProps>) {
    super.render({
      ...attrs,
      opacity: 1,
      fill: NODE_BORDER_COLOR,
      stroke: NODE_BACKGROUND_COLOR,
      size: NODE_SIZE / 2,
      icon: false,
      badge: false,
      halo: true
    });
  }
}

class SkNodeUnexposed extends Diamond {
  render(attrs: Required<DiamondStyleProps>) {
    super.render(attrs);
  }
}

class SkDataEdge extends Quadratic {
  render(attrs: Required<QuadraticStyleProps>) {
    super.render(attrs);
  }
}

class SkSiteEdge extends SkDataEdge {
  render(attrs: Required<QuadraticStyleProps>) {
    super.render({
      ...attrs,
      lineDash: 3,
      endArrow: true,
      endArrowType: 'circle',
      endArrowOffset: -5,
      badgeFontSize: EDGE_BADGE_FONT_SIZE,
      badgeFill: EDGE_BADGE_PRIMARY_TEXT,
      badgeBackgroundFill: EDGE_BADGE_PRIMARY_BACKGROUND,
      badgeBackgroundHeight: LABEL_FONT_SIZE + 2,
      badgeBackgroundWidth: LABEL_FONT_SIZE + 2,
      labelOffsetX: 0
    });
  }
}

class SkSiteEdgeDown extends SkSiteEdge {
  render(attrs: Required<QuadraticStyleProps>) {
    super.render({
      ...attrs,
      stroke: EDGE_LINE_DOWN_COLOR,
      lineWidth: 2
    });
  }
}

class SkSiteEdgePartialUp extends SkSiteEdge {
  render(attrs: Required<QuadraticStyleProps>) {
    super.render({
      ...attrs,
      stroke: EDGE_LINE_PARTIAL_DOWN_COLOR,
      lineWidth: 2
    });
  }
}

class SkListenerConnectorEdge extends Polyline {
  render(attrs: Required<PolylineStyleProps>) {
    const extendedProps = {
      lineDash: 4,
      radius: 20,
      endArrow: false,
      labelBackgroundRadius: 2,
      router: {
        type: 'orth'
      }
    };

    super.render({
      ...attrs,
      ...extendedProps
    });
  }
}

class SkCombo extends RectCombo {
  render(attrs: Required<RectComboStyleProps>) {
    super.render(attrs);
  }
}

export const defaultConfigElements = {
  node: DEFAULT_NODE_CONFIG,
  edge: DEFAULT_DATA_EDGE_CONFIG,
  combo: DEFAULT_COMBO_CONFIG
};

export function registerElements() {
  register(ExtensionCategory.NODE, 'SkNode', SkNode);
  register(ExtensionCategory.NODE, 'SkEmptyNode', SkEmptyNode);
  register(ExtensionCategory.NODE, 'SkNodeUnexposed', SkNodeUnexposed);
  register(ExtensionCategory.NODE, 'SkNodeRemote', SkNodeRemote);
  register(ExtensionCategory.EDGE, 'SkDataEdge', SkDataEdge);
  register(ExtensionCategory.EDGE, 'SkSiteEdge', SkSiteEdge);
  register(ExtensionCategory.EDGE, 'SkSiteEdgeDown', SkSiteEdgeDown);
  register(ExtensionCategory.EDGE, 'SkSiteEdgePartialDown', SkSiteEdgePartialUp);
  register(ExtensionCategory.EDGE, 'SkListenerConnectorEdge', SkListenerConnectorEdge);
  register(ExtensionCategory.COMBO, 'SkCombo', SkCombo);
}
