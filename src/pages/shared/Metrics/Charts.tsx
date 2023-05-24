import { FC, memo } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardBody, CardTitle, GridItem, Icon } from '@patternfly/react-core';
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
  <>
    <GridItem span={8} rowSpan={2}>
      <Card isFullHeight>
        {!metrics.trafficDataSeriesPerSecond && <EmptyData />}
        {!!metrics.trafficDataSeriesPerSecond && (
          <>
            <CardTitle>{ProcessesLabels.ChartProcessDataTrafficSeriesAxisYLabel}</CardTitle>
            <CardBody>
              <SkChartArea
                themeColor={ChartThemeColor.orange}
                formatY={formatByteRate}
                legendLabels={[MetricsLabels.TrafficReceived, MetricsLabels.TrafficSent]}
                data={[
                  metrics.trafficDataSeriesPerSecond.timeSeriesDataReceived,
                  metrics.trafficDataSeriesPerSecond.timeSeriesDataSent
                ]}
              />
            </CardBody>
          </>
        )}
      </Card>
    </GridItem>

    {/* Total Traffic card */}
    <GridItem span={4}>
      {!metrics.trafficDataSeriesPerSecond && <EmptyData />}
      {!!metrics.trafficDataSeriesPerSecond && (
        <Card>
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
                    <CircleIcon color={`var(--pf-chart-theme--orange--ColorScale--100, #ec7a08)`} />
                  </Icon>{' '}
                  {MetricsLabels.TrafficReceived}
                </Td>
                <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.maxTrafficReceived)}</Th>
                <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.avgTrafficReceived)}</Th>
                <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.currentTrafficReceived)}</Th>
              </Tr>
              <Tr>
                <Td>
                  <Icon size="sm">
                    <CircleIcon color={`var(--pf-chart-theme--orange--ColorScale--200, #f4b678)`} />
                  </Icon>{' '}
                  {MetricsLabels.TrafficSent}
                </Td>
                <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.maxTrafficSent)}</Th>
                <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.avgTrafficSent)}</Th>
                <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.currentTrafficSent)}</Th>
              </Tr>
            </Tbody>
          </TableComposable>
        </Card>
      )}
    </GridItem>

    {/* Chart pie for the distribution of the data traffic */}
    <GridItem span={4}>
      <Card isFullHeight>
        <SkChartPie
          format={formatBytes}
          themeColor={ChartThemeColor.orange}
          data={[
            {
              x: MetricsLabels.TrafficReceived,
              y: metrics.trafficDataSeries?.totalDataReceived || 0
            },
            {
              x: MetricsLabels.TrafficSent,
              y: metrics.trafficDataSeries?.totalDataSent || 0
            }
          ]}
        />
      </Card>
    </GridItem>

    {/* Chart latencies time series card*/}
    {protocol !== AvailableProtocols.Tcp && metrics.latencies && (
      <>
        <GridItem span={12}>
          <Card isFullHeight>
            <>
              <CardTitle>{ProcessesLabels.ChartProcessLatencySeriesAxisYLabel}</CardTitle>
              <CardBody>
                <SkChartArea
                  formatY={formatLatency}
                  themeColor={ChartThemeColor.multi}
                  legendLabels={metrics.latencies.timeSeriesLatencies.map(({ label }) => label)}
                  data={metrics.latencies.timeSeriesLatencies.map(({ data }) => data)}
                />
              </CardBody>
            </>
          </Card>
        </GridItem>

        {/* Chart requests time series card*/}
        {!!metrics.requestPerSecondSeries && (
          <>
            <GridItem span={8} rowSpan={2}>
              <Card isFullHeight>
                <>
                  <CardTitle>{MetricsLabels.RequestsPerSecondsSeriesAxisYLabel}</CardTitle>
                  <CardBody>
                    <SkChartArea
                      formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
                      themeColor={ChartThemeColor.purple}
                      legendLabels={metrics.requestPerSecondSeries.map(({ label }) => label)}
                      data={metrics.requestPerSecondSeries.map(({ data }) => data)}
                    />
                  </CardBody>
                </>
              </Card>
            </GridItem>

            {/*  Partial total request card*/}
            {!!metrics.requestSeries && (
              <GridItem span={4}>
                <SkCounterCard
                  title={'Total Requests'}
                  value={metrics.requestSeries[0].totalRequestInterval}
                  bgColor={'--pf-global--palette--purple-400'}
                  colorChart={ChartThemeColor.purple}
                  showChart={false}
                />
              </GridItem>
            )}

            {/*  avg request per second card*/}
            {!!metrics.requestPerSecondSeries && (
              <GridItem span={4}>
                <SkCounterCard
                  title={'Avg. Request rate'}
                  value={metrics.requestPerSecondSeries[0].avgRequestRateInterval}
                  bgColor={'--pf-global--palette--purple-200'}
                  showChart={false}
                />
              </GridItem>
            )}
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
            {!!metrics.responseRateSeries?.statusCode4xx.data && !!metrics.responseRateSeries?.statusCode5xx.data && (
              <>
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

                <GridItem span={8}>
                  <Card isFullHeight>
                    <CardTitle>{MetricsLabels.ErrorRateSeriesAxisYLabel}</CardTitle>
                    <CardBody>
                      <SkChartArea
                        formatY={(y: number) => formatToDecimalPlacesIfCents(y, 3)}
                        themeColor={ChartThemeColor.orange}
                        legendLabels={[
                          metrics.responseRateSeries.statusCode4xx.label,
                          metrics.responseRateSeries.statusCode5xx.label
                        ]}
                        data={[
                          metrics.responseRateSeries.statusCode4xx.data,
                          metrics.responseRateSeries.statusCode5xx.data
                        ]}
                      />
                    </CardBody>
                  </Card>
                </GridItem>
              </>
            )}
          </>
        )}
      </>
    )}
  </>
));

export default Charts;
