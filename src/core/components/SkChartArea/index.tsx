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
import { getResizeObserver, Title } from '@patternfly/react-core';

import { skAxisXY } from '../../../types/SkChartArea.interfaces';
import { formatChartDate } from '../../utils/formatChartDate';

const DEFAULT_CHART_PADDING = {
  bottom: 0,
  left: 70,
  right: 0,
  top: 0
};

interface SkChartAreaProps extends ChartProps {
  data: skAxisXY[][];
  title?: string;
  subTitle?: string;
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
  title,
  subTitle,
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
    <div ref={chartContainerRef} style={{ width: '100%', height: `${height + 0}px`, position: 'relative' }}>
      <div style={{ position: 'absolute', left: '35px', top: '10px' }}>
        <Title headingLevel="h4">{title}</Title>
        <p>{subTitle} </p>
      </div>

      <Chart
        width={width}
        height={height - 110}
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
            tickLabels: { fontSize: 12 }
          }}
          tickFormat={(tick) => tick && formatX(tick, startDate)}
          showGrid
        />
        <ChartAxis
          label={axisYLabel}
          dependentAxis
          minDomain={{ y: 0 }}
          style={{
            tickLabels: { fontSize: 12 },
            axisLabel: { fontSize: 15, padding: 0 }
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
