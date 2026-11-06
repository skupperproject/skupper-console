import type { Path } from '@antv/g';
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
  Rect,
  RectStyleProps,
  RectCombo,
  RectComboStyleProps,
  register
} from '@antv/g6';

import { theme } from '../config';

export function registerElements() {
  register(ExtensionCategory.NODE, 'SkNode', SkNode);
  register(ExtensionCategory.NODE, 'SkEmptyNode', SkEmptyNode);
  register(ExtensionCategory.NODE, 'SkListenerNode', SkListenerNode);
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

const LISTENER_CARD = {
  iconY: -25,
  labelY: -1,
  detailsY: [19, 31],
  detailsFontSize: theme.font.labelFontSize - 1
};
class SkListenerNode extends Rect {
  protected getIconStyle(attrs: Required<RectStyleProps>) {
    const style = super.getIconStyle(attrs);

    return style && { ...style, y: LISTENER_CARD.iconY };
  }

  render(attrs: Required<RectStyleProps>, container = this) {
    const { detailLines = [] } = attrs as unknown as { detailLines?: string[] };

    super.render(
      {
        ...attrs,
        size: theme.node.listenerSize,
        opacity: 1,
        fill: 'transparent',
        stroke: 'transparent',
        shadowColor: 'transparent',
        icon: true,
        labelPlacement: 'center',
        labelOffsetY: LISTENER_CARD.labelY,
        labelWordWrap: true,
        labelMaxWidth: '90%'
      },
      container
    );

    LISTENER_CARD.detailsY.forEach((y, i) => {
      const text = detailLines[i];
      const detailLine = text
        ? {
            x: 0,
            y,
            text,
            fontSize: LISTENER_CARD.detailsFontSize,
            fontFamily: theme.font.family,
            fill: theme.colors.nodeLabelText,
            textAlign: 'center',
            textBaseline: 'middle'
          }
        : false;

      this.upsert(`detail-${i}`, 'text', detailLine, container);
    });
  }
}

// Edge label position: `distance` from the listener (px), `offset*` from the line (px)
const LISTENER_EDGE_LABEL = {
  distance: 60,
  fallbackPlacement: 0.7,
  offsetX: 8,
  offsetY: 4
};

class SkListenerConnectorEdge extends Polyline {
  // Places the label at a fixed distance from the listener, as a ratio of the path would land on the bends
  protected getLabelStyle(attrs: Required<PolylineStyleProps>) {
    const length = (this.shapeMap.key as Path | undefined)?.getTotalLength() || 0;
    const labelPlacement = length
      ? Math.min(LISTENER_EDGE_LABEL.distance / length, 1)
      : LISTENER_EDGE_LABEL.fallbackPlacement;

    return super.getLabelStyle({ ...attrs, labelPlacement });
  }

  render(attrs: Required<PolylineStyleProps>) {
    const extendedProps = {
      lineDash: 4,
      radius: 20,
      endArrow: false,
      labelBackground: false,
      labelFontSize: LISTENER_CARD.detailsFontSize,
      labelFill: theme.colors.nodeLabelText,
      labelTextAlign: 'left' as const,
      labelOffsetX: LISTENER_EDGE_LABEL.offsetX,
      labelOffsetY: LISTENER_EDGE_LABEL.offsetY,
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
