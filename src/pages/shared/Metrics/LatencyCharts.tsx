import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';

import SkChartArea from '@core/components/SkChartArea';
import { formatLatency } from '@core/utils/formatLatency';

import { LatencyMetrics } from './services/services.interfaces';

const LatencyCharts: FC<{ latenciesData: LatencyMetrics[] }> = memo(({ latenciesData }) => (
  <SkChartArea
    formatY={formatLatency}
    themeColor={ChartThemeColor.multi}
    legendLabels={latenciesData.map(({ label }) => label)}
    data={latenciesData.map(({ data }) => data)}
  />
));

export default LatencyCharts;
