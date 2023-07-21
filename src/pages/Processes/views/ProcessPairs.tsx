import { useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import { Grid, GridItem, Icon, Modal, ModalVariant, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { LongArrowAltLeftIcon, LongArrowAltRightIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { DEFAULT_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import ViewDetailCell from '@core/components/ViewDetailsCell';
import FlowsPair from '@pages/shared/FlowPairs/FlowPair';
import { flowPairsComponentsTable } from '@pages/shared/FlowPairs/FlowPairs.constant';
import LoadingPage from '@pages/shared/Loading';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { FlowPairsResponse, ProcessResponse, RequestOptions } from 'API/REST.interfaces';

import ProcessDescription from '../components/ProcessDescription';
import { activeTcpColumns, httpColumns, oldTcpColumns } from '../Processes.constant';
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
  const { processPairId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const [flowSelected, setFlowSelected] = useState<string>();

  const { data: sourceProcess, isLoading: isLoadingSourceProcess } = useQuery([QueriesProcesses.GetProcess], () =>
    sourceId ? RESTApi.fetchProcess(sourceId) : undefined
  );

  const { data: destinationProcess, isLoading: isLoadingDestinationProcess } = useQuery(
    [QueriesProcesses.GetDestinationProcess],
    () => (destinationId ? RESTApi.fetchProcess(destinationId) : undefined)
  );

  const { data: http2RequestsData, isLoading: isLoadingHttp2RequestsData } = useQuery(
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

  const { data: httpRequestsData, isLoading: isLoadingHttpRequestsData } = useQuery(
    ['QueriesProcesses.GetFlowPairs', httpQueryParamsPaginated],
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

  const { data: activeConnectionsData, isLoading: isLoadingActiveConnectionsData } = useQuery(
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

  const { data: oldConnectionsData, isLoading: isLoadingOldConnectionsData } = useQuery(
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
    () => (flowSelected ? RESTApi.fetchFlowPair(flowSelected) : undefined),
    {
      refetchInterval: UPDATE_INTERVAL,
      enabled: !!flowSelected
    }
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
    isLoadingHttpRequestsData ||
    isLoadingDestinationProcess ||
    isLoadingSourceProcess ||
    isLoadingOldConnectionsData ||
    isLoadingActiveConnectionsData ||
    isLoadingHttp2RequestsData
  ) {
    return <LoadingPage />;
  }

  if (
    !httpRequestsData ||
    !sourceProcess ||
    !destinationProcess ||
    !oldConnectionsData ||
    !activeConnectionsData ||
    !http2RequestsData
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
        <FlowsPair flowPair={flowPairSelected} />
      </Modal>

      <SkTitle
        title={ProcessPairsColumnsNames.Title}
        link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${processPairId}`}
        secondaryChildren={
          <Grid hasGutter>
            <GridItem span={5}>
              <ProcessDescription
                process={sourceProcess}
                title={LinkCell<ProcessResponse>({
                  data: sourceProcess,
                  value: sourceProcess.name,
                  link: `${ProcessesRoutesPaths.Processes}/${sourceProcess.name}@${sourceId}`
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
                  link: `${ProcessesRoutesPaths.Processes}/${destinationProcess.name}@${destinationId}`
                })}
              />
            </GridItem>

            {(!!activeConnections.length || !!oldConnectionsCount) && (
              <GridItem>
                <Tabs activeKey={connectionsView} onSelect={handleTabClick} isBox>
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
              </GridItem>
            )}

            {!!http2Requests.length && (
              <GridItem>
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
              </GridItem>
            )}

            {!!httpRequests.length && (
              <GridItem>
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
              </GridItem>
            )}
          </Grid>
        }
      />
    </>
  );
};

export default ProcessPairs;
