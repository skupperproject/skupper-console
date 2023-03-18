import React from 'react';

import { Breadcrumb, BreadcrumbHeading, BreadcrumbItem, Flex, Grid, GridItem, Title } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import ResourceIcon from '@core/components/ResourceIcon';
import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { isPrometheusActive } from 'API/Prometheus.constant';
import { RESTApi } from 'API/REST';
import { FlowAggregatesResponse } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import Metrics from '../components/Metrics';
import ProcessDescription from '../components/ProcessDescription';
import { processesConnectedColumns, ProcessesConnectedComponentsTable } from '../Processes.constant';
import { ProcessesLabels, ProcessesRoutesPaths, ProcessPairsColumnsNames } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const Process = function () {
  const navigate = useNavigate();
  const { id: processId } = useParams() as { id: string };
  const metricsEnabled = isPrometheusActive();

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
      destinationId: processPairsData.sourceId,
      sourceOctets: processPairsData.destinationOctets,
      destinationOctets: processPairsData.sourceOctets,
      sourceAverageLatency: processPairsData.destinationAverageLatency,
      destinationAverageLatency: processPairsData.sourceAverageLatency
    })) || [];

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

        {/* Process Metrics*/}
        {metricsEnabled && (
          <Metrics process={process} processesConnected={[...processesPairsTxData, ...processesPairsRxReverse]} />
        )}

        {/* Table server processes*/}
        <GridItem span={6}>
          <SkTable
            title={ProcessesLabels.Servers}
            columns={processesConnectedColumns}
            rows={processesPairsTxData}
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
