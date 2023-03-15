import React, { FC, useCallback, useState } from 'react';

import { ChartPie, ChartThemeColor, ChartTooltip } from '@patternfly/react-charts';

import EmptyData from '@core/components/EmptyData';
import { formatBytes } from '@core/utils/formatBytes';

import { ProcessesBytesChartProps } from '../Processes.interfaces';

const CHART_PADDING = {
  bottom: -30,
  left: 0,
  right: 0,
  top: -30
};

const ChartProcessDataTrafficDistribution: FC<ProcessesBytesChartProps> = function ({ data, ...props }) {
  const [chartContainerDimension, setChartContainerDimension] = useState({ width: 0, height: 0 });

  const chartContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const dimensions = node?.getBoundingClientRect();
      setChartContainerDimension({ width: dimensions.width, height: dimensions.height });
    }
  }, []);

  const trafficDataRx = data[0];
  const trafficDataTx = data[1];
  const totalBytes = trafficDataRx.y + trafficDataTx.y;
  const trafficDataRxRate = totalBytes ? trafficDataRx.y / totalBytes : 0;
  const trafficDataTxRate = totalBytes ? trafficDataTx.y / totalBytes : 0;

  return (
    <div ref={chartContainerRef} style={{ height: `100%`, width: `100%` }}>
      {!totalBytes && <EmptyData message="Chart not available" />}
      {totalBytes && (
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
          width={chartContainerDimension.width}
          height={chartContainerDimension.height}
          themeColor={ChartThemeColor.cyan}
          {...props}
        />
      )}
    </div>
  );
};

export default ChartProcessDataTrafficDistribution;
