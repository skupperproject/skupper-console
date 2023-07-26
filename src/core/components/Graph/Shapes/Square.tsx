import { LEGEND_DEFAULT_BG_COLOR, LEGEND_DEFAULT_STROKE_COLOR } from '../Graph.constants';

const SvgSquare = function () {
  // Dimension of the square (width and height)
  const squareSize = 12;
  const squareColor = LEGEND_DEFAULT_BG_COLOR;
  const squareStroke = LEGEND_DEFAULT_STROKE_COLOR;

  return (
    <svg width={squareSize} height={squareSize}>
      <rect x="0" y="0" width={squareSize} height={squareSize} fill={squareColor} stroke={squareStroke} />
    </svg>
  );
};

export default SvgSquare;
