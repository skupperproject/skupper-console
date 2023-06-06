import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import SkChartArea from '@core/components/SkChartArea';
import { formatLatency } from '@core/utils/formatLatency';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';

import { LatencyMetrics } from './services/services.interfaces';

const LatencyCharts: FC<{ latenciesData: LatencyMetrics[] }> = memo(({ latenciesData }) => (
  <Card isFullHeight>
    <CardTitle>{ProcessesLabels.ChartProcessLatencySeriesAxisYLabel}</CardTitle>
    <CardBody>
      <SkChartArea
        formatY={formatLatency}
        themeColor={ChartThemeColor.multi}
        legendLabels={latenciesData.map(({ label }) => label)}
        data={latenciesData.map(({ data }) => data)}
      />
    </CardBody>
  </Card>
));

export default LatencyCharts;
