import { useCallback } from 'react';

import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { isPrometheusActive, SMALL_PAGINATION_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import ViewDetailCell from '@core/components/ViewDetailsCell';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import MainContainer from '@layout/MainContainer';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { ProcessPairsResponse } from 'API/REST.interfaces';

import ProcessDescription from '../components/ProcessDescription';
import {
  processesConnectedColumns,
  ProcessesConnectedComponentsTable,
  processesHttpConnectedColumns
} from '../Processes.constant';
import { ProcessesLabels, ProcessesRoutesPaths } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'process-display-interval';

const Process = function () {
  const { id } = useParams() as { id: string };
  const { id: processId } = getIdAndNameFromUrlParams(id);

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

  const { data: services } = useQuery([QueriesProcesses.GetAddressesByProcessId, processId], () =>
    RESTApi.fetchAddressesByProcess(processId)
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

  return (
    <MainContainer
      dataTestId={getTestsIds.processView(processId)}
      title={process.name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${processId}`}
      mainContentChildren={
        <Stack hasGutter>
          <StackItem>
            <ProcessDescription processWithService={{ ...process, services }} title={ProcessesLabels.Details} />
          </StackItem>
          <StackItem>
            <Flex
              direction={{ default: 'column', xl: 'row' }}
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
            >
              {!!TCPClients.length && (
                <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
                  <SkTable
                    isFullHeight
                    title={ProcessesLabels.TCPClients}
                    columns={processesConnectedColumns}
                    rows={TCPClients}
                    pagination={true}
                    paginationPageSize={SMALL_PAGINATION_SIZE}
                    customCells={{
                      ...ProcessesConnectedComponentsTable,
                      viewDetailsLinkCell: ({ data }: LinkCellProps<ProcessPairsResponse>) => (
                        <ViewDetailCell
                          link={`${ProcessesRoutesPaths.Processes}/${process.name}@${processId}/${data.identity}`}
                        />
                      )
                    }}
                  />
                </FlexItem>
              )}

              {!!TCPServers.length && (
                <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
                  <SkTable
                    isFullHeight
                    title={ProcessesLabels.TCPServers}
                    columns={processesConnectedColumns}
                    rows={TCPServers}
                    pagination={true}
                    paginationPageSize={SMALL_PAGINATION_SIZE}
                    customCells={{
                      ...ProcessesConnectedComponentsTable,
                      viewDetailsLinkCell: ({ data }: LinkCellProps<ProcessPairsResponse>) => (
                        <ViewDetailCell
                          link={`${ProcessesRoutesPaths.Processes}/${process.name}@${process.identity}/${data.identity}`}
                        />
                      )
                    }}
                  />
                </FlexItem>
              )}

              {!!HTTPClients.length && (
                <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
                  <SkTable
                    isFullHeight
                    title={ProcessesLabels.HTTPClients}
                    columns={processesHttpConnectedColumns}
                    rows={HTTPClients}
                    pagination={true}
                    paginationPageSize={SMALL_PAGINATION_SIZE}
                    customCells={{
                      ...ProcessesConnectedComponentsTable,
                      viewDetailsLinkCell: ({ data }: LinkCellProps<ProcessPairsResponse>) => (
                        <ViewDetailCell
                          link={`${ProcessesRoutesPaths.Processes}/${process.name}@${processId}/${data.identity}`}
                        />
                      )
                    }}
                  />
                </FlexItem>
              )}

              {!!HTTPServers.length && (
                <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
                  <SkTable
                    isFullHeight
                    title={ProcessesLabels.HTTPServers}
                    columns={processesHttpConnectedColumns}
                    rows={HTTPServers}
                    pagination={true}
                    paginationPageSize={SMALL_PAGINATION_SIZE}
                    customCells={{
                      ...ProcessesConnectedComponentsTable,
                      viewDetailsLinkCell: ({ data }: LinkCellProps<ProcessPairsResponse>) => (
                        <ViewDetailCell
                          link={`${ProcessesRoutesPaths.Processes}/${process.name}@${process.identity}/${data.identity}`}
                        />
                      )
                    }}
                  />
                </FlexItem>
              )}

              {!!remoteClients.length && (
                <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
                  <SkTable
                    isFullHeight
                    title={ProcessesLabels.RemoteClients}
                    columns={processesConnectedColumns}
                    rows={remoteClients}
                    pagination={true}
                    paginationPageSize={SMALL_PAGINATION_SIZE}
                    customCells={{
                      ...ProcessesConnectedComponentsTable,
                      viewDetailsLinkCell: ({ data }: LinkCellProps<ProcessPairsResponse>) => (
                        <ViewDetailCell
                          link={`${ProcessesRoutesPaths.Processes}/${process.name}@${process.identity}/${data.identity}`}
                        />
                      )
                    }}
                  />
                </FlexItem>
              )}

              {!!remoteServers.length && (
                <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
                  <SkTable
                    isFullHeight
                    title={ProcessesLabels.RemoteServers}
                    columns={processesConnectedColumns}
                    rows={remoteServers}
                    pagination={true}
                    paginationPageSize={SMALL_PAGINATION_SIZE}
                    customCells={{
                      ...ProcessesConnectedComponentsTable,
                      viewDetailsLinkCell: ({ data }: LinkCellProps<ProcessPairsResponse>) => (
                        <ViewDetailCell
                          link={`${ProcessesRoutesPaths.Processes}/${process.name}@${process.identity}/${data.identity}`}
                        />
                      )
                    }}
                  />
                </FlexItem>
              )}
            </Flex>
          </StackItem>
          {/* Process Metrics - key reset the component(state) when we click on a link from the server or client table*/}
          {isPrometheusActive && (
            <StackItem isFilled>
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
            </StackItem>
          )}
        </Stack>
      }
    />
  );
};

export default Process;
