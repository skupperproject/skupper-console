import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts/victory';
import { Divider, Flex } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import SkChartArea from '../../../../core/components/SkChartArea';
import SkChartPie from '../../../../core/components/SkChartPie';
import { formatByteRate, formatBytes } from '../../../../core/utils/formatBytes';
import { ByteRateMetrics } from '../../../../types/Metrics.interfaces';
import { MetricsLabels } from '../Metrics.enum';
import { MetricsController } from '../services';

const TrafficCharts: FC<{ byteRateData: ByteRateMetrics; colorScale?: string[] }> = memo(
  ({ byteRateData, colorScale }) => (
    <Flex direction={{ xl: 'row', md: 'column' }} style={{ alignItems: 'center' }}>
      <Flex flex={{ default: 'flex_2' }}>
        <SkChartArea
          colorScale={colorScale && [colorScale[0]]}
          formatY={formatByteRate}
          legendLabels={[MetricsLabels.TrafficReceived]}
          height={250}
          data={MetricsController.fillMissingDataWithZeros(byteRateData.rxTimeSerie?.data)}
        />

        <SkChartArea
          colorScale={colorScale && [colorScale[1]]}
          themeColor={ChartThemeColor.green}
          formatY={formatByteRate}
          legendLabels={[MetricsLabels.TrafficSent]}
          height={250}
          data={MetricsController.fillMissingDataWithZeros(byteRateData.txTimeSerie?.data)}
        />
      </Flex>

      <Divider orientation={{ default: 'vertical' }} />

      <Flex flex={{ default: 'flex_1' }}>
        <Table borders={false} variant="compact">
          <Thead noWrap>
            <Tr>
              <Th aria-label="metric" />
              <Th>{MetricsLabels.ByteRateMaxCol}</Th>
              <Th>{MetricsLabels.ByteRateAvgCol}</Th>
              <Th>{MetricsLabels.ByteRateCurrentCol}</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{MetricsLabels.TrafficReceived}</Td>
              <Td>{formatByteRate(byteRateData?.maxRxValue || 0)}</Td>
              <Td>{formatByteRate(byteRateData?.avgRxValue || 0)}</Td>
              <Td>{formatByteRate(byteRateData?.currentRxValue || 0)}</Td>
            </Tr>
            <Tr>
              <Td>{MetricsLabels.TrafficSent}</Td>
              <Td>{formatByteRate(byteRateData?.maxTxValue || 0)}</Td>
              <Td>{formatByteRate(byteRateData?.avgTxValue || 0)}</Td>
              <Td>{formatByteRate(byteRateData?.currentTxValue || 0)}</Td>
            </Tr>
          </Tbody>
        </Table>

        <Divider orientation={{ default: 'horizontal' }} />

        <SkChartPie
          colorScale={colorScale}
          format={formatBytes}
          themeColor={ChartThemeColor.multi}
          data={[
            {
              x: MetricsLabels.TrafficReceived,
              y: byteRateData?.totalRxValue || 0
            },
            {
              x: MetricsLabels.TrafficSent,
              y: byteRateData?.totalTxValue || 0
            }
          ]}
        />
      </Flex>
    </Flex>
  )
);

export default TrafficCharts;
