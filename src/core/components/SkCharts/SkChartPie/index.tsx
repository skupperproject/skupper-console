import { FC } from 'react';

import { ChartDonut, ChartDonutProps, ChartTooltip } from '@patternfly/react-charts/victory';

import { CHART_CONFIG } from './SkChartPie.constants';
import { useChartDimensions } from '../../../../hooks/useChartDimensions';
import { formatToDecimalPlacesIfCents } from '../../../utils/formatToDecimalPlacesIfCents';

export interface SkChartPieProps extends ChartDonutProps {
  data: { x: string; y: number }[];
  format?: Function;
  padding?: Record<string, string>;
}

const SkChartPie: FC<SkChartPieProps> = function ({
  data,
  legendOrientation = 'horizontal',
  legendPosition = 'bottom',
  format = (y: number) => y,
  height = CHART_CONFIG.LAYOUT.DEFAULT_HEIGHT,
  padding = CHART_CONFIG.LAYOUT.DEFAULT_PADDING,
  ...props
}) {
  const { chartWidth, chartContainerRef } = useChartDimensions();

  const total = data.reduce((acc, { y }) => acc + y, 0);
  const labels = data.map(({ x, y }) => `${x}: ${format(y)}`);
  const legendData = data.map(({ x, y }) => ({
    name: `${x}:  ${total ? formatToDecimalPlacesIfCents((y * 100) / total, 1) : 0}%`
  }));

  return (
    <div ref={chartContainerRef} style={{ width: `100%`, height: `${height}px` }}>
      <ChartDonut
        width={chartWidth}
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
        padding={padding}
        {...props}
      />
    </div>
  );
};

export default SkChartPie;
