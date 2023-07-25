import { registerEdge, ArrowConfig, GraphData, Legend } from '@antv/g6';

import { EDGE_COLOR_ACTIVE_DEFAULT } from './Graph.constants';

export function registerCustomBehaviours() {
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

export function createLegend(legendData: GraphData) {
  return new Legend({
    data: legendData,
    align: 'center',
    layout: 'horizontal', // vertical
    position: 'bottom-left',
    vertiSep: 12,
    horiSep: 24,
    offsetY: -4,
    padding: [4, 16, 8, 16],
    containerStyle: {
      fill: '#FFFFFF',
      fillOpacity: 1,
      opacity: 1,
      stroke: 'white'
    },
    title: '.',
    titleConfig: {
      position: 'center',
      offsetX: 0,
      offsetY: 10
    }
  });
}
