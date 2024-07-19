import { LEGEND_DEFAULT_STROKE_COLOR } from './Shapes.constants';

const SvgCircle = function ({ dimension = 12, fillOpacity = 0 }: { dimension?: number; fillOpacity?: number }) {
  const circleDimension = dimension;
  const circleStroke = LEGEND_DEFAULT_STROKE_COLOR;

  return (
    <svg width={circleDimension} height={circleDimension} viewBox={`0 0 ${circleDimension} ${circleDimension}`}>
      <circle
        cx={circleDimension / 2}
        cy={circleDimension / 2}
        r={circleDimension / 2.5}
        fill={circleStroke}
        stroke={circleStroke}
        fillOpacity={fillOpacity}
      />
    </svg>
  );
};

export default SvgCircle;
