import React from 'react';

import { Grid, GridItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import { DEFAULT_TABLE_PAGE_SIZE } from '@config/config';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { isPrometheusActive } from 'API/Prometheus.constant';
import { ProcessPairsResponse } from 'API/REST.interfaces';

import ProcessDescription from '../components/ProcessDescription';
import { processesConnectedColumns, ProcessesConnectedComponentsTable } from '../Processes.constant';
import { ProcessesLabels, ProcessesRoutesPaths, ProcessPairsColumnsNames } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const Process = function () {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const { id: processId } = getIdAndNameFromUrlParams(id);

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
        filter: `sourceId.${processId}`
      }),
    {
      onError: handleError
    }
  );

  const { data: processesPairsRxData, isLoading: isLoadingProcessesPairsRxData } = useQuery(
    [QueriesProcesses.GetProcessPairsRx, processId],
    () =>
      RESTApi.fetchProcessesPairs({
        filter: `destinationId.${processId}`
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

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    navigate(route);
  }

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

  return (
    <TransitionPage>
      <Grid hasGutter>
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

        {/* Table server processes*/}
        <GridItem span={6}>
          <SkTable
            title={ProcessesLabels.Servers}
            columns={processesConnectedColumns}
            rows={processesPairsTxData}
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

        {/* Table client processes*/}
        <GridItem span={6}>
          <SkTable
            title={ProcessesLabels.Clients}
            columns={processesConnectedColumns}
            rows={processesPairsRxReverse}
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

        {/* Process Metrics*/}
        {isPrometheusActive() && (
          <GridItem>
            <Metrics
              parent={{ id: process.name, name: process.name, startTime: process.startTime }}
              processesConnected={[...processesPairsTxData, ...processesPairsRxReverse]}
              customFilters={{
                destinationProcesses: { name: MetricsLabels.FilterAllDestinationProcesses },
                sourceProcesses: { disabled: true, name: process.name }
              }}
            />
          </GridItem>
        )}
      </Grid>
    </TransitionPage>
  );
};

export default Process;
