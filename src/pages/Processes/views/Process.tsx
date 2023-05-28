import { useCallback } from 'react';

import { Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { isPrometheusActive } from '@API/Prometheus.queries';
import { RESTApi } from '@API/REST';
import { AvailableProtocols } from '@API/REST.enum';
import { DEFAULT_TABLE_PAGE_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Slide';
import ViewDetailCell from '@core/components/ViewDetailsCell';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { ProcessPairsResponse } from 'API/REST.interfaces';

import ProcessDescription from '../components/ProcessDescription';
import { processesConnectedColumns, ProcessesConnectedComponentsTable } from '../Processes.constant';
import { ProcessesLabels, ProcessesRoutesPaths } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const PAGINATION_SIZE = Math.ceil(DEFAULT_TABLE_PAGE_SIZE / 2);
const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'process-display-interval';

const Process = function () {
  const { id } = useParams() as { id: string };
  const { id: processId } = getIdAndNameFromUrlParams(id);

  const processesPairsTxQueryParams = {
    sourceId: processId,
    endTime: 0
  };

  const processesPairsRxQueryParams = {
    destinationId: processId,
    endTime: 0
  };

  const { data: process, isLoading: isLoadingProcess } = useQuery([QueriesProcesses.GetProcess, processId], () =>
    RESTApi.fetchProcess(processId)
  );

  const { data: processesPairsTxData, isLoading: isLoadingProcessesPairsTxData } = useQuery(
    [QueriesProcesses.GetProcessPairsTx, processesPairsTxQueryParams],
    () => RESTApi.fetchProcessesPairs(processesPairsTxQueryParams)
  );

  const { data: processesPairsRxData, isLoading: isLoadingProcessesPairsRxData } = useQuery(
    [QueriesProcesses.GetProcessPairsRx, processesPairsRxQueryParams],
    () => RESTApi.fetchProcessesPairs(processesPairsRxQueryParams)
  );

  const handleRefreshMetrics = useCallback(
    (filters: SelectedFilters) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${processId}`, filters);
    },
    [processId]
  );

  if (isLoadingProcess || isLoadingProcessesPairsTxData || isLoadingProcessesPairsRxData) {
    return <LoadingPage />;
  }

  if (!process || !processesPairsTxData || !processesPairsRxData) {
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

  return (
    <TransitionPage>
      <Grid hasGutter data-testid={getTestsIds.processView(processId)}>
        <GridItem>
          <SkTitle
            title={process.name}
            icon="process"
            link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${processId}`}
          />
        </GridItem>

        {/* Process Details */}
        <GridItem>
          <ProcessDescription process={process} title={ProcessesLabels.Details} />
        </GridItem>

        <GridItem>
          <Flex direction={{ default: 'column', xl: 'row' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            {!!TCPClients.length && (
              <FlexItem flex={{ default: 'flex_1' }} alignSelf={{ default: 'alignSelfStretch' }}>
                <SkTable
                  title={ProcessesLabels.TCPClients}
                  columns={processesConnectedColumns}
                  rows={TCPClients}
                  pageSizeStart={PAGINATION_SIZE}
                  components={{
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
                  title={ProcessesLabels.TCPServers}
                  columns={processesConnectedColumns}
                  rows={TCPServers}
                  pageSizeStart={PAGINATION_SIZE}
                  components={{
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
                  title={ProcessesLabels.HTTPClients}
                  columns={processesConnectedColumns}
                  rows={HTTPClients}
                  pageSizeStart={PAGINATION_SIZE}
                  components={{
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
                  title={ProcessesLabels.HTTPServers}
                  columns={processesConnectedColumns}
                  rows={HTTPServers}
                  pageSizeStart={PAGINATION_SIZE}
                  components={{
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
        </GridItem>
        {/* Process Metrics - key reset the component(state) when we click on a link from the server or client table*/}
        {isPrometheusActive() && (
          <GridItem>
            <Metrics
              key={id}
              selectedFilters={{
                ...getDataFromSession<SelectedFilters>(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${processId}`),
                processIdSource: process.name
              }}
              startTime={process.startTime}
              processesConnected={[...HTTPServers, ...HTTPClients, ...TCPServers, ...TCPClients]}
              filterOptions={{
                destinationProcesses: { placeholder: MetricsLabels.FilterAllDestinationProcesses },
                sourceProcesses: { disabled: true, placeholder: process.name }
              }}
              onGetMetricFilters={handleRefreshMetrics}
            />
          </GridItem>
        )}
      </Grid>
    </TransitionPage>
  );
};

export default Process;
