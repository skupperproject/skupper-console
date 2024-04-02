import { useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import { Card, CardBody, Stack, StackItem, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { ResourcesEmptyIcon } from '@patternfly/react-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { DEFAULT_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { getTestsIds } from '@config/testIds';
import EmptyData from '@core/components/EmptyData';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import MainContainer from '@layout/MainContainer';
import FlowPairs from '@pages/shared/FlowPairs';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';
import { RequestOptions } from 'API/REST.interfaces';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import ProcessPairDetails from '../components/ProcessPairDetails';
import { activeTcpColumns, httpColumns, oldTcpColumns } from '../Processes.constants';
import { ProcessesLabels, QueriesProcesses } from '../Processes.enum';

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

  const { id: processPairId, protocol } = getIdAndNameFromUrlParams(processPair);
  const ids = processPairId?.split('-to-') || [];
  const sourceId = ids[0];
  const destinationId = ids[1];

  const [connectionsView, setConnectionsView] = useState<string>();

  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, connectionsView || '', true);

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

  const { data: http2RequestsData } = useQuery({
    queryKey: [QueriesProcesses.GetFlowPair, http2QueryParamsPaginated, processPairId],
    queryFn: () =>
      RESTApi.fetchFlowPairs({
        ...http2QueryParamsPaginated,
        processAggregateId: processPairId
      }),
    enabled: protocol === AvailableProtocols.Http2,
    refetchInterval: UPDATE_INTERVAL,
    placeholderData: keepPreviousData
  });

  const { data: httpRequestsData } = useQuery({
    queryKey: [QueriesProcesses.GetFlowPairs, httpQueryParamsPaginated, processPairId],
    queryFn: () =>
      RESTApi.fetchFlowPairs({
        ...httpQueryParamsPaginated,
        processAggregateId: processPairId
      }),
    enabled: protocol === AvailableProtocols.Http,
    refetchInterval: UPDATE_INTERVAL,
    placeholderData: keepPreviousData
  });

  const { data: activeConnectionsData } = useQuery({
    queryKey: [QueriesProcesses.GetFlowPairs, activeConnectionsQueryParamsPaginated, processPairId],
    queryFn: () =>
      RESTApi.fetchFlowPairs({
        ...activeConnectionsQueryParamsPaginated,
        processAggregateId: processPairId
      }),
    enabled: protocol === AvailableProtocols.Tcp,
    refetchInterval: UPDATE_INTERVAL,
    placeholderData: keepPreviousData
  });

  const { data: oldConnectionsData } = useQuery({
    queryKey: [QueriesProcesses.GetFlowPairs, oldConnectionsQueryParamsPaginated, processPairId],
    queryFn: () =>
      RESTApi.fetchFlowPairs({
        ...oldConnectionsQueryParamsPaginated,
        processAggregateId: processPairId
      }),
    enabled: protocol === AvailableProtocols.Tcp,
    refetchInterval: UPDATE_INTERVAL,
    placeholderData: keepPreviousData
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
  }

  function setDefaultTcpActiveTab() {
    if (connectionsView) {
      return connectionsView;
    }
    if (activeConnectionsCount) {
      return TAB_1_KEY;
    }

    if (oldConnectionsCount) {
      return TAB_2_KEY;
    }

    return '';
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
      title={ProcessesLabels.Title}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Processes}&${TopologyURLQueyParams.IdSelected}=${processPairId}`}
      mainContentChildren={
        <Stack hasGutter>
          <StackItem>
            <ProcessPairDetails sourceId={sourceId} destinationId={destinationId} />
          </StackItem>

          {!activeConnectionsCount && !oldConnectionsCount && !http2Requests.length && !httpRequests.length && (
            <StackItem isFilled>
              <NoDataCard />
            </StackItem>
          )}

          {((protocol === AvailableProtocols.Tcp && !!activeConnectionsCount) || !!oldConnectionsCount) && (
            <StackItem isFilled>
              <Tabs activeKey={setDefaultTcpActiveTab()} onSelect={handleTabClick} component="nav" isBox>
                <Tab
                  eventKey={TAB_1_KEY}
                  title={
                    <TabTitleText>{`${ProcessesLabels.ActiveConnections} (${activeConnectionsCount})`}</TabTitleText>
                  }
                >
                  <FlowPairs
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
                  <FlowPairs
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
              <FlowPairs
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
              <FlowPairs
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
