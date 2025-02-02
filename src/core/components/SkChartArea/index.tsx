import { FC, useEffect, useRef, useState } from 'react';

import {
  ChartProps,
  Chart,
  ChartAxis,
  createContainer,
  ChartGroup,
  ChartLegendTooltip,
  ChartThemeColor,
  ChartArea,
  ChartLine,
  ChartLabel
} from '@patternfly/react-charts/victory';
import { getResizeObserver } from '@patternfly/react-core';

import { skAxisXY } from '../../../types/SkChartArea.interfaces';
import { formatChartDate } from '../../utils/formatChartDate';

interface SkChartAreaProps extends ChartProps {
  data: skAxisXY[][];
  title?: string;
  formatY?: Function;
  formatX?: (timestamp: number, start: number) => string;
  axisYLabel?: string;
  legendLabels?: string[];
  isChartLine?: boolean;
  padding?: Record<string, number>;
  showLegend?: boolean;
}

// Chart layout configuration
const CHART_LAYOUT = {
  DEFAULT_PADDING: { bottom: 0, left: 70, right: 0, top: 0 },
  DEFAULT_HEIGHT: 300,
  CHART_OFFSET: 110
};

// Tooltip configuration
const TOOLTIP_CONFIG = {
  PADDING: 0,
  CORNER_RADIUS: 5,
  STYLE: { fillOpacity: 0.75 }
};

// Axis style
const AXIS_STYLE = {
  LABEL_PADDING: 0,
  DEFAULT_FONT_SIZE: 12,
  TITLE_FONT_SIZE: 16
};

// Tick configuration
const TICKS = {
  DENSITY: 48,
  MIN_COUNT: 5
};

const SkChartArea: FC<SkChartAreaProps> = function ({
  data,
  formatY = (y: number) => y,
  formatX = (timestamp, start) => formatChartDate(timestamp, start),
  axisYLabel,
  legendLabels = [],
  showLegend = true,
  isChartLine = false,
  title,
  height = CHART_LAYOUT.DEFAULT_HEIGHT,
  legendOrientation = 'horizontal',
  legendPosition = 'bottom',
  padding = CHART_LAYOUT.DEFAULT_PADDING,
  ...props
}) {
  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

  const [chartWidth, setChartWidth] = useState<number>(0);
  const resizeObserver = useRef<Function>(() => null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const updateChartWidth = () => {
      if (chartContainerRef.current?.clientWidth) {
        setChartWidth(chartContainerRef.current.clientWidth);
      }
    };

    resizeObserver.current = getResizeObserver(chartContainerRef.current, updateChartWidth);
    updateChartWidth();

    return () => resizeObserver.current();
  }, []);

  const startDate = data[0]?.[0]?.x ?? 0;
  const endDate = data[data.length - 1]?.[data[0]?.length - 1]?.x ?? startDate + 1000;

  const tickYCount = Math.max(TICKS.MIN_COUNT, Math.floor((height - CHART_LAYOUT.CHART_OFFSET) / TICKS.DENSITY));
  const tickXCount = Math.max(TICKS.MIN_COUNT, Math.floor((chartWidth - 50) / (TICKS.DENSITY * 2)));

  const legendData = legendLabels.map((label) => ({ childName: label, name: label }));
  const displayLegendData = showLegend ? legendData : [];

  const dynamicPaddingLeft = getChartDynamicPaddingLeft(data, formatY);
  const calculatedPadding = { ...padding, left: dynamicPaddingLeft };

  return (
    <div ref={chartContainerRef} style={{ height: `${height}px` }}>
      {chartWidth && (
        <Chart
          width={chartWidth}
          height={height - CHART_LAYOUT.CHART_OFFSET}
          legendData={displayLegendData}
          legendOrientation={legendOrientation}
          legendPosition={legendPosition}
          themeColor={props.themeColor || ChartThemeColor.multi}
          padding={calculatedPadding}
          containerComponent={
            <CursorVoronoiContainer
              cursorDimension="x"
              voronoiDimension="x"
              labels={({ datum }: { datum: skAxisXY }) => formatY(datum.y)}
              labelComponent={
                <ChartLegendTooltip
                  legendData={legendData}
                  title={(datum) => `${formatX(Number(datum.x), startDate)}`}
                  cornerRadius={TOOLTIP_CONFIG.CORNER_RADIUS}
                  flyoutStyle={TOOLTIP_CONFIG.STYLE}
                />
              }
              mouseFollowTooltips
              voronoiPadding={TOOLTIP_CONFIG.PADDING}
            />
          }
          {...props}
        >
          <ChartLabel text={title} x={20} y={-40} textAnchor="start" style={{ fontSize: AXIS_STYLE.TITLE_FONT_SIZE }} />

          <ChartAxis
            style={{ tickLabels: { fontSize: AXIS_STYLE.DEFAULT_FONT_SIZE, padding: 10 } }}
            tickFormat={(tick) => tick && formatX(tick, startDate)}
            tickCount={tickXCount}
            domain={[startDate, endDate]}
            showGrid
          />
          <ChartAxis
            label={axisYLabel}
            dependentAxis
            minDomain={0}
            style={{
              tickLabels: { fontSize: AXIS_STYLE.DEFAULT_FONT_SIZE },
              axisLabel: { fontSize: AXIS_STYLE.DEFAULT_FONT_SIZE, padding: AXIS_STYLE.LABEL_PADDING }
            }}
            tickCount={tickYCount}
            tickFormat={(tick) => tick && formatY(tick < 0.001 ? 0 : tick)}
            showGrid
          />
          <ChartGroup>
            {data.map((series, index) =>
              isChartLine ? (
                <ChartLine key={index} data={series} name={legendData[index]?.name} />
              ) : (
                <ChartArea key={index} data={series} name={legendData[index]?.name} />
              )
            )}
          </ChartGroup>
        </Chart>
      )}
    </div>
  );
};

export default SkChartArea;

const getChartDynamicPaddingLeft = (data: skAxisXY[][], formatY: Function) => {
  const longestFormattedY = data
    .flat()
    .map((point) => formatY(point.y)?.toString())
    .reduce((longest, current) => (current.length > longest.length ? current : longest), '');

  return Math.max(35, longestFormattedY.length * 7 + 8);
};
