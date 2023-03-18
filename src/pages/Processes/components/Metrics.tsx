import React, { FC, useMemo, useState } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import {
  Bullseye,
  Card,
  CardBody,
  Grid,
  GridItem,
  Icon,
  Select,
  SelectOption,
  SelectOptionObject,
  Spinner,
  Title,
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
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { defaultTimeInterval, timeIntervalMap } from 'API/Prometheus.constant';
import { ValidWindowTimeValues } from 'API/Prometheus.interfaces';
import { AvailableProtocols } from 'API/REST.enum';

import ChartProcessDataTrafficDistribution from './ChartProcessDataTrafficDistribution';
import ChartProcessDataTrafficSeries from './ChartProcessDataTrafficSeries';
import { ProcessesLabels } from '../Processes.enum';
import { MetricsProps, ProcessMetrics } from '../Processes.interfaces';
import ProcessesController from '../services';
import { QueriesProcesses } from '../services/services.enum';

const filterOptionsDefault = {
  protocols: { disabled: false, name: ProcessesLabels.FilterProtocolsDefault },
  timeIntervals: { disabled: false },
  destinationProcesses: { disabled: false, name: ProcessesLabels.FilterProcessesConnectedDefault }
};

const Metrics: FC<MetricsProps> = function ({ parent, processesConnected, protocolDefault, disableFilter }) {
  const navigate = useNavigate();

  const filterOptions = { ...filterOptionsDefault, ...disableFilter };

  const [isOpenDestinationProcessMenu, setIsOpenDestinationProcessMenu] = useState<boolean>(false);
  const [isOpenTimeInterval, setIsOpenTimeIntervalMenu] = useState<boolean>(false);
  const [isOpenProtocolInterval, setIsOpenProtocolIntervalMenu] = useState<boolean>(false);

  const [destinationProcess, setDestinationProcess] = useState<string>();
  const [timeInterval, setTimeInterval] = useState<ValidWindowTimeValues>(defaultTimeInterval);
  const [protocol, setProtocol] = useState<AvailableProtocols | undefined>(protocolDefault);

  // Metrics query
  const filters = { id: parent.name, timeInterval, destinationProcess, protocol };
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

    setDestinationProcess(id);
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

  function getProcessTrafficChartData(trafficData: ProcessMetrics) {
    return [
      {
        x: 'Received',
        y: trafficData.trafficDataSeries?.totalDataReceived || 0
      },
      {
        x: 'Sent',
        y: trafficData.trafficDataSeries?.totalDataSent || 0
      }
    ];
  }

  // process connected select options
  const optionsProcessConnectedWithDefault = useMemo(() => {
    const processConnectedOptions = processesConnected.map(({ destinationName }, index) => (
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
                  selections={destinationProcess}
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
                <ChartProcessDataTrafficSeries
                  axisYLabel={ProcessesLabels.ChartProcessDataTrafficSeriesAxisYLabel}
                  legendLabels={['Received', 'Sent']}
                  data={[
                    metrics.trafficDataSeriesPerSecond.timeSeriesDataReceived,
                    metrics.trafficDataSeriesPerSecond.timeSeriesDataSent
                  ]}
                />
              )}
            </Card>
          </GridItem>

          {/* Total Traffic card */}
          <GridItem span={4}>
            {!metrics.trafficDataSeriesPerSecond && metrics.trafficDataSeries && <EmptyData />}
            {!!metrics.trafficDataSeriesPerSecond && metrics.trafficDataSeries && (
              <Card>
                <TableComposable borders={false}>
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
              <>
                {!!metrics.trafficDataSeries &&
                  !!(metrics.trafficDataSeries.totalDataSent + metrics.trafficDataSeries.totalDataReceived) && (
                    <Title headingLevel="h2" className="pf-u-text-align-center pf-u-p-md">
                      {formatBytes(
                        metrics.trafficDataSeries.totalDataSent + metrics.trafficDataSeries.totalDataReceived
                      )}
                    </Title>
                  )}
                <ChartProcessDataTrafficDistribution data={getProcessTrafficChartData(metrics)} />
              </>
            </Card>
          </GridItem>

          {/* Chart latencies time series card*/}
          <GridItem span={12}>
            <Card isFullHeight>
              {!metrics.latencies && <EmptyData />}
              {!!metrics.latencies && (
                <ChartProcessDataTrafficSeries
                  formatY={formatLatency}
                  axisYLabel={ProcessesLabels.ChartProcessLatencySeriesAxisYLabel}
                  themeColor={ChartThemeColor.multiOrdered}
                  legendLabels={metrics.latencies.map(({ label }) => label)}
                  data={metrics.latencies.map(({ data }) => data)}
                />
              )}
            </Card>
          </GridItem>
        </>
      )}
    </Grid>
  );
};

export default Metrics;
