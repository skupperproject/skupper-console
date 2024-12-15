import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts/victory';
import { Grid, GridItem, Title } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Labels } from '../../../../config/labels';
import SkChartArea from '../../../../core/components/SkChartArea';
import SkChartBar from '../../../../core/components/SkChartBar';
import { formatLatency } from '../../../../core/utils/formatLatency';
import { formatNumber } from '../../../../core/utils/formatNumber';
import {
  LatencyBucketDistributionData,
  LatencyBucketSummary,
  LatencyMetrics
} from '../../../../types/Metrics.interfaces';

const LatencyCharts: FC<{
  latenciesData: LatencyMetrics[];
  bucketsData: LatencyBucketDistributionData[];
  summary: LatencyBucketSummary[];
}> = memo(({ latenciesData, bucketsData, summary }) => (
  <Grid hasGutter>
    <GridItem span={12}>
      <Title headingLevel="h4">{Labels.PercentileOverTime}</Title>
      <SkChartArea
        formatY={formatLatency}
        themeColor={ChartThemeColor.multi}
        legendLabels={latenciesData.map(({ label }) => label)}
        data={latenciesData.map(({ data }) => data)}
      />
    </GridItem>

    <GridItem md={12} xl={8}>
      <SkChartBar
        themeColor={ChartThemeColor.multi}
        legendLabels={bucketsData.map(({ label }) => label)}
        data={bucketsData.map(({ data }) => data)}
      />
    </GridItem>

    <GridItem md={12} xl={4}>
      <Table borders={false} variant="compact">
        <Thead noWrap>
          <Tr>
            <Th>Threshold</Th>
            <Th>Below</Th>
            <Th>Above</Th>
          </Tr>
        </Thead>

        <Tbody>
          {summary.map((row, index) => (
            <Tr key={`${row.bound}-${index}`}>
              <Td>
                <Title headingLevel="h6">{row.bound}</Title>
              </Td>
              <Td>{`${formatNumber(row.lessThanCount)} (${row.lessThanPerc}%)`}</Td>
              <Td modifier="fitContent">{`${formatNumber(row.greaterThanCount)}`}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </GridItem>
  </Grid>
));

export default LatencyCharts;
