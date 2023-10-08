import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Divider, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import SkChartArea from '@core/components/SkChartArea';
import { skAxisXY } from '@core/components/SkChartArea/SkChartArea.interfaces';
import SkChartPie from '@core/components/SkChartPie';
import { formatByteRate } from '@core/utils/formatBytes';

import { MetricsLabels } from '../Metrics.enum';
import { ByteRateMetrics } from '../services/services.interfaces';

/**
  If one of the two series is empty, it should be filled with values where y=0 and x equals the timestamp of the other series.
  This prevents 'skipping' a series and maintains consistency with other metrics related to bytes/rate.
 */
function normalizeDataXaxis(rx: skAxisXY[] = [], tx: skAxisXY[] = []) {
  if (!rx?.length && tx?.length) {
    const rxNormalized = tx.map(({ x }) => ({
      y: 0,
      x
    }));

    return [rxNormalized, tx];
  }

  if (!tx?.length && rx?.length) {
    const txNormalized = rx.map(({ x }) => ({
      y: 0,
      x
    }));

    return [rx, txNormalized];
  }

  return [rx, tx];
}

const TrafficCharts: FC<{ byteRateData: ByteRateMetrics }> = memo(({ byteRateData }) => (
  <Flex direction={{ xl: 'row', md: 'column' }}>
    <FlexItem flex={{ default: 'flex_2' }}>
      <SkChartArea
        formatY={formatByteRate}
        legendLabels={[MetricsLabels.TrafficReceived, MetricsLabels.TrafficSent]}
        data={normalizeDataXaxis(byteRateData.rxTimeSerie?.data, byteRateData.txTimeSerie?.data)}
      />
    </FlexItem>

    <Divider orientation={{ default: 'vertical' }} />

    <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfFlexStart' }}>
      <Table borders={false} variant="compact">
        <Thead noWrap>
          <Tr>
            <Th />
            <Th>{MetricsLabels.ByteRateMaxCol}</Th>
            <Th>{MetricsLabels.ByteRateAvgCol}</Th>
            <Th>{MetricsLabels.ByteRateCurrentCol}</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>{MetricsLabels.TrafficReceived}</Td>
            <Th>{formatByteRate(byteRateData?.maxRxValue || 0)}</Th>
            <Th>{formatByteRate(byteRateData?.avgRxValue || 0)}</Th>
            <Th>{formatByteRate(byteRateData?.currentRxValue || 0)}</Th>
          </Tr>
          <Tr>
            <Td>{MetricsLabels.TrafficSent}</Td>
            <Th>{formatByteRate(byteRateData?.maxTxValue || 0)}</Th>
            <Th>{formatByteRate(byteRateData?.avgTxValue || 0)}</Th>
            <Th>{formatByteRate(byteRateData?.currentTxValue || 0)}</Th>
          </Tr>
        </Tbody>
      </Table>

      <Divider orientation={{ default: 'horizontal' }} />

      <SkChartPie
        format={formatByteRate}
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
    </FlexItem>
  </Flex>
));

export default TrafficCharts;
