import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle, Grid, GridItem, Icon } from '@patternfly/react-core';
import { CircleIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { AvailableProtocols } from '@API/REST.enum';
import EmptyData from '@core/components/EmptyData';
import SkChartArea from '@core/components/SkChartArea';
import SkChartPie from '@core/components/SkChartPie';
import SkCounterCard from '@core/components/SkCounterCard';
import { convertToPercentage } from '@core/utils/convertToPercentage';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';
import { ProcessesLabels } from '@pages/Processes/Processes.enum';

import { MetricsLabels } from './Metrics.enum';
import { Metrics } from './services/services.interfaces';

const Charts: FC<{ metrics: Metrics; protocol?: AvailableProtocols }> = memo(({ metrics, protocol }) => (
  <Grid hasGutter>
    {!metrics.byteRateData && (
      <GridItem>
        <Card isFullHeight>
          <CardBody>
            <EmptyData message={MetricsLabels.NoMetricFoundMessage} />
          </CardBody>
        </Card>
      </GridItem>
    )}

    {!!metrics.byteRateData && (
      <>
        <GridItem span={8} rowSpan={2}>
          <Card isFullHeight>
            <>
              <CardTitle>{ProcessesLabels.ChartProcessDataTrafficSeriesAxisYLabel}</CardTitle>
              <CardBody>
                <SkChartArea
                  themeColor={ChartThemeColor.multi}
                  formatY={formatByteRate}
                  legendLabels={[MetricsLabels.TrafficReceived, MetricsLabels.TrafficSent]}
                  data={[metrics.byteRateData.rxTimeSerie, metrics.byteRateData.txTimeSerie]}
                />
              </CardBody>
            </>
          </Card>
        </GridItem>

        {/* Total Traffic card */}
        <GridItem span={4}>
          {!!metrics.byteRateData && (
            <Card isFullHeight>
              <CardBody>
                <TableComposable borders={false} variant="compact">
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
                          <CircleIcon color={`var(--pf-chart-theme--multi-color-ordered--ColorScale--100, #06c)`} />
                        </Icon>{' '}
                        {MetricsLabels.TrafficReceived}
                      </Td>
                      <Th>{formatByteRate(metrics.byteRateData.maxRxValue)}</Th>
                      <Th>{formatByteRate(metrics.byteRateData.avgRxValue)}</Th>
                      <Th>{formatByteRate(metrics.byteRateData.currentRxValue)}</Th>
                    </Tr>
                    <Tr>
                      <Td>
                        <Icon size="sm">
                          <CircleIcon color={`var(--pf-chart-theme--multi-color-ordered--ColorScale--200, #4cb140)`} />
                        </Icon>{' '}
                        {MetricsLabels.TrafficSent}
                      </Td>
                      <Th>{formatByteRate(metrics.byteRateData.maxTxValue)}</Th>
                      <Th>{formatByteRate(metrics.byteRateData.avgTxValue)}</Th>
                      <Th>{formatByteRate(metrics.byteRateData.currentTxValue)}</Th>
                    </Tr>
                  </Tbody>
                </TableComposable>
              </CardBody>
            </Card>
          )}
        </GridItem>

        {/* Chart pie for the distribution of the data traffic */}
        <GridItem span={4}>
          {!!metrics.bytesData && (
            <Card isFullHeight>
              <SkChartPie
                format={formatBytes}
                themeColor={ChartThemeColor.multi}
                data={[
                  {
                    x: MetricsLabels.TrafficReceived,
                    y: metrics.bytesData.bytesRx
                  },
                  {
                    x: MetricsLabels.TrafficSent,
                    y: metrics.bytesData?.bytesTx
                  }
                ]}
              />
            </Card>
          )}
        </GridItem>
      </>
    )}
    {/* Chart latencies time series card*/}
    {protocol !== AvailableProtocols.Tcp && (
      <>
        {!!metrics.latenciesData && (
          <GridItem span={12}>
            <Card isFullHeight>
              <CardTitle>{ProcessesLabels.ChartProcessLatencySeriesAxisYLabel}</CardTitle>
              <CardBody>
                <SkChartArea
                  formatY={formatLatency}
                  themeColor={ChartThemeColor.multi}
                  legendLabels={metrics.latenciesData.map(({ label }) => label)}
                  data={metrics.latenciesData.map(({ data }) => data)}
                />
              </CardBody>
            </Card>
          </GridItem>
        )}
        {/* Chart requests time series card*/}
        {!!metrics.requestRateData && (
          <>
            <GridItem span={8} rowSpan={2}>
              <Card isFullHeight>
                <CardTitle>{MetricsLabels.RequestsPerSecondsSeriesAxisYLabel}</CardTitle>
                <CardBody>
                  <SkChartArea
                    formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
                    themeColor={ChartThemeColor.purple}
                    legendLabels={metrics.requestRateData.map(({ label }) => label)}
                    data={metrics.requestRateData.map(({ data }) => data)}
                  />
                </CardBody>
              </Card>
            </GridItem>

            {/*  Partial total request card*/}
            <GridItem span={4}>
              <SkCounterCard
                title={'Total Requests'}
                value={metrics.totalRequestsInterval}
                bgColor={'--pf-global--palette--purple-400'}
                colorChart={ChartThemeColor.purple}
                showChart={false}
              />
            </GridItem>

            {/*  avg request per second card*/}
            <GridItem span={4}>
              <SkCounterCard
                title={'Avg. Request rate'}
                value={metrics.avgRequestRateInterval}
                bgColor={'--pf-global--palette--purple-200'}
                showChart={false}
              />
            </GridItem>
          </>
        )}

        {/*  response card*/}
        {!!metrics.responseData && (
          <>
            <GridItem span={3}>
              <SkCounterCard
                title={metrics.responseData.statusCode2xx.label}
                value={
                  convertToPercentage(metrics.responseData.statusCode2xx.total, metrics.responseData.total) || ' - '
                }
                bgColor={'--pf-global--palette--green-400'}
                showChart={false}
              />
            </GridItem>
            <GridItem span={3}>
              <SkCounterCard
                title={metrics.responseData.statusCode3xx.label}
                value={
                  convertToPercentage(metrics.responseData.statusCode3xx.total, metrics.responseData.total) || ' - '
                }
                bgColor={'--pf-global--palette--blue-400'}
                showChart={false}
              />
            </GridItem>
            <GridItem span={3}>
              <SkCounterCard
                title={metrics.responseData.statusCode4xx.label}
                value={
                  convertToPercentage(metrics.responseData.statusCode4xx.total, metrics.responseData.total) || ' - '
                }
                bgColor={'--pf-global--palette--orange-100'}
                showChart={false}
              />
            </GridItem>
            <GridItem span={3}>
              <SkCounterCard
                title={metrics.responseData.statusCode5xx.label}
                value={
                  convertToPercentage(metrics.responseData.statusCode5xx.total, metrics.responseData.total) || ' - '
                }
                bgColor={'--pf-global--palette--red-100'}
                showChart={false}
              />
            </GridItem>

            {/* Chart pie distribution data traffic card and total bytes */}
            <>
              {!!(metrics.responseData.statusCode4xx.total + metrics.responseData.statusCode5xx.total) && (
                <GridItem span={4}>
                  <Card isFullHeight>
                    <SkChartPie
                      format={formatBytes}
                      data={[
                        {
                          x: metrics.responseData.statusCode4xx.label,
                          y: metrics.responseData.statusCode4xx.total
                        },
                        {
                          x: metrics.responseData.statusCode5xx.label,
                          y: metrics.responseData.statusCode5xx.total
                        }
                      ]}
                    />
                  </Card>
                </GridItem>
              )}
              {!!metrics.responseRateData?.statusCode4xx.data && (
                <GridItem span={4}>
                  <Card isFullHeight>
                    <CardTitle>{MetricsLabels.ClientErrorRateSeriesAxisYLabel}</CardTitle>
                    <CardBody>
                      <SkChartArea
                        formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
                        themeColor={ChartThemeColor.orange}
                        legendLabels={[metrics.responseRateData.statusCode4xx.label]}
                        data={[metrics.responseRateData.statusCode4xx.data]}
                      />
                    </CardBody>
                  </Card>
                </GridItem>
              )}

              {!!metrics.responseRateData?.statusCode5xx?.data && (
                <GridItem span={4}>
                  <Card isFullHeight>
                    <CardTitle>{MetricsLabels.ServerErrorRateSeriesAxisYLabel}</CardTitle>
                    <CardBody>
                      <SkChartArea
                        formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
                        themeColor={ChartThemeColor.orange}
                        legendLabels={[metrics.responseRateData.statusCode5xx.label]}
                        data={[metrics.responseRateData.statusCode5xx.data]}
                      />
                    </CardBody>
                  </Card>
                </GridItem>
              )}
            </>
          </>
        )}
      </>
    )}
  </Grid>
));

export default Charts;
