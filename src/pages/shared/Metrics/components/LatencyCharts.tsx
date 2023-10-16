import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Grid, GridItem, Title } from '@patternfly/react-core';

import SkChartArea from '@core/components/SkChartArea';
import SkChartBar from '@core/components/SkChartBar';
import { formatLatency } from '@core/utils/formatLatency';

import { LantencyBucketMetrics, LatencyMetrics } from '../services/services.interfaces';

const LatencyCharts: FC<{ latenciesData: LatencyMetrics[]; bucketsData: LantencyBucketMetrics[] }> = memo(
  ({ latenciesData, bucketsData }) => (
    <Grid hasGutter>
      <GridItem rowSpan={2} md={8}>
        <Title headingLevel="h4">Percentiles</Title>
        <SkChartArea
          formatY={formatLatency}
          themeColor={ChartThemeColor.multi}
          legendLabels={latenciesData.map(({ label }) => label)}
          data={latenciesData.map(({ data }) => data)}
        />
      </GridItem>

      <GridItem md={4}>test</GridItem>

      <GridItem md={8}>
        <Title headingLevel="h4">Distribution across buckets</Title>
        <SkChartBar
          themeColor={ChartThemeColor.multi}
          legendLabels={bucketsData.map(({ label }) => label)}
          data={bucketsData.map(({ data }) => data)}
        />
      </GridItem>
    </Grid>
  )
);

export default LatencyCharts;
