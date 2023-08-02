import { useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import {
  Card,
  CardBody,
  Grid,
  GridItem,
  Icon,
  Modal,
  ModalVariant,
  Stack,
  StackItem,
  Tab,
  Tabs,
  TabTitleText
} from '@patternfly/react-core';
import { LongArrowAltLeftIcon, LongArrowAltRightIcon, ResourcesEmptyIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { DEFAULT_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { getTestsIds } from '@config/testIds.config';
import EmptyData from '@core/components/EmptyData';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import ViewDetailCell from '@core/components/ViewDetailsCell';
import MainContainer from '@layout/MainContainer';
import FlowsPair from '@pages/shared/FlowPairs/FlowPair';
import { flowPairsComponentsTable } from '@pages/shared/FlowPairs/FlowPairs.constants';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { FlowPairsResponse, ProcessResponse, RequestOptions } from 'API/REST.interfaces';

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
  const { processPairId } = useParams() as { processPairId: string };
  const [searchParams, setSearchParams] = useSearchParams();

  const type = searchParams.get('type') || TAB_1_KEY;
  const ids = processPairId?.split('-to-') || [];
  const sourceId = ids[0];
  const destinationId = ids[1];

  const [flowSelected, setFlowSelected] = useState<string>();

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

  const { data: flowPairSelected } = useQuery(
    [QueriesProcesses.GetFlowPair],
    () => (flowSelected ? RESTApi.fetchFlowPair(flowSelected) : null),
    {
      refetchInterval: UPDATE_INTERVAL,
      enabled: !!flowSelected
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

  const handleOnClickDetails = useCallback((id?: string) => {
    setFlowSelected(id);
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

  return (
    <>
      <Modal
        aria-label="No header/footer modal"
        isOpen={!!flowSelected}
        onClose={() => handleOnClickDetails()}
        variant={ModalVariant.medium}
      >
        {!!flowPairSelected && <FlowsPair flowPair={flowPairSelected} />}
      </Modal>

      <MainContainer
        dataTestId={getTestsIds.processPairsView(processPairId)}
        title={ProcessPairsColumnsNames.Title}
        link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${processPairId}`}
        mainContentChildren={
          <Stack hasGutter>
            <StackItem>
              <Grid hasGutter>
                <GridItem span={5}>
                  <ProcessDescription
                    processWithService={{ ...source, services: sourceServices }}
                    title={LinkCell<ProcessResponse>({
                      data: source,
                      value: source.name,
                      link: `${ProcessesRoutesPaths.Processes}/${source.name}@${sourceId}`
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
                    processWithService={{ ...destination, services: destinationServices }}
                    title={LinkCell<ProcessResponse>({
                      data: destination,
                      value: destination.name,
                      link: `${ProcessesRoutesPaths.Processes}/${destination.name}@${destinationId}`
                    })}
                  />
                </GridItem>
              </Grid>
            </StackItem>

            {!activeConnections.length && !oldConnectionsCount && !http2Requests.length && !httpRequests.length && (
              <StackItem isFilled>
                <Card isFullHeight>
                  <CardBody>
                    <EmptyData
                      message={ProcessesLabels.ProcessPairsEmptyTitle}
                      description={ProcessesLabels.ProcessPairsEmptyMessage}
                      icon={ResourcesEmptyIcon}
                    />
                  </CardBody>
                </Card>
              </StackItem>
            )}

            {(!!activeConnections.length || !!oldConnectionsCount) && (
              <StackItem isFilled>
                <Tabs activeKey={connectionsView} onSelect={handleTabClick} component="nav">
                  <Tab
                    eventKey={TAB_1_KEY}
                    title={
                      <TabTitleText>{`${ProcessesLabels.ActiveConnections} (${activeConnectionsCount})`}</TabTitleText>
                    }
                  >
                    <SkTable
                      title={ProcessesLabels.ActiveConnections}
                      columns={activeTcpColumns}
                      rows={activeConnections}
                      paginationTotalRows={activeConnectionsCount}
                      pagination={true}
                      paginationPageSize={DEFAULT_PAGINATION_SIZE}
                      onGetFilters={handleGetFiltersActiveTcpRequests}
                      customCells={{
                        ...flowPairsComponentsTable,
                        viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
                          <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
                        )
                      }}
                    />
                  </Tab>
                  <Tab
                    disabled={oldConnectionsCount === 0}
                    eventKey={TAB_2_KEY}
                    title={<TabTitleText>{`${ProcessesLabels.OldConnections} (${oldConnectionsCount})`}</TabTitleText>}
                  >
                    <SkTable
                      title={ProcessesLabels.OldConnections}
                      columns={oldTcpColumns}
                      rows={oldConnections}
                      paginationTotalRows={oldConnectionsCount}
                      pagination={true}
                      paginationPageSize={DEFAULT_PAGINATION_SIZE}
                      onGetFilters={handleGetFiltersOldTcpRequests}
                      customCells={{
                        ...flowPairsComponentsTable,
                        viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
                          <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
                        )
                      }}
                    />
                  </Tab>
                </Tabs>
              </StackItem>
            )}
            {!!http2Requests.length && (
              <StackItem isFilled>
                <SkTable
                  title={ProcessesLabels.Http2Requests}
                  columns={httpColumns}
                  rows={http2Requests}
                  paginationTotalRows={http2RequestsCount}
                  pagination={true}
                  paginationPageSize={DEFAULT_PAGINATION_SIZE}
                  onGetFilters={handleGetFiltersHttp2Requests}
                  customCells={{
                    ...flowPairsComponentsTable,
                    viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
                      <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
                    )
                  }}
                />
              </StackItem>
            )}
            {!!httpRequests.length && (
              <StackItem isFilled>
                <SkTable
                  title={ProcessesLabels.HttpRequests}
                  columns={httpColumns}
                  rows={httpRequests}
                  paginationTotalRows={httpRequestsCount}
                  pagination={true}
                  paginationPageSize={DEFAULT_PAGINATION_SIZE}
                  onGetFilters={handleGetFiltersHttpRequests}
                  customCells={{
                    ...flowPairsComponentsTable,
                    viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
                      <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
                    )
                  }}
                />
              </StackItem>
            )}
          </Stack>
        }
      />
    </>
  );
};

export default ProcessPairs;
