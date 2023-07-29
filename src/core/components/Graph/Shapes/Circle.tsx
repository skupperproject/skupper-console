import { LEGEND_DEFAULT_STROKE_COLOR } from '../Graph.constants';

const SvgCircle = function ({ dimension = 12 }: { dimension?: number }) {
  const circleDimension = dimension;
  const circleStroke = LEGEND_DEFAULT_STROKE_COLOR;

  return (
    <svg width={circleDimension} height={circleDimension} viewBox={`0 0 ${circleDimension} ${circleDimension}`}>
      <circle
        cx={circleDimension / 2}
        cy={circleDimension / 2}
        r={circleDimension / 2.5}
        stroke={circleStroke}
        fillOpacity={0}
      />
    </svg>
  );
};

export default SvgCircle;
