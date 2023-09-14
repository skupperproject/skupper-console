import { useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import { Badge, Flex, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { SMALL_PAGINATION_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import SkTable from '@core/components/SkTable';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import MainContainer from '@layout/MainContainer';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';

import ProcessDescription from '../components/ProcessDescription';
import {
  processesConnectedColumns,
  CustomProcessPairCells,
  processesHttpConnectedColumns
} from '../Processes.constants';
import { ProcessesLabels } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'process-display-interval';

const Process = function () {
  const [searchParams, setSearchParams] = useSearchParams();

  const { id } = useParams() as { id: string };
  const { id: processId } = getIdAndNameFromUrlParams(id);

  const type = searchParams.get('type') || ProcessesLabels.Overview;
  const [tabSelected, setTabSelected] = useState(type);

  const processesPairsTxQueryParams = {
    sourceId: processId
  };

  const processesPairsRxQueryParams = {
    destinationId: processId
  };

  const { data: process } = useQuery([QueriesProcesses.GetProcess, processId], () => RESTApi.fetchProcess(processId));

  const { data: processesPairsTxData } = useQuery(
    [QueriesProcesses.GetProcessPairsTx, processesPairsTxQueryParams],
    () => RESTApi.fetchProcessesPairs(processesPairsTxQueryParams)
  );

  const { data: processesPairsRxData } = useQuery(
    [QueriesProcesses.GetProcessPairsRx, processesPairsRxQueryParams],
    () => RESTApi.fetchProcessesPairs(processesPairsRxQueryParams)
  );

  const { data: services } = useQuery([QueriesProcesses.GetServicesByProcessId, processId], () =>
    RESTApi.fetchServicesByProcess(processId)
  );

  const handleRefreshMetrics = useCallback(
    (filters: SelectedFilters) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${processId}`, filters);
    },
    [processId]
  );

  if (!process || !processesPairsTxData || !processesPairsRxData || !services) {
    return null;
  }

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as ProcessesLabels);
    setSearchParams({ type: tabIndex as string });
  }

  const processesPairsRxReverse =
    processesPairsRxData.map((processPairsData) => ({
      ...processPairsData,
      sourceId: processPairsData.destinationId,
      sourceName: processPairsData.destinationName,
      destinationName: processPairsData.sourceName,
      destinationId: processPairsData.sourceId
    })) || [];

  const TCPServers = processesPairsTxData.filter(({ protocol }) => protocol === AvailableProtocols.Tcp);
  const TCPClients = processesPairsRxReverse.filter(({ protocol }) => protocol === AvailableProtocols.Tcp);

  const HTTPServers = processesPairsTxData.filter(
    ({ protocol }) => protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2
  );
  const HTTPClients = processesPairsRxReverse.filter(
    ({ protocol }) => protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2
  );

  const remoteServers = processesPairsTxData.filter(({ protocol }) => protocol === undefined);
  const remoteClients = processesPairsRxReverse.filter(({ protocol }) => protocol === undefined);
  const allDestinationProcesses = [...HTTPServers, ...HTTPClients, ...TCPServers, ...TCPClients];

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={ProcessesLabels.Overview} title={<TabTitleText>{ProcessesLabels.Overview}</TabTitleText>} />
        <Tab eventKey={ProcessesLabels.Details} title={<TabTitleText>{ProcessesLabels.Details}</TabTitleText>} />
        <Tab
          disabled={!processesPairsTxData.length && !processesPairsRxData.length}
          eventKey={ProcessesLabels.ProcessPairs}
          title={
            <TabTitleText>
              {ProcessesLabels.ProcessPairs}{' '}
              <Badge isRead key={1}>
                {allDestinationProcesses.length}
              </Badge>
            </TabTitleText>
          }
        />
      </Tabs>
    );
  };

  return (
    <MainContainer
      dataTestId={getTestsIds.processView(processId)}
      title={process.name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${processId}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {tabSelected === ProcessesLabels.Details && (
            <ProcessDescription processWithService={{ ...process, services }} title={ProcessesLabels.Details} />
          )}

          {tabSelected === ProcessesLabels.ProcessPairs && (
            <Flex direction={{ default: 'column' }}>
              {!!TCPClients.length && (
                <SkTable
                  alwaysShowPagination={false}
                  title={ProcessesLabels.TCPClients}
                  columns={processesConnectedColumns}
                  rows={TCPClients}
                  pagination={true}
                  paginationPageSize={SMALL_PAGINATION_SIZE}
                  customCells={CustomProcessPairCells}
                />
              )}

              {!!TCPServers.length && (
                <SkTable
                  alwaysShowPagination={false}
                  title={ProcessesLabels.TCPServers}
                  columns={processesConnectedColumns}
                  rows={TCPServers}
                  pagination={true}
                  paginationPageSize={SMALL_PAGINATION_SIZE}
                  customCells={CustomProcessPairCells}
                />
              )}

              {!!HTTPClients.length && (
                <SkTable
                  alwaysShowPagination={false}
                  title={ProcessesLabels.HTTPClients}
                  columns={processesHttpConnectedColumns}
                  rows={HTTPClients}
                  pagination={true}
                  paginationPageSize={SMALL_PAGINATION_SIZE}
                  customCells={CustomProcessPairCells}
                />
              )}

              {!!HTTPServers.length && (
                <SkTable
                  alwaysShowPagination={false}
                  title={ProcessesLabels.HTTPServers}
                  columns={processesHttpConnectedColumns}
                  rows={HTTPServers}
                  pagination={true}
                  paginationPageSize={SMALL_PAGINATION_SIZE}
                  customCells={CustomProcessPairCells}
                />
              )}

              {!!remoteClients.length && (
                <SkTable
                  alwaysShowPagination={false}
                  title={ProcessesLabels.RemoteClients}
                  columns={processesConnectedColumns}
                  rows={remoteClients}
                  pagination={true}
                  paginationPageSize={SMALL_PAGINATION_SIZE}
                  customCells={CustomProcessPairCells}
                />
              )}

              {!!remoteServers.length && (
                <SkTable
                  alwaysShowPagination={false}
                  title={ProcessesLabels.RemoteServers}
                  columns={processesConnectedColumns}
                  rows={remoteServers}
                  pagination={true}
                  paginationPageSize={SMALL_PAGINATION_SIZE}
                  customCells={CustomProcessPairCells}
                />
              )}
            </Flex>
          )}
          {/* Process Metrics - key reset the component(state) when we click on a link from the server or client table*/}

          {tabSelected === ProcessesLabels.Overview && (
            <Metrics
              key={id}
              selectedFilters={{
                ...getDataFromSession<SelectedFilters>(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${processId}`),
                processIdSource: process.name
              }}
              startTime={process.startTime}
              processesConnected={allDestinationProcesses}
              filterOptions={{
                destinationProcesses: {
                  placeholder:
                    allDestinationProcesses.length === 1
                      ? allDestinationProcesses[0].destinationName
                      : MetricsLabels.FilterAllDestinationProcesses,
                  disabled: allDestinationProcesses.length === 1,
                  hide: allDestinationProcesses.length === 0
                },
                sourceProcesses: { disabled: true, placeholder: process.name }
              }}
              onGetMetricFilters={handleRefreshMetrics}
            />
          )}
        </>
      }
    />
  );
};

export default Process;
