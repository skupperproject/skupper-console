import { LINE_COLOR } from './Shapes.constants';

const SvgHorizontalLine = function ({
  color = LINE_COLOR,
  dashed = false,
  withConnector = false
}: {
  color?: string;
  dashed?: boolean;
  withConnector?: boolean;
}) {
  const lineWidth = 30;
  const lineHeight = 12;
  const circleRadius = 3;

  const dashArray = dashed ? `${lineHeight * 0.4} ${lineHeight * 0.4}` : undefined;

  return (
    <svg width={lineWidth} height={lineHeight} viewBox={`0 0 ${lineWidth} ${lineHeight * 1.4}`}>
      <line x1="0" y1={lineHeight} x2={lineWidth} y2={lineHeight} stroke={color} strokeDasharray={dashArray} />

      {withConnector && (
        <circle cx={lineWidth - circleRadius} cy={lineHeight} r={circleRadius} fill={color} stroke={color} />
      )}
    </svg>
  );
};

export default SvgHorizontalLine;
