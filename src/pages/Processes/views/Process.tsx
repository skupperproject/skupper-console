import React, { useMemo, useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbHeading,
  BreadcrumbItem,
  Card,
  Flex,
  Grid,
  GridItem,
  Select,
  SelectOption,
  SelectOptionObject,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { ClockIcon, ClusterIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import ResourceIcon from '@core/components/ResourceIcon';
import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { timeIntervalMap } from 'API/Prometheus.constant';
import { RESTApi } from 'API/REST';
import { FlowAggregatesResponse } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import ChartProcessDataTrafficDistribution from '../components/ChartProcessDataTrafficDistribution';
import ChartProcessDataTrafficSeries from '../components/ChartProcessDataTrafficSeries';
import MetricCard from '../components/MetricCard';
import ProcessDescription from '../components/ProcessDescription';
import { processesConnectedColumns } from '../Processes.constant';
import { ProcessesLabels, ProcessesRoutesPaths, ProcessPairsColumnsNames } from '../Processes.enum';
import ProcessesController from '../services';
import { QueriesProcesses } from '../services/services.enum';

const ProcessesConnectedComponentsTable = {
  ProcessLinkCell: (props: LinkCellProps<FlowAggregatesResponse>) =>
    LinkCell({
      ...props,
      type: 'process',
      link: `${ProcessesRoutesPaths.Processes}/${props.data.destinationId}`
    }),
  TotalBytesExchanged: (props: LinkCellProps<FlowAggregatesResponse>) =>
    formatBytes(props.data.sourceOctets + props.data.destinationOctets),
  AvgLatency: (props: LinkCellProps<FlowAggregatesResponse>) =>
    formatBytes((props.data.sourceAverageLatency + props.data.destinationAverageLatency) / 2)
};

const defaultTimeInterval = timeIntervalMap.FifteenMinutes;

const Process = function () {
  const navigate = useNavigate();
  const { id: processId } = useParams() as { id: string };

  const [isOpenDestinationProcessMenu, setIsOpenDestinationProcessMenu] = useState<boolean>(false);
  const [destinationProcess, setDestinationProcess] = useState<string>();

  const [isOpenTimeInterval, setIsOpenTimeIntervalMenu] = useState<boolean>(false);
  const [timeInterval, setTimeInterval] = useState<any>(defaultTimeInterval);

  const { data: process, isLoading: isLoadingProcess } = useQuery(
    [QueriesProcesses.GetProcess, processId],
    () => RESTApi.fetchProcess(processId),
    {
      onError: handleError
    }
  );

  const { data: processesPairsTxData, isLoading: isLoadingProcessesPairsTxData } = useQuery(
    [QueriesProcesses.GetProcessPairsTx, processId],
    () =>
      RESTApi.fetchProcessesPairs({
        filter: `sourceId.${processId}`,
        timeRangeStart: 0
      }),
    {
      onError: handleError
    }
  );

  const { data: processesPairsRxData, isLoading: isLoadingProcessesPairsRxData } = useQuery(
    [QueriesProcesses.GetProcessPairsRx, processId],
    () =>
      RESTApi.fetchProcessesPairs({
        filter: `destinationId.${processId}`,
        timeRangeStart: 0
      }),
    {
      onError: handleError
    }
  );

  const { data: addresses, isLoading: isLoadingAddressesByProcess } = useQuery(
    [QueriesProcesses.GetAddressesByProcessId, processId],
    () => RESTApi.fetchAddressesByProcess(processId),
    {
      onError: handleError
    }
  );

  // Metrics query
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery(
    [QueriesProcesses.GetProcessMetrics, process?.name, timeInterval, destinationProcess],
    () => ProcessesController.getMetrics(process?.name || '', timeInterval, destinationProcess || ''),
    {
      keepPreviousData: true,
      enabled: !!process,
      onError: handleError
    }
  );

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    navigate(route);
  }

  function handleSelectDestinationProcessMenu(
    _: React.MouseEvent | React.ChangeEvent,
    selection: string | SelectOptionObject,
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
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean
  ) {
    const id = isPlaceholder ? defaultTimeInterval : (selection as string);

    setTimeInterval(id);
    setIsOpenTimeIntervalMenu(false);
  }

  function handleToggleTimeIntervalMenu(isOpen: boolean) {
    setIsOpenTimeIntervalMenu(isOpen);
  }

  const optionsDestinationProcessWithDefault = useMemo(() => {
    const destinationProcessTxOptions = (processesPairsTxData || []).map((option, index) => (
      <SelectOption key={index + 1} value={option.destinationName} />
    ));

    const destinationProcessRxOptions = (processesPairsRxData || []).map((option, index) => (
      <SelectOption key={index + 1} value={option.sourceName} />
    ));

    return [
      <SelectOption key={0} value={ProcessesLabels.FilterDestinationProcessDefault} isPlaceholder />,
      ...destinationProcessTxOptions,
      ...destinationProcessRxOptions
    ];
  }, [processesPairsRxData, processesPairsTxData]);

  const optionsTimeIntervalWithDefault = useMemo(
    () => Object.values(timeIntervalMap).map((interval, index) => <SelectOption key={index + 1} value={interval} />),
    []
  );

  if (
    isLoadingProcess ||
    isLoadingAddressesByProcess ||
    isLoadingProcessesPairsTxData ||
    isLoadingProcessesPairsRxData ||
    isLoadingMetrics
  ) {
    return <LoadingPage />;
  }

  if (!process || !processesPairsTxData || !processesPairsRxData || !addresses || !metrics) {
    return null;
  }

  const processesPairsTx = processesPairsTxData;

  const processesPairsRxReverse =
    processesPairsRxData.map((processPairsData) => ({
      ...processPairsData,
      sourceId: processPairsData.destinationId,
      sourceName: processPairsData.destinationName,
      destinationName: processPairsData.sourceName,
      destinationId: processPairsData.sourceId,
      sourceOctets: processPairsData.destinationOctets,
      destinationOctets: processPairsData.sourceOctets,
      sourceAverageLatency: processPairsData.destinationAverageLatency,
      destinationAverageLatency: processPairsData.sourceAverageLatency
    })) || [];

  const totalBytes = metrics.trafficDataSeries.totalData;

  const processTrafficChartData = [
    {
      x: 'Sent',
      y: metrics.trafficDataSeries.totalDataSent
    },
    {
      x: 'Received',
      y: metrics.trafficDataSeries.totalDataReceived
    }
  ];

  return (
    <TransitionPage>
      <Grid hasGutter>
        <GridItem>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to={ProcessesRoutesPaths.Processes}>{ProcessesLabels.Section}</Link>
            </BreadcrumbItem>
            <BreadcrumbHeading to="#">{process.name}</BreadcrumbHeading>
          </Breadcrumb>
        </GridItem>

        <GridItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }}>
            <ResourceIcon type="process" />
            <Title headingLevel="h1">{process.name}</Title>

            <Link
              to={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${processId}`}
            >
              {`(${ProcessesLabels.GoToTopology})`}
            </Link>
          </Flex>
        </GridItem>

        {/* Process Details */}
        <GridItem>
          <ProcessDescription process={process} title={ProcessesLabels.Details} />
        </GridItem>

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
                    toggleIcon={<ClusterIcon />}
                    selections={destinationProcess}
                  >
                    {optionsDestinationProcessWithDefault}
                  </Select>
                </ToolbarItem>
                <ToolbarItem>
                  <Select
                    isOpen={isOpenTimeInterval}
                    onSelect={handleSelectTimeIntervalMenu}
                    onToggle={handleToggleTimeIntervalMenu}
                    toggleIcon={<ClockIcon />}
                    selections={timeInterval}
                  >
                    {optionsTimeIntervalWithDefault}
                  </Select>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </Card>
        </GridItem>

        {/* Chart data traffic time series card */}
        <GridItem span={8} rowSpan={2}>
          <Card isFullHeight>
            {!metrics.trafficDataSeriesPerSecond && <EmptyData />}
            {!!metrics.trafficDataSeriesPerSecond && (
              <ChartProcessDataTrafficSeries
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
          <MetricCard
            title={ProcessesLabels.TrafficTotal}
            value={formatBytes(totalBytes)}
            bgColor={'--pf-global--palette--cyan-200'}
          />
        </GridItem>

        {/* Chart distribution data traffic card*/}
        <GridItem span={4}>
          <Card isFullHeight>
            {!processTrafficChartData && <EmptyData />}
            {!!processTrafficChartData && <ChartProcessDataTrafficDistribution data={processTrafficChartData} />}
          </Card>
        </GridItem>

        {/* Table server processes*/}
        <GridItem span={6}>
          <SkTable
            title={ProcessesLabels.Servers}
            columns={processesConnectedColumns}
            rows={processesPairsTx}
            pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
            components={{
              ...ProcessesConnectedComponentsTable,
              viewDetailsLinkCell: (props: LinkCellProps<FlowAggregatesResponse>) =>
                LinkCell({
                  ...props,
                  link: `${ProcessesRoutesPaths.Processes}/${process.identity}/${props.data.identity}`,
                  value: ProcessPairsColumnsNames.ViewDetails
                })
            }}
          />
        </GridItem>

        {/* Table client processes*/}
        <GridItem span={6}>
          <SkTable
            title={ProcessesLabels.Clients}
            columns={processesConnectedColumns}
            rows={processesPairsRxReverse}
            pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
            components={{
              ...ProcessesConnectedComponentsTable,
              viewDetailsLinkCell: (props: LinkCellProps<FlowAggregatesResponse>) =>
                LinkCell({
                  ...props,
                  link: `${ProcessesRoutesPaths.Processes}/${processId}/${props.data.identity}`,
                  value: ProcessPairsColumnsNames.ViewDetails
                })
            }}
          />
        </GridItem>
      </Grid>
    </TransitionPage>
  );
};

export default Process;
