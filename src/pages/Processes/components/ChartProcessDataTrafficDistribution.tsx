import React, { FC, useEffect, useRef, useState } from 'react';

import { ChartPie, ChartThemeColor, ChartTooltip, getResizeObserver } from '@patternfly/react-charts';

import EmptyData from '@core/components/EmptyData';
import { formatBytes } from '@core/utils/formatBytes';

import { ProcessesBytesChartProps } from '../Processes.interfaces';

const CHART_PADDING = {
  bottom: 10,
  left: 0,
  right: 0,
  top: 10
};

const ChartProcessDataTrafficDistribution: FC<ProcessesBytesChartProps> = function ({ data, ...props }) {
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

  const trafficDataRx = data[0];
  const trafficDataTx = data[1];
  const totalBytes = trafficDataRx.y + trafficDataTx.y;
  const trafficDataRxRate = totalBytes ? trafficDataRx.y / totalBytes : 0;
  const trafficDataTxRate = totalBytes ? trafficDataTx.y / totalBytes : 0;

  return (
    <div ref={chartContainerRef} style={{ height: `100%`, width: `100%` }}>
      {!totalBytes && <EmptyData message="Data traffic not available" />}
      {!!totalBytes && (
        <ChartPie
          data={data}
          labels={[
            `${trafficDataRx.x}: ${formatBytes(trafficDataRx.y)}`,
            `${trafficDataTx.x}: ${formatBytes(trafficDataTx.y)}`
          ]}
          labelComponent={
            <ChartTooltip
              cornerRadius={5}
              flyoutStyle={{
                fillOpacity: 0.75
              }}
            />
          }
          padding={CHART_PADDING}
          legendData={[
            {
              name: `${trafficDataRx.x}: ${Math.round(trafficDataRxRate * 100)}%`
            },
            {
              name: `${trafficDataTx.x}: ${Math.round(trafficDataTxRate * 100)}%`
            }
          ]}
          legendOrientation="vertical"
          legendPosition="right"
          width={width}
          themeColor={ChartThemeColor.cyan}
          {...props}
        />
      )}
    </div>
  );
};

export default ChartProcessDataTrafficDistribution;
