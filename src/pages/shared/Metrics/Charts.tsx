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
    {!metrics.byteRate && (
      <GridItem>
        <Card isFullHeight>
          <CardBody>
            <EmptyData message={MetricsLabels.NoMetricFoundMessage} />
          </CardBody>
        </Card>
      </GridItem>
    )}

    {!!metrics.byteRate && (
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
                  data={[metrics.byteRate.rxTimeSerie, metrics.byteRate.txTimeSerie]}
                />
              </CardBody>
            </>
          </Card>
        </GridItem>

        {/* Total Traffic card */}
        <GridItem span={4}>
          {!!metrics.byteRate && (
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
                      <Th>{formatByteRate(metrics.byteRate.maxRxValue)}</Th>
                      <Th>{formatByteRate(metrics.byteRate.avgRxValue)}</Th>
                      <Th>{formatByteRate(metrics.byteRate.currentRxValue)}</Th>
                    </Tr>
                    <Tr>
                      <Td>
                        <Icon size="sm">
                          <CircleIcon color={`var(--pf-chart-theme--multi-color-ordered--ColorScale--200, #4cb140)`} />
                        </Icon>{' '}
                        {MetricsLabels.TrafficSent}
                      </Td>
                      <Th>{formatByteRate(metrics.byteRate.maxTxValue)}</Th>
                      <Th>{formatByteRate(metrics.byteRate.avgTxValue)}</Th>
                      <Th>{formatByteRate(metrics.byteRate.currentTxValue)}</Th>
                    </Tr>
                  </Tbody>
                </TableComposable>
              </CardBody>
            </Card>
          )}
        </GridItem>

        {/* Chart pie for the distribution of the data traffic */}
        <GridItem span={4}>
          {!!metrics.bytes && (
            <Card isFullHeight>
              <SkChartPie
                format={formatBytes}
                themeColor={ChartThemeColor.multi}
                data={[
                  {
                    x: MetricsLabels.TrafficReceived,
                    y: metrics.bytes.bytesRx
                  },
                  {
                    x: MetricsLabels.TrafficSent,
                    y: metrics.bytes?.bytesTx
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
        {!!metrics.latencies && (
          <GridItem span={12}>
            <Card isFullHeight>
              <CardTitle>{ProcessesLabels.ChartProcessLatencySeriesAxisYLabel}</CardTitle>
              <CardBody>
                <SkChartArea
                  formatY={formatLatency}
                  themeColor={ChartThemeColor.multi}
                  legendLabels={metrics.latencies.timeSeriesLatencies.map(({ label }) => label)}
                  data={metrics.latencies.timeSeriesLatencies.map(({ data }) => data)}
                />
              </CardBody>
            </Card>
          </GridItem>
        )}
        {/* Chart requests time series card*/}
        {!!metrics.requestPerSecondSeries && (
          <>
            <GridItem span={8} rowSpan={2}>
              <Card isFullHeight>
                <CardTitle>{MetricsLabels.RequestsPerSecondsSeriesAxisYLabel}</CardTitle>
                <CardBody>
                  <SkChartArea
                    formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
                    themeColor={ChartThemeColor.purple}
                    legendLabels={metrics.requestPerSecondSeries.map(({ label }) => label)}
                    data={metrics.requestPerSecondSeries.map(({ data }) => data)}
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
        {!!metrics.responseSeries && (
          <>
            <GridItem span={3}>
              <SkCounterCard
                title={metrics.responseSeries.statusCode2xx.label}
                value={
                  convertToPercentage(metrics.responseSeries.statusCode2xx.total, metrics.responseSeries.total) || ' - '
                }
                bgColor={'--pf-global--palette--green-400'}
                showChart={false}
              />
            </GridItem>
            <GridItem span={3}>
              <SkCounterCard
                title={metrics.responseSeries.statusCode3xx.label}
                value={
                  convertToPercentage(metrics.responseSeries.statusCode3xx.total, metrics.responseSeries.total) || ' - '
                }
                bgColor={'--pf-global--palette--blue-400'}
                showChart={false}
              />
            </GridItem>
            <GridItem span={3}>
              <SkCounterCard
                title={metrics.responseSeries.statusCode4xx.label}
                value={
                  convertToPercentage(metrics.responseSeries.statusCode4xx.total, metrics.responseSeries.total) || ' - '
                }
                bgColor={'--pf-global--palette--orange-100'}
                showChart={false}
              />
            </GridItem>
            <GridItem span={3}>
              <SkCounterCard
                title={metrics.responseSeries.statusCode5xx.label}
                value={
                  convertToPercentage(metrics.responseSeries.statusCode5xx.total, metrics.responseSeries.total) || ' - '
                }
                bgColor={'--pf-global--palette--red-100'}
                showChart={false}
              />
            </GridItem>

            {/* Chart pie distribution data traffic card and total bytes */}
            <>
              {!!(metrics.responseSeries.statusCode4xx.total + metrics.responseSeries.statusCode5xx.total) && (
                <GridItem span={4}>
                  <Card isFullHeight>
                    <SkChartPie
                      format={formatBytes}
                      data={[
                        {
                          x: metrics.responseSeries.statusCode4xx.label,
                          y: metrics.responseSeries.statusCode4xx.total
                        },
                        {
                          x: metrics.responseSeries.statusCode5xx.label,
                          y: metrics.responseSeries.statusCode5xx.total
                        }
                      ]}
                    />
                  </Card>
                </GridItem>
              )}
              {!!metrics.responseRateSeries?.statusCode4xx.data && (
                <GridItem span={4}>
                  <Card isFullHeight>
                    <CardTitle>{MetricsLabels.ClientErrorRateSeriesAxisYLabel}</CardTitle>
                    <CardBody>
                      <SkChartArea
                        formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
                        themeColor={ChartThemeColor.orange}
                        legendLabels={[metrics.responseRateSeries.statusCode4xx.label]}
                        data={[metrics.responseRateSeries.statusCode4xx.data]}
                      />
                    </CardBody>
                  </Card>
                </GridItem>
              )}

              {!!metrics.responseRateSeries?.statusCode5xx?.data && (
                <GridItem span={4}>
                  <Card isFullHeight>
                    <CardTitle>{MetricsLabels.ServerErrorRateSeriesAxisYLabel}</CardTitle>
                    <CardBody>
                      <SkChartArea
                        formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
                        themeColor={ChartThemeColor.orange}
                        legendLabels={[metrics.responseRateSeries.statusCode5xx.label]}
                        data={[metrics.responseRateSeries.statusCode5xx.data]}
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
