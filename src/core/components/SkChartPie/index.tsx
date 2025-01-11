import { FC, useEffect, useRef, useState } from 'react';

import { ChartDonutProps, ChartDonut, ChartThemeColor, ChartTooltip } from '@patternfly/react-charts/victory';
import { getResizeObserver } from '@patternfly/react-core';

import { formatToDecimalPlacesIfCents } from '../../utils/formatToDecimalPlacesIfCents';

const DEFAULT_CHART_PADDING = {
  bottom: 40,
  left: 40,
  right: 40,
  top: 40
};

interface SkChartPieProps extends ChartDonutProps {
  data: { x: string; y: number }[];
  format?: Function;
}

const SkChartPie: FC<SkChartPieProps> = function ({
  data,
  legendOrientation = 'horizontal',
  legendPosition = 'bottom',
  format = (y: number) => y,
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

  const total = data.reduce((acc, { y }) => acc + y, 0);
  const labels = data.map(({ x, y }) => `${x}: ${format(y)}`);
  const legendData = data.map(({ x, y }) => ({
    name: `${x}:  ${total ? formatToDecimalPlacesIfCents((y * 100) / total, 1) : 0}%`
  }));

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: `100%` }}>
      <ChartDonut
        width={width}
        height={height}
        legendAllowWrap
        title={format(total)}
        data={data}
        labels={labels}
        labelComponent={
          <ChartTooltip
            cornerRadius={5}
            flyoutStyle={{
              fillOpacity: 0.75
            }}
          />
        }
        legendOrientation={legendOrientation}
        legendPosition={legendPosition}
        legendData={legendData}
        padding={props.padding || DEFAULT_CHART_PADDING}
        themeColor={ChartThemeColor.multi}
        {...props}
      />
    </div>
  );
};

export default SkChartPie;
