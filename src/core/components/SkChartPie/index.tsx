import { FC, useEffect, useRef, useState } from 'react';

import { ChartDonut, ChartThemeColor, ChartTooltip, getResizeObserver } from '@patternfly/react-charts';

import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';

import { SkChartPieProps } from './ChartPie.interfaces';

const CHART_PADDING = {
  bottom: 70,
  left: 0,
  right: 0,
  top: 10
};

const SkChartPie: FC<SkChartPieProps> = function ({ data, format = (y: number) => y, ...props }) {
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

  const total = data.reduce((acc, { y }) => acc + y, 0);
  const labels = data.map(({ x, y }) => `${x}: ${format(y)}`);
  const legendData = data.map(({ x, y }) => ({
    name: `${x}: ${total ? formatToDecimalPlacesIfCents((y * 100) / total, 1) : 0}%`
  }));

  return (
    <div ref={chartContainerRef} style={{ height: `100%`, width: `100%` }}>
      <ChartDonut
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
        padding={CHART_PADDING}
        legendData={legendData}
        legendOrientation="horizontal"
        legendPosition="bottom"
        width={width}
        themeColor={ChartThemeColor.cyan}
        {...props}
      />
    </div>
  );
};

export default SkChartPie;
