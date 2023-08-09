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
import { useQuery } from '@tanstack/react-query';
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

import ProcessDescription from '../components/ProcessDescription';
import { activeTcpColumns, httpColumns, oldTcpColumns } from '../Processes.constants';
import { ProcessesLabels, ProcessesRoutesPaths, ProcessPairsColumnsNames } from '../Processes.enum';
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

  const { id: processPairId } = getIdAndNameFromUrlParams(processPair);
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

  const { data: source } = useQuery([QueriesProcesses.GetProcess, sourceId], () => RESTApi.fetchProcess(sourceId));
  const { data: destination } = useQuery([QueriesProcesses.GetDestination, destinationId], () =>
    RESTApi.fetchProcess(destinationId)
  );

  const { data: http2RequestsData } = useQuery(
    [QueriesProcesses.GetFlowPairs, http2QueryParamsPaginated],
    () =>
      RESTApi.fetchFlowPairs({
        ...http2QueryParamsPaginated,
        processAggregateId: processPairId
      }),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: httpRequestsData } = useQuery(
    [QueriesProcesses.GetHttp, httpQueryParamsPaginated],
    () =>
      RESTApi.fetchFlowPairs({
        ...httpQueryParamsPaginated,
        processAggregateId: processPairId
      }),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: activeConnectionsData } = useQuery(
    [QueriesProcesses.GetFlowPairs, activeConnectionsQueryParamsPaginated],
    () =>
      RESTApi.fetchFlowPairs({
        ...activeConnectionsQueryParamsPaginated,
        processAggregateId: processPairId
      }),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: oldConnectionsData } = useQuery(
    [QueriesProcesses.GetFlowPairs, oldConnectionsQueryParamsPaginated],
    () =>
      RESTApi.fetchFlowPairs({
        ...oldConnectionsQueryParamsPaginated,
        processAggregateId: processPairId
      }),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: sourceServices } = useQuery([QueriesProcesses.GetAddressesByProcessId, sourceId], () =>
    RESTApi.fetchAddressesByProcess(sourceId)
  );

  const { data: destinationServices } = useQuery([QueriesProcesses.GetAddressesByProcessId, destinationId], () =>
    RESTApi.fetchAddressesByProcess(destinationId)
  );

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

  if (
    !httpRequestsData ||
    !source ||
    !destination ||
    !oldConnectionsData ||
    !activeConnectionsData ||
    !http2RequestsData ||
    !sourceServices ||
    !destinationServices
  ) {
    return null;
  }

  const { timeRangeCount: httpRequestsCount, results: httpRequests } = httpRequestsData;
  const { timeRangeCount: http2RequestsCount, results: http2Requests } = http2RequestsData;
  const { timeRangeCount: oldConnectionsCount, results: oldConnections } = oldConnectionsData;
  const { timeRangeCount: activeConnectionsCount, results: activeConnections } = activeConnectionsData;

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
              <LongArrowAltRightIcon color="var(--pf-v5-global--palette--black-500)" />
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
      title={ProcessPairsColumnsNames.Title}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${processPairId}`}
      mainContentChildren={
        <Stack hasGutter>
          <StackItem>
            <ClientServerDescription />
          </StackItem>

          {!activeConnections.length && !oldConnectionsCount && !http2Requests.length && !httpRequests.length && (
            <StackItem isFilled>
              <NoDataCard />
            </StackItem>
          )}

          {(!!activeConnections.length || !!oldConnectionsCount) && (
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
          {!!http2Requests.length && (
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
          {!!httpRequests.length && (
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
