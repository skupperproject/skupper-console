import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle, Grid, GridItem, Icon } from '@patternfly/react-core';
import { CircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { VarColors } from '@config/colors';
import SkChartArea from '@core/components/SkChartArea';
import SkChartPie from '@core/components/SkChartPie';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';

import { MetricsLabels } from './Metrics.enum';
import { ByteRateMetrics, BytesMetric } from './services/services.interfaces';

const TrafficCharts: FC<{ byteRateData: ByteRateMetrics; bytesData: BytesMetric }> = memo(
  ({ byteRateData, bytesData }) => (
    <Grid hasGutter md={12}>
      <GridItem xl={7} rowSpan={2}>
        <Card isFullHeight>
          <CardTitle>{MetricsLabels.DataTransferTitle}</CardTitle>
          <CardBody>
            <SkChartArea
              formatY={formatByteRate}
              legendLabels={[MetricsLabels.TrafficReceived, MetricsLabels.TrafficSent]}
              data={[byteRateData.rxTimeSerie, byteRateData.txTimeSerie]}
            />
          </CardBody>
        </Card>
      </GridItem>

      {/* Total Traffic card */}
      <GridItem xl={5} md={6}>
        <Card isFullHeight>
          <CardBody>
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
                  <Td>
                    <Icon size="sm">
                      <CircleIcon color={VarColors.Blue400} />
                    </Icon>{' '}
                    {MetricsLabels.TrafficReceived}
                  </Td>
                  <Th>{formatByteRate(byteRateData.maxRxValue)}</Th>
                  <Th>{formatByteRate(byteRateData.avgRxValue)}</Th>
                  <Th>{formatByteRate(byteRateData.currentRxValue)}</Th>
                </Tr>
                <Tr>
                  <Td>
                    <Icon size="sm">
                      <CircleIcon color={VarColors.Green500} />
                    </Icon>{' '}
                    {MetricsLabels.TrafficSent}
                  </Td>
                  <Th>{formatByteRate(byteRateData.maxTxValue)}</Th>
                  <Th>{formatByteRate(byteRateData.avgTxValue)}</Th>
                  <Th>{formatByteRate(byteRateData.currentTxValue)}</Th>
                </Tr>
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </GridItem>

      {/* Chart pie for the distribution of the data traffic */}
      <GridItem xl={5} md={6}>
        <Card isFullHeight>
          <CardBody>
            <SkChartPie
              format={formatBytes}
              themeColor={ChartThemeColor.multi}
              data={[
                {
                  x: MetricsLabels.TrafficReceived,
                  y: bytesData.bytesRx
                },
                {
                  x: MetricsLabels.TrafficSent,
                  y: bytesData?.bytesTx
                }
              ]}
            />
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  )
);

export default TrafficCharts;
