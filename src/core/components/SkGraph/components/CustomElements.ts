import {
  Circle,
  CircleStyleProps,
  Diamond,
  DiamondStyleProps,
  ExtensionCategory,
  Polyline,
  PolylineStyleProps,
  Quadratic,
  QuadraticStyleProps,
  RectCombo,
  RectComboStyleProps,
  register
} from '@antv/g6';

import { theme } from '../config';

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
      size: theme.node.size / 2,
      icon: true
    });
  }
}

class SkNodeRemote extends SkNode {
  render(attrs: Required<CircleStyleProps>) {
    super.render({
      ...attrs,
      opacity: 1,
      fill: theme.colors.nodeBorder,
      stroke: theme.colors.nodeBackground,
      icon: false,
      halo: true,
      size: theme.node.size / 1.7
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
      endArrow: false,
      badgeFontSize: theme.edge.badgeFontSize,
      badgeFill: theme.colors.edgeBadgeText,
      badgeBackgroundFill: theme.colors.edgeBadgeBackground,
      badgeBackgroundHeight: theme.font.labelFontSize + 2,
      badgeBackgroundWidth: theme.font.labelFontSize + 2,
      labelOffsetX: 0
    });
  }
}

class SkSiteEdgeDown extends Quadratic {
  render(attrs: Required<QuadraticStyleProps>) {
    super.render({
      ...attrs,
      lineDash: 3,
      endArrow: false,
      stroke: theme.colors.edgeLineDown,
      badge: true,
      badgeText: '!',
      badgeFontWeight: 900,
      badgeFontSize: theme.edge.badgeFontSize + 1,
      badgeFill: theme.colors.edgeBadgeTextColor,
      badgeBackgroundStroke: 'transparent',
      badgeBackgroundFill: theme.colors.edgeLineDown,
      label: true,
      labelText: 'down',
      labelPadding: 0,
      labelAutoRotate: true,
      labelBackgroundStroke: 'transparent',
      badgeBackgroundHeight: 8,
      badgeBackgroundWidth: 8,
      badgePlacement: 'prefix',
      labelOffsetY: 0.7,
      labelOffsetX: 11
    });
  }
}

class SkSiteEdgePartialUp extends SkSiteEdge {
  render(attrs: Required<QuadraticStyleProps>) {
    super.render({
      ...attrs,
      stroke: theme.colors.edgeLinePartialDown
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

//end
