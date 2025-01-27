import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts/victory';
import { Divider, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Labels } from '../../../../config/labels';
import { styles } from '../../../../config/styles';
import SkChartArea from '../../../../core/components/SkChartArea';
import SkChartPie from '../../../../core/components/SkChartPie';
import { formatByteRate, formatBytes } from '../../../../core/utils/formatBytes';
import { ByteRateMetrics } from '../../../../types/Metrics.interfaces';
import { MetricsController } from '../services';

const TrafficCharts: FC<{ byteRateData: ByteRateMetrics; colorScale?: string[] }> = memo(
  ({ byteRateData, colorScale }) => (
    <Flex direction={{ xl: 'row', default: 'column' }} style={{ alignItems: 'center' }}>
      <FlexItem flex={{ default: 'flex_2' }}>
        <Flex>
          <SkChartArea
            colorScale={colorScale && [colorScale[0]]}
            formatY={formatByteRate}
            legendLabels={[Labels.Inbound]}
            height={250}
            data={MetricsController.fillMissingDataWithZeros(byteRateData.rxTimeSerie?.data)}
          />

          <SkChartArea
            colorScale={colorScale && [colorScale[1]]}
            themeColor={ChartThemeColor.green}
            formatY={formatByteRate}
            legendLabels={[Labels.Outbound]}
            height={250}
            data={MetricsController.fillMissingDataWithZeros(byteRateData.txTimeSerie?.data)}
          />
        </Flex>
      </FlexItem>

      <Divider orientation={{ default: 'vertical' }} />

      <FlexItem flex={{ xl: 'flex_1' }}>
        <Flex>
          <Table borders={false}>
            <Thead noWrap>
              <Tr>
                <Th aria-label="metric" />
                <Th>{Labels.ByteRateMinCol}</Th>
                <Th>{Labels.ByteRateMaxCol}</Th>
                <Th>{Labels.ByteRateAvgCol}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td style={{ fontWeight: styles.default.fontLightBold.value }}>{Labels.Inbound}</Td>
                <Td>{formatByteRate(byteRateData?.minRxValue || 0)}</Td>
                <Td>{formatByteRate(byteRateData?.maxRxValue || 0)}</Td>
                <Td>{formatByteRate(byteRateData?.avgRxValue || 0)}</Td>
              </Tr>
              <Tr>
                <Td style={{ fontWeight: styles.default.fontLightBold.value }}>{Labels.Outbound}</Td>
                <Td>{formatByteRate(byteRateData?.minTxValue || 0)}</Td>
                <Td>{formatByteRate(byteRateData?.maxTxValue || 0)}</Td>
                <Td>{formatByteRate(byteRateData?.avgTxValue || 0)}</Td>
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
                x: Labels.BytesIn,
                y: byteRateData?.totalRxValue || 0
              },
              {
                x: Labels.BytesOut,
                y: byteRateData?.totalTxValue || 0
              }
            ]}
          />
        </Flex>
      </FlexItem>
    </Flex>
  )
);

export default TrafficCharts;
