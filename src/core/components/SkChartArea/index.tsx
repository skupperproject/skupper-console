import { FC, useMemo } from 'react';

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

import { CHART_CONFIG } from './SkChartArea.constants';
import { calculateTickDensity, getChartDynamicPaddingLeft } from './SkChartArea.utils';
import { useChartDimensions } from '../../../hooks/useChartDimensions';
import { skAxisXY } from '../../../types/SkChartArea.interfaces';
import { formatChartDateByRange } from '../../utils/formatChartDateByRange';

interface SkChartAreaProps extends ChartProps {
  data: skAxisXY[][];
  title?: string;
  formatY?: (y: number) => string | number;
  formatX?: (timestamp: number, range: number) => string;
  axisYLabel?: string;
  legendLabels?: string[];
  isChartLine?: boolean;
  padding?: Record<string, number>;
  showLegend?: boolean;
}

const SkChartArea: FC<SkChartAreaProps> = function ({
  data,
  formatY = (y: number) => y,
  formatX = (timestamp, range) => formatChartDateByRange(timestamp, range),
  axisYLabel,
  legendLabels = [],
  showLegend = true,
  isChartLine = false,
  title,
  height = CHART_CONFIG.LAYOUT.DEFAULT_HEIGHT,
  legendOrientation = 'horizontal',
  legendPosition = 'bottom',
  padding = CHART_CONFIG.LAYOUT.DEFAULT_PADDING,
  ...props
}) {
  const CursorVoronoiContainer = useMemo(() => createContainer('voronoi', 'cursor'), []);
  const { chartWidth, chartContainerRef } = useChartDimensions();

  const legendData = legendLabels.map((label) => ({ childName: label, name: label }));
  const startDate = data[0]?.[0]?.x ?? 0;
  const endDate = data[data.length - 1]?.[data[0]?.length - 1]?.x ?? startDate + 1000;

  // tick count calculation
  const tickYCount = useMemo(
    () =>
      Math.max(
        CHART_CONFIG.TICKS.MIN_COUNT,
        Math.min(
          CHART_CONFIG.TICKS.MAX_COUNT,
          Math.floor((height - CHART_CONFIG.LAYOUT.CHART_OFFSET) / calculateTickDensity(chartWidth))
        )
      ),
    [height, chartWidth]
  );

  const tickXCount = useMemo(
    () =>
      Math.max(
        CHART_CONFIG.TICKS.MIN_COUNT,
        Math.min(CHART_CONFIG.TICKS.MAX_COUNT, Math.floor((chartWidth - 50) / calculateTickDensity(chartWidth, 160)))
      ),
    [chartWidth]
  );

  // Dynamic padding calculation
  const dynamicPaddingLeft = getChartDynamicPaddingLeft(data, formatY);
  const calculatedPadding = { ...padding, left: dynamicPaddingLeft };

  return (
    <div ref={chartContainerRef} style={{ height: `${height}px` }}>
      {chartWidth > 0 && (
        <Chart
          width={chartWidth}
          height={height - CHART_CONFIG.LAYOUT.CHART_OFFSET}
          legendData={showLegend ? legendData : []}
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
                  title={(datum) => `${formatX(Number(datum.x), endDate - startDate)}`}
                  cornerRadius={CHART_CONFIG.TOOLTIP.CORNER_RADIUS}
                  flyoutStyle={CHART_CONFIG.TOOLTIP.STYLE}
                />
              }
              mouseFollowTooltips
              voronoiPadding={CHART_CONFIG.TOOLTIP.PADDING}
            />
          }
          {...props}
        >
          {title && (
            <ChartLabel
              text={title}
              x={20}
              y={-40}
              textAnchor="start"
              style={{ fontSize: CHART_CONFIG.AXIS.TITLE_FONT_SIZE }}
            />
          )}

          <ChartAxis
            style={{
              tickLabels: {
                fontSize: CHART_CONFIG.AXIS.DEFAULT_FONT_SIZE
              }
            }}
            tickFormat={(tick) => tick && formatX(tick, endDate - startDate)}
            tickCount={tickXCount}
            domain={[startDate, endDate]}
            showGrid
          />
          <ChartAxis
            label={axisYLabel}
            dependentAxis
            minDomain={0}
            style={{
              tickLabels: { fontSize: CHART_CONFIG.AXIS.DEFAULT_FONT_SIZE },
              axisLabel: {
                fontSize: CHART_CONFIG.AXIS.DEFAULT_FONT_SIZE,
                padding: CHART_CONFIG.AXIS.LABEL_PADDING
              }
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
