import React, { FC, useMemo, useState } from 'react';

import { ChartThemeColor } from '@patternfly/react-charts';
import {
  Card,
  Grid,
  GridItem,
  Select,
  SelectOption,
  SelectOptionObject,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { ClockIcon, ClusterIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import { formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatTime';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { timeIntervalMap } from 'API/Prometheus.constant';
import { ValidWindowTimeValues } from 'API/Prometheus.interfaces';
import { AvailableProtocols } from 'API/REST.enum';
import { FlowAggregatesResponse, ProcessResponse } from 'API/REST.interfaces';

import ChartProcessDataTrafficDistribution from './ChartProcessDataTrafficDistribution';
import ChartProcessDataTrafficSeries from './ChartProcessDataTrafficSeries';
import MetricCard from './MetricCard';
import { ProcessesLabels } from '../Processes.enum';
import { ProcessMetrics } from '../Processes.interfaces';
import ProcessesController from '../services';
import { QueriesProcesses } from '../services/services.enum';

const defaultTimeInterval = timeIntervalMap.FifteenMinutes;

const Metrics: FC<{
  process: ProcessResponse;
  processesConnected: FlowAggregatesResponse[];
}> = function ({ process, processesConnected }) {
  const navigate = useNavigate();

  const [isOpenDestinationProcessMenu, setIsOpenDestinationProcessMenu] = useState<boolean>(false);
  const [isOpenTimeInterval, setIsOpenTimeIntervalMenu] = useState<boolean>(false);
  const [isOpenProtocolInterval, setIsOpenProtocolIntervalMenu] = useState<boolean>(false);

  const [destinationProcess, setDestinationProcess] = useState<string>();
  const [timeInterval, setTimeInterval] = useState<ValidWindowTimeValues>(defaultTimeInterval);
  const [protocol, setProtocol] = useState<AvailableProtocols | undefined>();

  // Metrics query
  const filters = { id: process.name, timeInterval, destinationProcess, protocol };
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
    const processConnectedOptions = processesConnected.map((option, index) => (
      <SelectOption key={index + 1} value={option.destinationName} />
    ));

    return [
      <SelectOption key={0} value={ProcessesLabels.FilterProcessesConnectedDefault} isPlaceholder />,
      ...processConnectedOptions
    ];
  }, [processesConnected]);

  // protocol select options
  const optionsProtocolsWithDefault = useMemo(() => {
    const protocolOptions = [AvailableProtocols.Http, AvailableProtocols.Http2, AvailableProtocols.Tcp].map(
      (option, index) => <SelectOption key={index + 1} value={option} />
    );

    return [<SelectOption key={0} value={ProcessesLabels.FilterProtocolsDefault} isPlaceholder />, ...protocolOptions];
  }, []);

  // time interval  select options
  const optionsTimeIntervalWithDefault = useMemo(
    () => Object.values(timeIntervalMap).map((interval, index) => <SelectOption key={index + 1} value={interval} />),
    []
  );

  if (isLoadingMetrics) {
    return <LoadingPage />;
  }

  return (
    <Grid>
      {/* Metrics Filters */}
      <GridItem>
        <Card>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem spacer={{ default: 'spacerSm' }} alignment={{ default: 'alignRight' }}>
                <Select
                  isOpen={isOpenDestinationProcessMenu}
                  onSelect={handleSelectDestinationProcessMenu}
                  onToggle={handleToggleDestinationProcessMenu}
                  toggleIcon={<ClusterIcon color="var(--pf-global--palette--black-600)" />}
                  selections={destinationProcess}
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
                >
                  {optionsTimeIntervalWithDefault}
                </Select>
              </ToolbarItem>

              <ToolbarItem>
                <Select
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

      {!metrics && (
        <Card isFullHeight>
          <EmptyData message={ProcessesLabels.NoMetricFoundMessage} />
        </Card>
      )}
      {/* Chart data traffic time series card */}
      {!!metrics && (
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
            {!metrics.trafficDataSeries && <EmptyData />}
            {!!metrics.trafficDataSeries && (
              <MetricCard
                title={ProcessesLabels.TrafficTotal}
                value={formatBytes(metrics.trafficDataSeries.totalData)}
                bgColor={'--pf-global--palette--cyan-200'}
              />
            )}
          </GridItem>

          {/* Chart distribution data traffic card*/}
          <GridItem span={4}>
            <Card isFullHeight>
              {!getProcessTrafficChartData(metrics) && <EmptyData />}
              {!!getProcessTrafficChartData(metrics) && (
                <ChartProcessDataTrafficDistribution data={getProcessTrafficChartData(metrics)} />
              )}
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
