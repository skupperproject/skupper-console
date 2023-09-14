import { useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import {
  Bullseye,
  Card,
  CardBody,
  Grid,
  GridItem,
  Icon,
  Stack,
  StackItem,
  Tab,
  Tabs,
  TabTitleText
} from '@patternfly/react-core';
import { LongArrowAltRightIcon, ResourcesEmptyIcon } from '@patternfly/react-icons';
import { useQueries } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { DEFAULT_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import EmptyData from '@core/components/EmptyData';
import LinkCell from '@core/components/LinkCell';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import MainContainer from '@layout/MainContainer';
import FlowPairsTable from '@pages/shared/FlowPair/FlowPairsTable';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { ProcessResponse, RequestOptions } from 'API/REST.interfaces';
import { VarColors } from 'colors';

import ProcessDescription from '../components/ProcessDescription';
import { activeTcpColumns, httpColumns, oldTcpColumns } from '../Processes.constants';
import { ProcessesLabels, ProcessesRoutesPaths, ProcessPairsLabels } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const TAB_1_KEY = 'liveConnections';
const TAB_2_KEY = 'connections';

const initPaginatedFlowPairsQueryParams: RequestOptions = {
  offset: 0,
  limit: DEFAULT_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

const initPaginatedHttpRequestsQueryParams: RequestOptions = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: AvailableProtocols.Http
};

const initPaginatedHttp2RequestsQueryParams: RequestOptions = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: AvailableProtocols.Http2
};

const initPaginatedActiveConnectionsQueryParams: RequestOptions = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: AvailableProtocols.Tcp,
  state: TcpStatus.Active
};

const initPaginatedOldConnectionsQueryParams: RequestOptions = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: AvailableProtocols.Tcp,
  state: TcpStatus.Terminated
};

const ProcessPairs = function () {
  const { processPair } = useParams() as { processPair: string };
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: processPairId, protocol } = getIdAndNameFromUrlParams(processPair);
  const type = searchParams.get('type') || TAB_1_KEY;
  const ids = processPairId?.split('-to-') || [];
  const sourceId = ids[0];
  const destinationId = ids[1];

  const [connectionsView, setConnectionsView] = useState<string>(type);

  const [httpQueryParamsPaginated, setHttpQueryParamsPaginated] = useState<RequestOptions>(
    initPaginatedHttpRequestsQueryParams
  );

  const [http2QueryParamsPaginated, setHttp2QueryParamsPaginated] = useState<RequestOptions>(
    initPaginatedHttp2RequestsQueryParams
  );

  const [oldConnectionsQueryParamsPaginated, setOldConnectionsQueryParamsPaginated] = useState<RequestOptions>(
    initPaginatedOldConnectionsQueryParams
  );

  const [activeConnectionsQueryParamsPaginated, setActiveConnectionsQueryParamsPaginated] = useState<RequestOptions>(
    initPaginatedActiveConnectionsQueryParams
  );

  const [
    { data: source },
    { data: destination },
    { data: sourceServices },
    { data: destinationServices },
    { data: http2RequestsData },
    { data: httpRequestsData },
    { data: activeConnectionsData },
    { data: oldConnectionsData }
  ] = useQueries({
    queries: [
      { queryKey: [QueriesProcesses.GetProcess, sourceId], queryFn: () => RESTApi.fetchProcess(sourceId) },

      {
        queryKey: [QueriesProcesses.GetDestination, destinationId],
        queryFn: () => RESTApi.fetchProcess(destinationId)
      },

      {
        queryKey: [QueriesProcesses.GetServicesByProcessId, sourceId],
        queryFn: () => RESTApi.fetchServicesByProcess(sourceId)
      },

      {
        queryKey: [QueriesProcesses.GetServicesByProcessId, destinationId],
        queryFn: () => RESTApi.fetchServicesByProcess(destinationId)
      },

      {
        queryKey: [QueriesProcesses.GetFlowPair, http2QueryParamsPaginated, processPairId],
        queryFn: () =>
          RESTApi.fetchFlowPairs({
            ...http2QueryParamsPaginated,
            processAggregateId: processPairId
          }),
        enabled: protocol === AvailableProtocols.Http2,
        refetchInterval: UPDATE_INTERVAL,
        keepPreviousData: true
      },

      {
        queryKey: [QueriesProcesses.GetFlowPairs, httpQueryParamsPaginated, processPairId],
        queryFn: () =>
          RESTApi.fetchFlowPairs({
            ...httpQueryParamsPaginated,
            processAggregateId: processPairId
          }),
        enabled: protocol === AvailableProtocols.Http,
        refetchInterval: UPDATE_INTERVAL,
        keepPreviousData: true
      },

      {
        queryKey: [QueriesProcesses.GetFlowPairs, activeConnectionsQueryParamsPaginated, processPairId],
        queryFn: () =>
          RESTApi.fetchFlowPairs({
            ...activeConnectionsQueryParamsPaginated,
            processAggregateId: processPairId
          }),
        enabled: protocol === AvailableProtocols.Tcp,
        refetchInterval: UPDATE_INTERVAL,
        keepPreviousData: true
      },

      {
        queryKey: [QueriesProcesses.GetFlowPairs, oldConnectionsQueryParamsPaginated, processPairId],
        queryFn: () =>
          RESTApi.fetchFlowPairs({
            ...oldConnectionsQueryParamsPaginated,
            processAggregateId: processPairId
          }),
        enabled: protocol === AvailableProtocols.Tcp,
        refetchInterval: UPDATE_INTERVAL,
        keepPreviousData: true
      }
    ]
  });

  const handleGetFiltersHttpRequests = useCallback((params: RequestOptions) => {
    setHttpQueryParamsPaginated({ ...initPaginatedHttpRequestsQueryParams, ...params });
  }, []);

  const handleGetFiltersHttp2Requests = useCallback((params: RequestOptions) => {
    setHttp2QueryParamsPaginated({ ...initPaginatedHttp2RequestsQueryParams, ...params });
  }, []);

  const handleGetFiltersActiveTcpRequests = useCallback((params: RequestOptions) => {
    setActiveConnectionsQueryParamsPaginated({ ...initPaginatedActiveConnectionsQueryParams, ...params });
  }, []);

  const handleGetFiltersOldTcpRequests = useCallback((params: RequestOptions) => {
    setOldConnectionsQueryParamsPaginated({ ...initPaginatedOldConnectionsQueryParams, ...params });
  }, []);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setConnectionsView(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

  if (!source || !destination || !sourceServices || !destinationServices) {
    return null;
  }

  if (protocol === AvailableProtocols.Http && !httpRequestsData) {
    return null;
  }

  if (protocol === AvailableProtocols.Http2 && !http2RequestsData) {
    return null;
  }

  if (protocol === AvailableProtocols.Tcp && (!oldConnectionsData || !activeConnectionsData)) {
    return null;
  }

  const httpRequests = httpRequestsData?.results || [];
  const httpRequestsCount = httpRequestsData?.timeRangeCount || 0;

  const http2Requests = http2RequestsData?.results || [];
  const http2RequestsCount = http2RequestsData?.timeRangeCount || 0;

  const oldConnections = oldConnectionsData?.results || [];
  const oldConnectionsCount = oldConnectionsData?.timeRangeCount || 0;

  const activeConnections = activeConnectionsData?.results || [];
  const activeConnectionsCount = activeConnectionsData?.timeRangeCount || 0;

  const ClientServerDescription = function () {
    return (
      <Grid hasGutter>
        <GridItem sm={12} md={5}>
          <ProcessDescription
            processWithService={{ ...source, services: sourceServices }}
            title={LinkCell<ProcessResponse>({
              data: source,
              value: source.name,
              link: `${ProcessesRoutesPaths.Processes}/${source.name}@${sourceId}`
            })}
          />
        </GridItem>

        <GridItem sm={12} md={2}>
          <Bullseye>
            <Icon size="xl">
              <LongArrowAltRightIcon color={VarColors.Black500} />
            </Icon>
          </Bullseye>
        </GridItem>

        <GridItem sm={12} md={5}>
          <ProcessDescription
            processWithService={{ ...destination, services: destinationServices }}
            title={LinkCell<ProcessResponse>({
              data: destination,
              value: destination.name,
              link: `${ProcessesRoutesPaths.Processes}/${destination.name}@${destinationId}`
            })}
          />
        </GridItem>
      </Grid>
    );
  };

  const NoDataCard = function () {
    return (
      <Card isFullHeight>
        <CardBody>
          <EmptyData
            message={ProcessesLabels.ProcessPairsEmptyTitle}
            description={ProcessesLabels.ProcessPairsEmptyMessage}
            icon={ResourcesEmptyIcon}
          />
        </CardBody>
      </Card>
    );
  };

  return (
    <MainContainer
      dataTestId={getTestsIds.processPairsView(processPairId)}
      title={ProcessPairsLabels.Title}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${processPairId}`}
      mainContentChildren={
        <Stack hasGutter>
          <StackItem>
            <ClientServerDescription />
          </StackItem>

          {!activeConnectionsCount && !oldConnectionsCount && !http2Requests.length && !httpRequests.length && (
            <StackItem isFilled>
              <NoDataCard />
            </StackItem>
          )}

          {((protocol === AvailableProtocols.Tcp && !!activeConnectionsCount) || !!oldConnectionsCount) && (
            <StackItem isFilled>
              <Tabs activeKey={connectionsView} onSelect={handleTabClick} component="nav" isBox>
                <Tab
                  eventKey={TAB_1_KEY}
                  title={
                    <TabTitleText>{`${ProcessesLabels.ActiveConnections} (${activeConnectionsCount})`}</TabTitleText>
                  }
                >
                  <FlowPairsTable
                    columns={activeTcpColumns}
                    rows={activeConnections}
                    paginationTotalRows={activeConnectionsCount}
                    pagination={true}
                    paginationPageSize={DEFAULT_PAGINATION_SIZE}
                    onGetFilters={handleGetFiltersActiveTcpRequests}
                  />
                </Tab>
                <Tab
                  disabled={oldConnectionsCount === 0}
                  eventKey={TAB_2_KEY}
                  title={<TabTitleText>{`${ProcessesLabels.OldConnections} (${oldConnectionsCount})`}</TabTitleText>}
                >
                  <FlowPairsTable
                    columns={oldTcpColumns}
                    rows={oldConnections}
                    paginationTotalRows={oldConnectionsCount}
                    pagination={true}
                    paginationPageSize={DEFAULT_PAGINATION_SIZE}
                    onGetFilters={handleGetFiltersOldTcpRequests}
                  />
                </Tab>
              </Tabs>
            </StackItem>
          )}
          {protocol === AvailableProtocols.Http2 && !!http2Requests.length && (
            <StackItem isFilled>
              <FlowPairsTable
                title={ProcessesLabels.Http2Requests}
                columns={httpColumns}
                rows={http2Requests}
                paginationTotalRows={http2RequestsCount}
                pagination={true}
                paginationPageSize={DEFAULT_PAGINATION_SIZE}
                onGetFilters={handleGetFiltersHttp2Requests}
              />
            </StackItem>
          )}
          {protocol === AvailableProtocols.Http && !!httpRequests.length && (
            <StackItem isFilled>
              <FlowPairsTable
                title={ProcessesLabels.HttpRequests}
                columns={httpColumns}
                rows={httpRequests}
                paginationTotalRows={httpRequestsCount}
                pagination={true}
                paginationPageSize={DEFAULT_PAGINATION_SIZE}
                onGetFilters={handleGetFiltersHttpRequests}
              />
            </StackItem>
          )}
        </Stack>
      }
    />
  );
};

export default ProcessPairs;
