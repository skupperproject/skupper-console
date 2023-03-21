import React, { FC, useMemo, useState } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Icon,
  Select,
  SelectOption,
  SelectOptionObject,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { CircleIcon, ClockIcon, ClusterIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import { formatByteRate } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { defaultTimeInterval, timeIntervalMap } from 'API/Prometheus.constant';
import { ValidWindowTimeValues } from 'API/Prometheus.interfaces';
import { AvailableProtocols } from 'API/REST.enum';

import ChartProcessDataTrafficDistribution from './ChartProcessDataTrafficDistribution';
import ChartProcessDataTrafficSeries from './ChartProcessDataTrafficSeries';
import MetricCard from './MetricCard';
import { ProcessesLabels } from '../Processes.enum';
import { MetricsProps } from '../Processes.interfaces';
import ProcessesController, { formatPercentage } from '../services';
import { QueriesProcesses } from '../services/services.enum';

const filterOptionsDefault = {
  protocols: { disabled: false, name: ProcessesLabels.FilterProtocolsDefault },
  timeIntervals: { disabled: false },
  destinationProcesses: { disabled: false, name: ProcessesLabels.FilterProcessesConnectedDefault }
};

const Metrics: FC<MetricsProps> = function ({ parent, processesConnected, protocolDefault, customFilters }) {
  const navigate = useNavigate();

  const filterOptions = { ...filterOptionsDefault, ...customFilters };

  const [isOpenDestinationProcessMenu, setIsOpenDestinationProcessMenu] = useState<boolean>(false);
  const [isOpenTimeInterval, setIsOpenTimeIntervalMenu] = useState<boolean>(false);
  const [isOpenProtocolInterval, setIsOpenProtocolIntervalMenu] = useState<boolean>(false);

  const [processIdDest, setProcessIdDest] = useState<string>();
  const [timeInterval, setTimeInterval] = useState<ValidWindowTimeValues>(defaultTimeInterval);
  const [protocol, setProtocol] = useState<AvailableProtocols | undefined>(protocolDefault);

  // Metrics query
  const filters = { id: parent.name, timeInterval, processIdDest, protocol };
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery(
    [QueriesProcesses.GetProcessMetrics, filters],
    () => ProcessesController.getMetrics(filters),
    {
      keepPreviousData: true,
      onError: handleError
    }
  );

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    navigate(route);
  }

  function handleSelectDestinationProcessMenu(
    _: React.MouseEvent | React.ChangeEvent,
    selection: SelectOptionObject,
    isPlaceholder?: boolean
  ) {
    const id = isPlaceholder ? undefined : (selection as string);

    setProcessIdDest(id);
    setIsOpenDestinationProcessMenu(false);
  }

  function handleToggleDestinationProcessMenu(isOpen: boolean) {
    setIsOpenDestinationProcessMenu(isOpen);
  }

  function handleSelectTimeIntervalMenu(
    _: React.MouseEvent | React.ChangeEvent,
    selection: SelectOptionObject,
    isPlaceholder?: boolean
  ) {
    const id = isPlaceholder ? defaultTimeInterval : (selection as ValidWindowTimeValues);

    setTimeInterval(id);
    setIsOpenTimeIntervalMenu(false);
  }

  function handleToggleTimeIntervalMenu(isOpen: boolean) {
    setIsOpenTimeIntervalMenu(isOpen);
  }

  function handleSelectProtocolMenu(
    _: React.MouseEvent | React.ChangeEvent,
    selection: SelectOptionObject,
    isPlaceholder?: boolean
  ) {
    const id = isPlaceholder ? undefined : (selection as AvailableProtocols);

    setProtocol(id);
    setIsOpenProtocolIntervalMenu(false);
  }

  function handleToggleProtocolMenu(isOpen: boolean) {
    setIsOpenProtocolIntervalMenu(isOpen);
  }

  // process connected select options
  const optionsProcessConnectedWithDefault = useMemo(() => {
    const processConnectedOptions = (processesConnected || []).map(({ destinationName }, index) => (
      <SelectOption key={index + 1} value={destinationName} />
    ));

    return [
      <SelectOption key={0} value={filterOptions.destinationProcesses.name} isPlaceholder />,
      ...processConnectedOptions
    ];
  }, [filterOptions.destinationProcesses.name, processesConnected]);

  // protocol select options
  const optionsProtocolsWithDefault = useMemo(() => {
    const protocolOptions = [AvailableProtocols.Http, AvailableProtocols.Http2, AvailableProtocols.Tcp].map(
      (option, index) => <SelectOption key={index + 1} value={option} />
    );

    return [<SelectOption key={0} value={filterOptions.protocols.name} isPlaceholder />, ...protocolOptions];
  }, [filterOptions.protocols.name]);

  // time interval select options
  const optionsTimeIntervalWithDefault = useMemo(
    () => Object.values(timeIntervalMap).map((interval, index) => <SelectOption key={index + 1} value={interval} />),
    []
  );

  return (
    <Grid hasGutter>
      {/* Metrics Filters */}
      <GridItem>
        <Card isFullHeight isRounded>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem spacer={{ default: 'spacerSm' }} alignment={{ default: 'alignRight' }}>
                <Select
                  isOpen={isOpenDestinationProcessMenu}
                  onSelect={handleSelectDestinationProcessMenu}
                  onToggle={handleToggleDestinationProcessMenu}
                  toggleIcon={<ClusterIcon color="var(--pf-global--palette--black-600)" />}
                  selections={processIdDest}
                  isDisabled={filterOptions.destinationProcesses.disabled}
                >
                  {optionsProcessConnectedWithDefault}
                </Select>
              </ToolbarItem>
              <ToolbarItem>
                <Select
                  isOpen={isOpenTimeInterval}
                  onSelect={handleSelectTimeIntervalMenu}
                  onToggle={handleToggleTimeIntervalMenu}
                  toggleIcon={<ClockIcon color="var(--pf-global--palette--black-600)" />}
                  selections={timeInterval}
                  isDisabled={filterOptions.timeIntervals.disabled}
                >
                  {optionsTimeIntervalWithDefault}
                </Select>
              </ToolbarItem>
              <ToolbarItem>
                <Select
                  isDisabled={filterOptions.protocols.disabled}
                  isOpen={isOpenProtocolInterval}
                  onSelect={handleSelectProtocolMenu}
                  onToggle={handleToggleProtocolMenu}
                  selections={protocol}
                >
                  {optionsProtocolsWithDefault}
                </Select>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </Card>
      </GridItem>

      {/* loader */}
      {isLoadingMetrics && (
        <Card style={{ minHeight: '500px' }}>
          <Bullseye>
            <Spinner />
          </Bullseye>
        </Card>
      )}

      {/* data not found card */}
      {!metrics && !isLoadingMetrics && (
        <Card isFullHeight>
          <CardBody>
            <EmptyData message={ProcessesLabels.NoMetricFoundMessage} />
          </CardBody>
        </Card>
      )}

      {/* Chart data traffic time series card */}
      {!!metrics && !isLoadingMetrics && (
        <>
          <GridItem span={8} rowSpan={2}>
            <Card isFullHeight>
              {!metrics.trafficDataSeriesPerSecond && <EmptyData />}
              {!!metrics.trafficDataSeriesPerSecond && (
                <>
                  <CardTitle>{ProcessesLabels.ChartProcessDataTrafficSeriesAxisYLabel}</CardTitle>
                  <CardBody>
                    <ChartProcessDataTrafficSeries
                      formatY={formatByteRate}
                      legendLabels={['Received', 'Sent']}
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
            {!metrics.trafficDataSeriesPerSecond && metrics.trafficDataSeries && <EmptyData />}
            {!!metrics.trafficDataSeriesPerSecond && metrics.trafficDataSeries && (
              <Card>
                <TableComposable borders={false} variant="compact">
                  <Thead noWrap>
                    <Tr>
                      <Th />
                      <Th>{ProcessesLabels.ByteRateMaxCol}</Th>
                      <Th>{ProcessesLabels.ByteRateAvgCol}</Th>
                      <Th>{ProcessesLabels.ByteRateCurrentCol}</Th>
                      <Th>{ProcessesLabels.ByteRateTotalCol}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>
                        <Icon size="sm">
                          <CircleIcon color={`var(--pf-chart-theme--cyan--ColorScale--100, #009596)`} />
                        </Icon>{' '}
                        {ProcessesLabels.TrafficReceived.toLocaleLowerCase()}
                      </Td>
                      <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.maxTrafficReceived)}</Th>
                      <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.avgTrafficReceived)}</Th>
                      <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.currentTrafficReceived)}</Th>
                      <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.sumDataReceived)}</Th>
                    </Tr>
                    <Tr>
                      <Td>
                        <Icon size="sm">
                          <CircleIcon color={`var(--pf-chart-theme--cyan--ColorScale--200, #a2d9d9)`} />
                        </Icon>{' '}
                        {ProcessesLabels.TrafficSent.toLocaleLowerCase()}
                      </Td>
                      <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.maxTrafficSent)}</Th>
                      <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.avgTrafficSent)}</Th>
                      <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.currentTrafficSent)}</Th>
                      <Th>{formatByteRate(metrics.trafficDataSeriesPerSecond.sumDataSent)}</Th>
                    </Tr>
                  </Tbody>
                </TableComposable>
              </Card>
            )}
          </GridItem>

          {/* Chart pie distribution data traffic card and total bytes */}
          <GridItem span={4}>
            <Card isFullHeight>
              <ChartProcessDataTrafficDistribution
                data={[
                  {
                    x: 'Received',
                    y: metrics.trafficDataSeries?.totalDataReceived || 0
                  },
                  {
                    x: 'Sent',
                    y: metrics.trafficDataSeries?.totalDataSent || 0
                  }
                ]}
              />
            </Card>
          </GridItem>

          {/* Chart latencies time series card*/}
          {protocol !== AvailableProtocols.Tcp && (
            <>
              <GridItem span={12}>
                <Card isFullHeight>
                  {!metrics.latencies && <EmptyData />}
                  {!!metrics.latencies && (
                    <>
                      <CardTitle>{ProcessesLabels.ChartProcessLatencySeriesAxisYLabel}</CardTitle>
                      <CardBody>
                        <ChartProcessDataTrafficSeries
                          formatY={formatLatency}
                          themeColor={ChartThemeColor.multiOrdered}
                          legendLabels={metrics.latencies.map(({ label }) => label)}
                          data={metrics.latencies.map(({ data }) => data)}
                        />
                      </CardBody>
                    </>
                  )}
                </Card>
              </GridItem>

              {/* Chart requests time series card*/}
              <GridItem span={8} rowSpan={2}>
                <Card isFullHeight>
                  {!!metrics.requestPerSecondSeries && (
                    <>
                      <CardTitle>{ProcessesLabels.RequestsPerSecondsSeriesAxisYLabel}</CardTitle>
                      <CardBody>
                        <ChartProcessDataTrafficSeries
                          formatY={(y: number) => y.toFixed(3)}
                          themeColor={ChartThemeColor.purple}
                          legendLabels={metrics.requestPerSecondSeries.map(({ label }) => label)}
                          data={metrics.requestPerSecondSeries.map(({ data }) => data)}
                        />
                      </CardBody>
                    </>
                  )}
                </Card>
              </GridItem>

              {/*  Partial total request card*/}
              {!!metrics.requestSeries && (
                <GridItem span={4}>
                  <MetricCard
                    title={'Total Hits'}
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
                  <MetricCard
                    title={'Avg. hits rate'}
                    value={metrics.requestPerSecondSeries[0].avgRequestRateInterval}
                    bgColor={'--pf-global--palette--purple-200'}
                    showChart={false}
                  />
                </GridItem>
              )}

              {/*  response card*/}
              {!!metrics.responseSeries && (
                <>
                  <GridItem span={3}>
                    <MetricCard
                      title={metrics.responseSeries.statusCode2xx.label}
                      value={formatPercentage(metrics.responseSeries.statusCode2xx.total, metrics.responseSeries.total)}
                      bgColor={'--pf-global--palette--green-400'}
                      showChart={false}
                    />
                  </GridItem>
                  <GridItem span={3}>
                    <MetricCard
                      title={metrics.responseSeries.statusCode3xx.label}
                      value={formatPercentage(metrics.responseSeries.statusCode3xx.total, metrics.responseSeries.total)}
                      bgColor={'--pf-global--palette--blue-400'}
                      showChart={false}
                    />
                  </GridItem>
                  <GridItem span={3}>
                    <MetricCard
                      title={metrics.responseSeries.statusCode4xx.label}
                      value={formatPercentage(metrics.responseSeries.statusCode4xx.total, metrics.responseSeries.total)}
                      bgColor={'--pf-global--palette--orange-100'}
                      showChart={false}
                    />
                  </GridItem>
                  <GridItem span={3}>
                    <MetricCard
                      title={metrics.responseSeries.statusCode5xx.label}
                      value={formatPercentage(metrics.responseSeries.statusCode5xx.total, metrics.responseSeries.total)}
                      bgColor={'--pf-global--palette--red-100'}
                      showChart={false}
                    />
                  </GridItem>

                  {/* Chart pie distribution data traffic card and total bytes */}
                  <GridItem span={4}>
                    <Card isFullHeight>
                      <>
                        {!metrics.responseSeries.statusCode5xx.total && !metrics.responseSeries.statusCode4xx.total && (
                          <EmptyData message="No error found" />
                        )}

                        {(!!metrics.responseSeries.statusCode5xx.total ||
                          !!metrics.responseSeries.statusCode4xx.total) && (
                          <ChartProcessDataTrafficDistribution
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
                        )}
                      </>
                    </Card>
                  </GridItem>
                </>
              )}
            </>
          )}
        </>
      )}
    </Grid>
  );
};

export default Metrics;
