import { LEGEND_DEFAULT_STROKE_COLOR } from './Shapes.constants';

const SvgSquare = function () {
  const squareSize = 12;
  const squareStroke = LEGEND_DEFAULT_STROKE_COLOR;

  return (
    <svg width={squareSize} height={squareSize}>
      <rect x="0" y="0" width={squareSize} height={squareSize} fillOpacity={0} stroke={squareStroke} strokeWidth={2} />
    </svg>
  );
};

export default SvgSquare;
