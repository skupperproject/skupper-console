import React, { useCallback, useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbHeading,
  BreadcrumbItem,
  Flex,
  Grid,
  GridItem,
  Icon,
  Title
} from '@patternfly/react-core';
import { LongArrowAltLeftIcon, LongArrowAltRightIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import LinkCell from '@core/components/LinkCell';
import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { flowPairsComponentsTable } from '@pages/shared/FlowPairs/FlowPairs.constant';
import LoadingPage from '@pages/shared/Loading';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { RESTApi } from 'API/REST';
import { AvailableProtocols } from 'API/REST.enum';
import { ProcessResponse, RequestOptions } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE, UPDATE_INTERVAL } from 'config';

import ProcessDescription from '../components/ProcessDescription';
import { HttpProcessesFlowPairsColumns, TcpProcessesFlowPairsColumns } from '../Processes.constant';
import { ProcessesLabels, ProcessesRoutesPaths, ProcessPairsColumnsNames } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const initAllFlowParisQueryParamsPaginated = {
  timeRangeStart: 0,
  offset: 0,
  limit: DEFAULT_TABLE_PAGE_SIZE
};

const ProcessPairs = function () {
  const { processId, flowPairId } = useParams();

  const ids = flowPairId?.split('-to-') || [];
  const sourceId = ids[0];
  const destinationId = ids[1];

  const navigate = useNavigate();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
  const [flowPairsQueryParamsPaginated, setFlowParisQueryParamsPaginated] = useState<RequestOptions>(
    initAllFlowParisQueryParamsPaginated
  );

  const { data: sourceProcess, isLoading: isLoadingSourceProcess } = useQuery(
    [QueriesProcesses.GetProcess],
    () => (sourceId ? RESTApi.fetchProcess(sourceId) : undefined),
    {
      onError: handleError
    }
  );

  const { data: destinationProcess, isLoading: isLoadingDestinationProcess } = useQuery(
    [QueriesProcesses.GetDestinationProcess],
    () => (destinationId ? RESTApi.fetchProcess(destinationId) : undefined),
    {
      onError: handleError
    }
  );

  const { data: flowPairsPairsData, isLoading: isLoadingFlowPairsPairsData } = useQuery(
    [QueriesProcesses.GetFlowPairs, { ...initAllFlowParisQueryParamsPaginated, ...flowPairsQueryParamsPaginated }],
    () =>
      RESTApi.fetchFlowPairs({
        ...initAllFlowParisQueryParamsPaginated,
        ...flowPairsQueryParamsPaginated,
        filter: `processAggregateId.${flowPairId}`
      }),
    {
      keepPreviousData: true,
      refetchInterval,
      onError: handleError
    }
  );

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  const handleGetFiltersFlowPairs = useCallback((params: RequestOptions) => {
    setFlowParisQueryParamsPaginated(params);
  }, []);

  if (isLoadingFlowPairsPairsData || isLoadingDestinationProcess || isLoadingSourceProcess) {
    return <LoadingPage />;
  }

  if (!flowPairsPairsData || !sourceProcess || !destinationProcess) {
    return null;
  }

  const TcpFlowPairs = flowPairsPairsData.results.filter(({ protocol }) => isTcp(protocol as AvailableProtocols));

  const HttpFlowPairs = flowPairsPairsData.results.filter(({ protocol }) => !isTcp(protocol as AvailableProtocols));

  const flowPairsPaginatedCount = flowPairsPairsData.timeRangeCount;
  const processName = processId === sourceId ? sourceProcess.name : destinationProcess.name;

  return (
    <TransitionPage>
      <Grid hasGutter>
        <GridItem>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to={ProcessesRoutesPaths.Processes}>{ProcessesLabels.Section}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link to={`${ProcessesRoutesPaths.Processes}/${processId}`}>{`${processName}`}</Link>
            </BreadcrumbItem>
            <BreadcrumbHeading to="#">{'flow pairs'}</BreadcrumbHeading>
          </Breadcrumb>
        </GridItem>

        <GridItem>
          <Flex>
            <Title headingLevel="h1">{ProcessPairsColumnsNames.Title}</Title>
            <Link
              to={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${flowPairId}`}
            >
              {`(${ProcessesLabels.GoToTopology})`}
            </Link>
          </Flex>
        </GridItem>
        <GridItem span={5}>
          <ProcessDescription
            process={sourceProcess}
            title={LinkCell<ProcessResponse>({
              data: sourceProcess,
              value: sourceProcess.name,
              link: `${ProcessesRoutesPaths.Processes}/${sourceId}`,
              type: 'process'
            })}
          />
        </GridItem>

        <GridItem
          span={2}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon status="success" size="xl">
            <LongArrowAltRightIcon />
          </Icon>
          <Icon status="info" size="xl">
            <LongArrowAltLeftIcon />
          </Icon>
        </GridItem>

        <GridItem span={5}>
          <ProcessDescription
            process={destinationProcess}
            title={LinkCell<ProcessResponse>({
              data: destinationProcess,
              value: destinationProcess.name,
              link: `${ProcessesRoutesPaths.Processes}/${destinationId}`,
              type: 'process'
            })}
          />
        </GridItem>

        {!!TcpFlowPairs.length && (
          <GridItem>
            <SkTable
              title={ProcessesLabels.TcpConnection}
              columns={TcpProcessesFlowPairsColumns}
              rows={TcpFlowPairs}
              pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
              components={flowPairsComponentsTable}
            />
          </GridItem>
        )}

        {!!HttpFlowPairs.length && (
          <GridItem>
            <SkTable
              title={ProcessesLabels.HttpRequests}
              columns={HttpProcessesFlowPairsColumns}
              rows={HttpFlowPairs}
              onGetFilters={handleGetFiltersFlowPairs}
              rowsCount={flowPairsPaginatedCount}
              components={flowPairsComponentsTable}
            />
          </GridItem>
        )}
      </Grid>
    </TransitionPage>
  );
};

export default ProcessPairs;

function isTcp(protocolSelected: AvailableProtocols) {
  return protocolSelected === AvailableProtocols.Tcp;
}
