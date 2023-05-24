import { Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { isPrometheusActive } from '@API/Prometheus.queries';
import { RESTApi } from '@API/REST';
import { AvailableProtocols } from '@API/REST.enum';
import { DEFAULT_TABLE_PAGE_SIZE } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { ProcessPairsResponse } from 'API/REST.interfaces';

import ProcessDescription from '../components/ProcessDescription';
import { processesConnectedColumns, ProcessesConnectedComponentsTable } from '../Processes.constant';
import { ProcessesLabels, ProcessesRoutesPaths, ProcessPairsColumnsNames } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const Process = function () {
  const { id } = useParams() as { id: string };
  const { id: processId } = getIdAndNameFromUrlParams(id);

  const { data: process, isLoading: isLoadingProcess } = useQuery([QueriesProcesses.GetProcess, processId], () =>
    RESTApi.fetchProcess(processId)
  );

  const { data: processesPairsTxData, isLoading: isLoadingProcessesPairsTxData } = useQuery(
    [QueriesProcesses.GetProcessPairsTx, `sourceId.${processId}`],
    () =>
      RESTApi.fetchProcessesPairs({
        sourceId: processId,
        endTime: 0
      })
  );

  const { data: processesPairsRxData, isLoading: isLoadingProcessesPairsRxData } = useQuery(
    [QueriesProcesses.GetProcessPairsRx, `destinationId.${processId}`],
    () =>
      RESTApi.fetchProcessesPairs({
        destinationId: processId,
        endTime: 0
      })
  );

  const { data: addresses, isLoading: isLoadingAddressesByProcess } = useQuery(
    [QueriesProcesses.GetAddressesByProcessId, processId],
    () => RESTApi.fetchAddressesByProcess(processId)
  );

  if (
    isLoadingProcess ||
    isLoadingAddressesByProcess ||
    isLoadingProcessesPairsTxData ||
    isLoadingProcessesPairsRxData
  ) {
    return <LoadingPage />;
  }

  if (!process || !processesPairsTxData || !processesPairsRxData || !addresses) {
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
      <Grid hasGutter data-testid={getTestsIds.processView(processId)} key={processId}>
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

        {/* TCP clients and server processes*/}
        {!!(TCPServers.length || TCPClients.length) && (
          <>
            <GridItem span={6}>
              <SkTable
                title={ProcessesLabels.TCPServers}
                columns={processesConnectedColumns}
                rows={TCPServers}
                pageSizeStart={DEFAULT_TABLE_PAGE_SIZE / 2}
                components={{
                  ...ProcessesConnectedComponentsTable,
                  viewDetailsLinkCell: (props: LinkCellProps<ProcessPairsResponse>) =>
                    LinkCell({
                      ...props,
                      link: `${ProcessesRoutesPaths.Processes}/${process.name}@${process.identity}/${props.data.identity}`,
                      value: ProcessPairsColumnsNames.ViewDetails
                    })
                }}
              />
            </GridItem>

            <GridItem span={6}>
              <SkTable
                title={ProcessesLabels.TCPClients}
                columns={processesConnectedColumns}
                rows={TCPClients}
                pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                components={{
                  ...ProcessesConnectedComponentsTable,
                  viewDetailsLinkCell: (props: LinkCellProps<ProcessPairsResponse>) =>
                    LinkCell({
                      ...props,
                      link: `${ProcessesRoutesPaths.Processes}/${process.name}@${processId}/${props.data.identity}`,
                      value: ProcessPairsColumnsNames.ViewDetails
                    })
                }}
              />
            </GridItem>
          </>
        )}

        {/* HTTP client and server processes*/}
        {!!(HTTPServers.length || HTTPClients.length) && (
          <>
            <GridItem span={6}>
              <SkTable
                title={ProcessesLabels.HTTPServers}
                columns={processesConnectedColumns}
                rows={HTTPServers}
                pageSizeStart={DEFAULT_TABLE_PAGE_SIZE / 2}
                components={{
                  ...ProcessesConnectedComponentsTable,
                  viewDetailsLinkCell: (props: LinkCellProps<ProcessPairsResponse>) =>
                    LinkCell({
                      ...props,
                      link: `${ProcessesRoutesPaths.Processes}/${process.name}@${process.identity}/${props.data.identity}`,
                      value: ProcessPairsColumnsNames.ViewDetails
                    })
                }}
              />
            </GridItem>

            <GridItem span={6}>
              <SkTable
                title={ProcessesLabels.HTTPClients}
                columns={processesConnectedColumns}
                rows={HTTPClients}
                pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                components={{
                  ...ProcessesConnectedComponentsTable,
                  viewDetailsLinkCell: (props: LinkCellProps<ProcessPairsResponse>) =>
                    LinkCell({
                      ...props,
                      link: `${ProcessesRoutesPaths.Processes}/${process.name}@${processId}/${props.data.identity}`,
                      value: ProcessPairsColumnsNames.ViewDetails
                    })
                }}
              />
            </GridItem>
          </>
        )}

        {/* Process Metrics*/}
        {isPrometheusActive() && (
          <GridItem>
            <Metrics
              selectedFilters={{ processIdSource: process.name }}
              startTime={process.startTime}
              processesConnected={[...processesPairsTxData, ...processesPairsRxReverse]}
              filterOptions={{
                destinationProcesses: { placeholder: MetricsLabels.FilterAllDestinationProcesses },
                sourceProcesses: { disabled: true, placeholder: process.name }
              }}
            />
          </GridItem>
        )}
      </Grid>
    </TransitionPage>
  );
};

export default Process;
