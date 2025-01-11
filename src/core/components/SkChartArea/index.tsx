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
  ChartLine
} from '@patternfly/react-charts/victory';
import { getResizeObserver } from '@patternfly/react-core';

import { skAxisXY } from '../../../types/SkChartArea.interfaces';
import { formatChartDate } from '../../utils/formatChartDate';

const DEFAULT_CHART_PADDING = {
  bottom: 70,
  left: 70,
  right: 0,
  top: 20
};

interface SkChartAreaProps extends ChartProps {
  data: skAxisXY[][];
  formatY?: Function;
  formatYTooltip?: Function;
  formatX?: Function;
  axisYLabel?: string;
  legendLabels?: string[];
  isChartLine?: boolean;
  showLegend?: boolean;
}

const SkChartArea: FC<SkChartAreaProps> = function ({
  data,
  formatY = (y: number) => y,
  formatX = (timestamp: number, start: number) => formatChartDate(timestamp, start),
  axisYLabel,
  legendOrientation = 'horizontal',
  legendPosition = 'bottom',
  legendLabels = [],
  showLegend = true,
  isChartLine = false,
  height = 300,
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
    if (!chartContainerRef.current) {
      return;
    }

    observer.current = getResizeObserver(chartContainerRef.current, handleResize);
    handleResize();

    return () => observer.current();
  }, []);

  const legendData = legendLabels.map((name) => ({ childName: name, name }));

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');
  const startDate = data[0][0]?.x;

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: `100%` }}>
      <Chart
        width={width}
        height={height}
        legendData={showLegend ? legendData : []}
        legendOrientation={legendOrientation}
        legendPosition={legendPosition}
        themeColor={props.themeColor || ChartThemeColor.multi}
        padding={props.padding || DEFAULT_CHART_PADDING}
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            voronoiDimension="x"
            labels={({ datum }: { datum: skAxisXY }) => formatY(datum.y)}
            labelComponent={
              <ChartLegendTooltip
                legendData={legendData}
                title={(datum) => `${formatX(datum.x, startDate)}`}
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
