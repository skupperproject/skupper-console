import { EDGE_COLOR_DEFAULT } from '../Graph.constants';

const SvgHorizontalLine = function ({
  color = EDGE_COLOR_DEFAULT,
  dashed = false
}: {
  color?: string;
  dashed?: boolean;
}) {
  const lineWidth = 20;
  const lineHeight = 3;

  const dashArray = dashed ? `${lineHeight * 1} ${lineHeight * 1}` : undefined;

  return (
    <svg width={lineWidth} height={lineHeight}>
      <line
        x1="0"
        y1={lineHeight / 2}
        x2={lineWidth}
        y2={lineHeight / 2}
        stroke={color}
        strokeWidth={lineHeight}
        strokeDasharray={dashArray} // Set the dash pattern if dashed is true
      />
    </svg>
  );
};

export default SvgHorizontalLine;
