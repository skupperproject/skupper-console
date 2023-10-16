import { FC, useEffect, useRef, useState } from 'react';

import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartLegendTooltip,
  ChartThemeColor,
  createContainer
} from '@patternfly/react-charts';
import { getResizeObserver } from '@patternfly/react-core';

import { SkChartBarProps } from './SkChartBar.interfaces';
import { skAxisXY } from '../SkChartArea/SkChartArea.interfaces';

const DEFAULT_CHART_PADDING = {
  bottom: 65,
  left: 50,
  right: 20,
  top: 20
};

const SkChartBar: FC<SkChartBarProps> = function ({
  data,
  formatY = (y: number) => y,
  axisYLabel,
  legendOrientation = 'horizontal',
  legendPosition = 'bottom',
  legendLabels = [],
  showLegend = true,
  height = 300,
  ...props
}) {
  const observer = useRef<Function>(() => null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  function handleResize() {
    if (
      chartContainerRef.current &&
      chartContainerRef.current?.clientWidth &&
      chartContainerRef.current?.clientHeight
    ) {
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

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: `100%` }}>
      <Chart
        width={width}
        height={height}
        legendData={showLegend ? legendData : []}
        legendOrientation={legendOrientation}
        legendPosition={legendPosition}
        domainPadding={{ x: [60, 0] }}
        themeColor={props.themeColor || ChartThemeColor.multi}
        padding={props.padding || DEFAULT_CHART_PADDING}
        containerComponent={
          <CursorVoronoiContainer
            cursorDimension="x"
            voronoiDimension="x"
            labels={({ datum }: { datum: skAxisXY }) => `counts  ${formatY(datum.y)}`}
            labelComponent={
              <ChartLegendTooltip
                legendData={legendData}
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
          showGrid
          tickFormat={(tick) => `< ${formatY(tick)}`}
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
          {data.map((row, index: number) => (
            <ChartBar key={index} data={row} name={legendData[index]?.name} barWidth={120} />
          ))}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default SkChartBar;
