import { FC, useEffect, useRef, useState } from 'react';

import { ChartProps, Chart, ChartAxis, ChartBar, ChartThemeColor, ChartStack } from '@patternfly/react-charts/victory';
import { getResizeObserver } from '@patternfly/react-core';

const DEFAULT_CHART_PADDING = {
  bottom: 65,
  left: 50,
  right: 20,
  top: 20
};

interface SkChartBarProps extends ChartProps {
  data: { x: string; y: number }[][];
  formatY?: Function;
  formatYTooltip?: Function;
  formatX?: Function;
  axisYLabel?: string;
  legendLabels?: string[];
  isChartLine?: boolean;
  showLegend?: boolean;
}

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
    if (!chartContainerRef.current) {
      return;
    }

    observer.current = getResizeObserver(chartContainerRef.current, handleResize);
    handleResize();

    return () => observer.current();
  }, []);

  const legendData = legendLabels.map((name) => ({ childName: name, name }));

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: `100%` }}>
      <Chart
        width={width}
        height={height}
        legendData={showLegend ? legendData : []}
        legendOrientation={legendOrientation}
        legendPosition={legendPosition}
        domainPadding={{ x: [width / 10 - 25, 0] }}
        themeColor={props.themeColor || ChartThemeColor.multi}
        padding={props.padding || DEFAULT_CHART_PADDING}
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
        <ChartStack>
          {data.map((row, index: number) => (
            <ChartBar key={index} data={row} name={legendData[index]?.name} barWidth={width / 15} />
          ))}
        </ChartStack>
      </Chart>
    </div>
  );
};

export default SkChartBar;
