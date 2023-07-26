import React from 'react';

import { LEGEND_DEFAULT_BG_COLOR, LEGEND_DEFAULT_STROKE_COLOR } from '../Graph.constants';

const SvgCircle = function ({ dimension = 12 }: { dimension?: number }) {
  // Dimension of the circle (width and height)
  const circleDimension = dimension;
  const circleColor = LEGEND_DEFAULT_BG_COLOR;
  const circleStroke = LEGEND_DEFAULT_STROKE_COLOR;

  return (
    <svg width={circleDimension} height={circleDimension}>
      <circle
        cx={circleDimension / 2}
        cy={circleDimension / 2}
        r={circleDimension / 2}
        fill={circleColor}
        stroke={circleStroke}
      />
    </svg>
  );
};

export default SvgCircle;
