import { registerEdge, ArrowConfig } from '@antv/g6';

import { EDGE_COLOR_ACTIVE_DEFAULT, EDGE_COLOR_DEFAULT } from './Graph.constants';

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
