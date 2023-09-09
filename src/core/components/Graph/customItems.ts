import { registerEdge, ArrowConfig, registerCombo, IGroup, registerNode } from '@antv/g6';

import { CUSTOM_CIRCLE_NODE_STYLE, EDGE_COLOR_ACTIVE_DEFAULT, EDGE_COLOR_DEFAULT, NODE_SIZE } from './Graph.constants';
import { ComboWithCustomLabel, NodeWithBadgesProps } from './Graph.interfaces';

export const CUSTOM_ITEMS_NAMES = {
  animatedDashEdge: 'line-dash',
  siteEdge: 'site-edge',
  nodeWithBadges: 'nCircle',
  comboWithCustomLabel: 'cRect'
};

export function registerCustomEdgeWithHover() {
  // Draw a blue line dash when hover an edge
  const lineDash = [4, 2, 1, 2];
  registerEdge(
    CUSTOM_ITEMS_NAMES.animatedDashEdge,
    {
      setState(name, value, item) {
        if (item) {
          const group = item.getContainer();
          const shape = group.get('children')[0];
          const model = item.getModel();
          const arrow = model?.style?.endArrow as ArrowConfig;

          let index = 0;

          if ((name === 'hover' || name === 'active') && value) {
            shape.animate(
              () => ({
                lineDash,
                lineDashOffset: -index++ % 9,
                stroke: EDGE_COLOR_ACTIVE_DEFAULT,
                endArrow: {
                  ...arrow,
                  fill: EDGE_COLOR_ACTIVE_DEFAULT
                }
              }),
              {
                repeat: true,
                duration: 3000
              }
            );
          } else {
            shape.stopAnimate(0);
            shape.attr({ ...model?.style, opacity: 1 });
          }
        }
      }
    },
    'linear'
  );
}

export function registerSiteEdge() {
  // Draw a blue line dash when hover an edge
  const lineDash = [4, 4];

  registerEdge(CUSTOM_ITEMS_NAMES.siteEdge, {
    draw(cfg, group) {
      const { startPoint, endPoint } = cfg;
      const keyShape = group.addShape('path', {
        attrs: {
          path: [
            ['M', startPoint?.x, startPoint?.y],
            ['L', endPoint?.x, endPoint?.y]
          ],
          stroke: EDGE_COLOR_DEFAULT,
          lineWidth: 1,
          lineDash
        },
        name: 'path-shape'
      });

      return keyShape;
    },
    afterDraw(_, group) {
      if (group) {
        const shape = group.get('children')[0];
        const quatile = shape.getPoint(0.95);

        group.addShape('circle', {
          attrs: {
            r: 4,
            fill: EDGE_COLOR_DEFAULT,
            x: quatile.x,
            y: quatile.y
          }
        });
      }
    }
  });
}

export function regusterComboWithCustomLabel() {
  const textContainerKey = 'combo-label-shape';

  registerCombo(
    CUSTOM_ITEMS_NAMES.comboWithCustomLabel,
    {
      afterDraw(cfg: ComboWithCustomLabel | undefined, group) {
        if (group) {
          const { width, height } = group.get('children')[1].getBBox(); // combo label

          // creates a background container for the combo label
          const textContainer = group.addShape('rect', {
            attrs: cfg?.labelBgCfg || {},
            name: textContainerKey
          });

          const padding = cfg?.labelBgCfg?.padding || [0, 0];
          textContainer.attr({
            width: width + padding[0],
            height: height + padding[1]
          });

          textContainer.toBack();
        }
      },
      afterUpdate(cfg: ComboWithCustomLabel | undefined, combo) {
        if (combo) {
          const group = combo.get('group') as IGroup;
          const { x, y } = group.get('children')[2].getBBox(); // combo label
          const textContainer = group.find((element) => element.get('name') === textContainerKey);

          const padding = cfg?.labelBgCfg?.padding || [0, 0];
          textContainer.attr({
            x: x - padding[0] / 2,
            y: y - padding[1] / 2
          });
        }
      }
    },
    'rect'
  );
}

export function registerNodeWithBadges() {
  const { containerBg, containerBorderColor, textColor, textFontSize } = CUSTOM_CIRCLE_NODE_STYLE;
  const r = NODE_SIZE / 4;
  const angleBadge1 = 180;
  const x = r * Math.cos(angleBadge1) - r;
  const y = r * Math.sin(angleBadge1) - r;

  registerNode(
    CUSTOM_ITEMS_NAMES.nodeWithBadges,
    {
      afterDraw(cfg: NodeWithBadgesProps | undefined, group) {
        if (cfg?.enableBadge1 && group) {
          group.addShape('circle', {
            attrs: {
              x,
              y,
              r,
              stroke: containerBorderColor,
              fill: containerBg
            },
            name: `${CUSTOM_ITEMS_NAMES.nodeWithBadges}-notification-container`
          });

          group.addShape('text', {
            attrs: {
              x,
              y,
              textAlign: 'center',
              textBaseline: 'middle',
              text: cfg.notificationValue,
              fill: cfg.notificationColor || textColor,

              fontSize: cfg.notificationFontSize || textFontSize
            }
          });
        }
      }
    },
    'circle'
  );
}
