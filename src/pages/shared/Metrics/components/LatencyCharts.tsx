import { FC, memo } from 'react';

import { Stack, StackItem, Title } from '@patternfly/react-core';

import SkChartArea from '../../../../core/components/SkChartArea';
import { formatLatency } from '../../../../core/utils/formatLatency';
import { LatencyMetrics } from '../../../../types/Metrics.interfaces';

const LatencyCharts: FC<{
  latenciesData: LatencyMetrics[];
  title: string;
}> = memo(({ latenciesData, title }) => (
  <Stack hasGutter>
    <StackItem>
      <Title headingLevel="h4">{title}</Title>
      <SkChartArea
        formatY={formatLatency}
        legendLabels={latenciesData.map(({ label }) => label)}
        data={latenciesData.map(({ data }) => data)}
        isChartLine={true}
      />
    </StackItem>
  </Stack>
));

export default LatencyCharts;
