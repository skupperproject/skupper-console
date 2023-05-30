import { FC, useEffect, useRef, useState } from 'react';

import {
  Chart,
  ChartAxis,
  createContainer,
  ChartGroup,
  ChartLegendTooltip,
  ChartThemeColor,
  ChartArea,
  ChartLine
} from '@patternfly/react-charts';
import { getResizeObserver } from '@patternfly/react-core';

import { formatChartDate } from '@core/utils/formatChartDate';

import { SkChartAreaProps, skAxisXY } from './SkChartArea.interfaces';

const CHART_PADDING = {
  bottom: 60,
  left: 120,
  right: 50, // Adjusted to accommodate legend
  top: 20
};

const SkChartArea: FC<SkChartAreaProps> = function ({
  data,
  formatY = (y: number) => y,
  formatX = (timestamp: number, start: number) => formatChartDate(timestamp, start),
  axisYLabel,
  legendLabels = [],
  showLegend = true,
  isChartLine = false,
  ...props
}) {
  const observer = useRef<Function>(() => null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  function handleResize() {
    if (chartContainerRef.current && chartContainerRef.current?.clientWidth) {
      setWidth(chartContainerRef.current.clientWidth);
    }
  }

  useEffect(() => {
    if (chartContainerRef.current) {
      observer.current = getResizeObserver(chartContainerRef.current, handleResize);
      handleResize();

      () => observer.current();
    }
  }, []);

  const legendData = legendLabels.map((name) => ({ childName: name, name }));

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');
  const startDate = data[0][0]?.x;

  return (
    <div style={{ width: '100%', height: `100%` }} ref={chartContainerRef}>
      <Chart
        legendData={showLegend ? legendData : []}
        legendOrientation="horizontal"
        legendPosition="bottom"
        width={width}
        themeColor={ChartThemeColor.cyan}
        padding={CHART_PADDING}
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            voronoiDimension="x"
            labels={({ datum }: { datum: skAxisXY }) => formatY(datum.y)}
            labelComponent={
              <ChartLegendTooltip
                legendData={legendData}
                title={(datum: skAxisXY) => `${formatX(datum.x, startDate)}`}
                cornerRadius={5}
                flyoutStyle={{
                  fillOpacity: 0.75
                }}
              />
            }
            mouseFollowTooltips
            voronoiPadding={20}
          />
        }
        {...props}
      >
        <ChartAxis
          style={{
            tickLabels: { fontSize: 10 }
          }}
          tickFormat={(tick) => tick && formatX(tick, startDate)}
          showGrid
        />
        <ChartAxis
          label={axisYLabel}
          dependentAxis
          minDomain={{ y: 0 }}
          style={{
            tickLabels: { fontSize: 10 },
            axisLabel: { fontSize: 15, padding: 90 }
          }}
          tickFormat={(tick) => tick && formatY(tick < 0.001 ? 0 : tick)}
          showGrid
        />
        <ChartGroup>
          {data.map((row, index: number) =>
            isChartLine ? (
              <ChartLine key={index} data={row} name={legendData[index]?.name} />
            ) : (
              <ChartArea key={index} data={row} name={legendData[index]?.name} />
            )
          )}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default SkChartArea;
