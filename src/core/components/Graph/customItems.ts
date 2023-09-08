import { registerEdge, ArrowConfig, registerCombo, IGroup } from '@antv/g6';

import { COMBO_COLOR_DEFAULT_LABEL_BG, EDGE_COLOR_ACTIVE_DEFAULT, EDGE_COLOR_DEFAULT } from './Graph.constants';

export function registerCustomEdgeWithHover() {
  // Draw a blue line dash when hover an edge
  const edgeName = 'line-dash';
  const lineDash = [4, 2, 1, 2];
  registerEdge(
    edgeName,
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
  const edgeName = 'site-edge';
  const lineDash = [4, 4];

  registerEdge(edgeName, {
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

export function registerSiteCombo() {
  const textContainerKey = 'combo-label-shape';
  const padding = [10, 8];

  registerCombo(
    'cRect',
    {
      afterDraw(_, group) {
        if (group) {
          const { width, height } = group.get('children')[1].getBBox(); // combo label

          // creates a background container for the combo label
          const textContainer = group.addShape('rect', {
            attrs: {
              fill: COMBO_COLOR_DEFAULT_LABEL_BG,
              stroke: COMBO_COLOR_DEFAULT_LABEL_BG,
              radius: 3
            },
            name: textContainerKey
          });

          textContainer.attr({
            width: width + padding[0],
            height: height + padding[1]
          });

          textContainer.toBack();
        }
      },
      afterUpdate(_, combo) {
        if (combo) {
          const group = combo.get('group') as IGroup;
          const { x, y } = group.get('children')[2].getBBox(); // combo label
          const textContainer = group.find((element) => element.get('name') === textContainerKey);

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
