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
  SelectGroup,
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
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { formatToDecimalPlacesIfCents } from '@core/utils/formatToDecimalPlacesIfCents';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { defaultTimeInterval, gePrometheusStartTime, timeIntervalMap } from 'API/Prometheus.constant';
import { IntervalTimeProp } from 'API/Prometheus.interfaces';
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
  sourceProcesses: { disabled: false, name: ProcessesLabels.FilterAllSourceProcesses },
  destinationProcesses: { disabled: false, name: ProcessesLabels.FilterAllDestinationProcesses }
};

const Metrics: FC<MetricsProps> = function ({
  parent,
  sourceProcesses,
  processesConnected,
  protocolDefault,
  customFilters
}) {
  const navigate = useNavigate();

  const filterOptions = { ...filterOptionsDefault, ...customFilters };

  const [isOpenSourceProcessMenu, setIsOpenSourceProcessMenu] = useState<boolean>(false);
  const [isOpenDestinationProcessMenu, setIsOpenDestinationProcessMenu] = useState<boolean>(false);
  const [isOpenTimeInterval, setIsOpenTimeIntervalMenu] = useState<boolean>(false);
  const [isOpenProtocolInterval, setIsOpenProtocolIntervalMenu] = useState<boolean>(false);

  const [processIdSource, setProcessIdSource] = useState<string>();
  const [processIdDest, setProcessIdDest] = useState<string>();
  const [timeInterval, setTimeInterval] = useState<IntervalTimeProp['key']>(defaultTimeInterval.key);
  const [protocol, setProtocol] = useState<AvailableProtocols | undefined>(protocolDefault);

  // Metrics query
  const filters = {
    id: processIdSource || parent.id, // our queries to prometheus must have a source id or list of ids ("id1|id2|id3...")
    timeInterval: timeIntervalMap[timeInterval],
    processIdDest,
    protocol
  };

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

  function handleSelectSourceProcessMenu(
    _: React.MouseEvent | React.ChangeEvent,
    selection: SelectOptionObject,
    isPlaceholder?: boolean
  ) {
    const id = isPlaceholder ? undefined : (selection as string);

    setProcessIdSource(id);
    setIsOpenSourceProcessMenu(false);
  }

  function handleToggleSourceProcessMenu(isOpen: boolean) {
    setIsOpenSourceProcessMenu(isOpen);
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
    const id = isPlaceholder ? defaultTimeInterval.key : (selection as IntervalTimeProp['key']);

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

  // process sources select options
  const optionsProcessSourcesWithDefault = useMemo(() => {
    const sourceProcessOptions = (sourceProcesses || []).map(({ destinationName }, index) => (
      <SelectOption key={index + 1} value={destinationName} />
    ));

    return [
      <SelectGroup label="" key="source-group1">
        <SelectOption key={0} value={filterOptions.sourceProcesses.name} isPlaceholder />
      </SelectGroup>,
      <SelectGroup label="processes" key="source-group2">
        {...sourceProcessOptions}
      </SelectGroup>
    ];
  }, [filterOptions.sourceProcesses.name, sourceProcesses]);

  // process connected select options
  const optionsProcessConnectedWithDefault = useMemo(() => {
    const processConnectedOptions = (processesConnected || []).map(({ destinationName }, index) => (
      <SelectOption key={index + 1} value={destinationName} />
    ));

    return [
      <SelectGroup label="" key="dest-group1">
        <SelectOption key={0} value={filterOptions.destinationProcesses.name} isPlaceholder />
      </SelectGroup>,
      <SelectGroup label="processes" key="dest-group2">
        {...processConnectedOptions}
      </SelectGroup>
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
    () =>
      Object.values(timeIntervalMap)
        .filter(
          ({ seconds }) =>
            new Date().getTime() - seconds * 1000 > Math.max(gePrometheusStartTime(), parent.startTime / 1000)
        )
        .map((interval, index) => (
          <SelectOption key={index + 1} value={interval.key}>
            {interval.label}
          </SelectOption>
        )),
    [parent.startTime]
  );

  return (
    <>
      {/* loader */}
      {isLoadingMetrics && (
        <Card isFullHeight style={{ height: '500px' }}>
          <Bullseye>
            <Spinner />
          </Bullseye>
        </Card>
      )}

      {!isLoadingMetrics && (
        <Grid hasGutter>
          {/* Metrics Filters */}
          <GridItem style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <Card isFullHeight isRounded>
              <Toolbar>
                <ToolbarContent>
                  <ToolbarItem alignment={{ default: 'alignRight' }}>
                    <Select
                      isGrouped
                      placeholderText={filterOptions.sourceProcesses.name}
                      isOpen={isOpenSourceProcessMenu}
                      onSelect={handleSelectSourceProcessMenu}
                      onToggle={handleToggleSourceProcessMenu}
                      toggleIcon={<ClusterIcon color="var(--pf-global--palette--black-600)" />}
                      selections={processIdSource}
                      isDisabled={filterOptions.sourceProcesses.disabled}
                    >
                      {optionsProcessSourcesWithDefault}
                    </Select>
                  </ToolbarItem>

                  {!filterOptions.destinationProcesses.disabled && (
                    <ToolbarItem>
                      <Select
                        isGrouped
                        placeholderText={filterOptions.destinationProcesses.name}
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
                  )}

                  {!!optionsTimeIntervalWithDefault.length && (
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
                  )}

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

          {/* data not found card */}
          {!metrics && (
            <GridItem>
              <Card isFullHeight>
                <CardBody>
                  <EmptyData message={ProcessesLabels.NoMetricFoundMessage} />
                </CardBody>
              </Card>
            </GridItem>
          )}

          {/* Chart data traffic time series card */}
          {!!metrics && (
            <>
              <GridItem span={8} rowSpan={2}>
                <Card isFullHeight>
                  {!metrics.trafficDataSeriesPerSecond && <EmptyData />}
                  {!!metrics.trafficDataSeriesPerSecond && (
                    <>
                      <CardTitle>{ProcessesLabels.ChartProcessDataTrafficSeriesAxisYLabel}</CardTitle>
                      <CardBody>
                        <ChartProcessDataTrafficSeries
                          themeColor={ChartThemeColor.orange}
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
                              <CircleIcon color={`var(--pf-chart-theme--orange--ColorScale--100, #ec7a08)`} />
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
                              <CircleIcon color={`var(--pf-chart-theme--orange--ColorScale--200, #f4b678)`} />
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
                    format={formatBytes}
                    themeColor={ChartThemeColor.orange}
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
                              themeColor={ChartThemeColor.multi}
                              legendLabels={metrics.latencies.timeSeriesLatencies.map(({ label }) => label)}
                              data={metrics.latencies.timeSeriesLatencies.map(({ data }) => data)}
                            />
                          </CardBody>
                        </>
                      )}
                    </Card>
                  </GridItem>

                  {/* Chart requests time series card*/}
                  {!!metrics.requestPerSecondSeries && (
                    <>
                      <GridItem span={8} rowSpan={2}>
                        <Card isFullHeight>
                          <>
                            <CardTitle>{ProcessesLabels.RequestsPerSecondsSeriesAxisYLabel}</CardTitle>
                            <CardBody>
                              <ChartProcessDataTrafficSeries
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
                    </>
                  )}

                  {/*  response card*/}
                  {!!metrics.responseSeries && (
                    <>
                      <GridItem span={3}>
                        <MetricCard
                          title={metrics.responseSeries.statusCode2xx.label}
                          value={formatPercentage(
                            metrics.responseSeries.statusCode2xx.total,
                            metrics.responseSeries.total
                          )}
                          bgColor={'--pf-global--palette--green-400'}
                          showChart={false}
                        />
                      </GridItem>
                      <GridItem span={3}>
                        <MetricCard
                          title={metrics.responseSeries.statusCode3xx.label}
                          value={formatPercentage(
                            metrics.responseSeries.statusCode3xx.total,
                            metrics.responseSeries.total
                          )}
                          bgColor={'--pf-global--palette--blue-400'}
                          showChart={false}
                        />
                      </GridItem>
                      <GridItem span={3}>
                        <MetricCard
                          title={metrics.responseSeries.statusCode4xx.label}
                          value={formatPercentage(
                            metrics.responseSeries.statusCode4xx.total,
                            metrics.responseSeries.total
                          )}
                          bgColor={'--pf-global--palette--orange-100'}
                          showChart={false}
                        />
                      </GridItem>
                      <GridItem span={3}>
                        <MetricCard
                          title={metrics.responseSeries.statusCode5xx.label}
                          value={formatPercentage(
                            metrics.responseSeries.statusCode5xx.total,
                            metrics.responseSeries.total
                          )}
                          bgColor={'--pf-global--palette--red-100'}
                          showChart={false}
                        />
                      </GridItem>

                      {/* Chart pie distribution data traffic card and total bytes */}
                      {!!metrics.responseRateSeries?.statusCode4xx.data &&
                        !!metrics.responseRateSeries?.statusCode5xx.data && (
                          <>
                            <GridItem span={4}>
                              <Card isFullHeight>
                                <ChartProcessDataTrafficDistribution
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
                                <CardTitle>{ProcessesLabels.ErrorRateSeriesAxisYLabel}</CardTitle>
                                <CardBody>
                                  <ChartProcessDataTrafficSeries
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
          )}
        </Grid>
      )}
    </>
  );
};

export default Metrics;
