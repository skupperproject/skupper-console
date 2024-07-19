import { LEGEND_DEFAULT_BG_COLOR, LEGEND_DEFAULT_STROKE_COLOR } from './Shapes.constants';

const SvgDiamond = function ({ dimension = 12 }: { dimension?: number }) {
  const diamondDimension = dimension;
  const diamondColor = LEGEND_DEFAULT_BG_COLOR;
  const diamondStroke = LEGEND_DEFAULT_STROKE_COLOR;

  return (
    <svg width={diamondDimension} height={diamondDimension}>
      <polygon
        points={`0,${diamondDimension / 2} ${diamondDimension / 2},0 ${diamondDimension},${diamondDimension / 2} ${
          diamondDimension / 2
        },${diamondDimension}`}
        fill={diamondColor}
        stroke={diamondStroke}
      />
    </svg>
  );
};

export default SvgDiamond;
