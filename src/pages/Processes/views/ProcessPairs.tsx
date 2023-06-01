import { useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import {
  Flex,
  Grid,
  GridItem,
  Icon,
  Modal,
  ModalVariant,
  Tab,
  Tabs,
  TabTitleText,
  Title
} from '@patternfly/react-core';
import { LongArrowAltLeftIcon, LongArrowAltRightIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { DEFAULT_TABLE_PAGE_SIZE, UPDATE_INTERVAL } from '@config/config';
import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import TransitionPage from '@core/components/TransitionPages/Slide';
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

const initAllFlowParisQueryParamsPaginated: RequestOptions = {
  offset: 0,
  limit: DEFAULT_TABLE_PAGE_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

const initActiveConnectionsPaginated: RequestOptions = {
  ...initAllFlowParisQueryParamsPaginated,
  protocol: AvailableProtocols.Tcp,
  state: TcpStatus.Active
};

const initOldConnectionsPaginated: RequestOptions = {
  ...initActiveConnectionsPaginated,
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
  const [flowPairsQueryParamsPaginated, setFlowParisQueryParamsPaginated] = useState<RequestOptions>(
    initAllFlowParisQueryParamsPaginated
  );

  const [flowSelected, setFlowSelected] = useState<string>();

  const { data: sourceProcess, isLoading: isLoadingSourceProcess } = useQuery([QueriesProcesses.GetProcess], () =>
    sourceId ? RESTApi.fetchProcess(sourceId) : undefined
  );

  const { data: destinationProcess, isLoading: isLoadingDestinationProcess } = useQuery(
    [QueriesProcesses.GetDestinationProcess],
    () => (destinationId ? RESTApi.fetchProcess(destinationId) : undefined)
  );

  const { data: flowPairsPairsData, isLoading: isLoadingFlowPairsPairsData } = useQuery(
    [QueriesProcesses.GetFlowPairs, { ...initAllFlowParisQueryParamsPaginated, ...flowPairsQueryParamsPaginated }],
    () =>
      RESTApi.fetchFlowPairs({
        ...initAllFlowParisQueryParamsPaginated,
        ...flowPairsQueryParamsPaginated,
        filter: `processAggregateId.${processPairId}`
      }),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: activeConnectionsData, isLoading: isLoadingActiveConnectionsData } = useQuery(
    [QueriesProcesses.GetFlowPairs, { ...initActiveConnectionsPaginated, ...flowPairsQueryParamsPaginated }],
    () =>
      RESTApi.fetchFlowPairs({
        ...initActiveConnectionsPaginated,
        ...flowPairsQueryParamsPaginated,
        filter: `processAggregateId.${processPairId}`
      }),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: oldConnectionsData, isLoading: isLoadingOldConnectionsData } = useQuery(
    [QueriesProcesses.GetFlowPairs, { ...initOldConnectionsPaginated, ...flowPairsQueryParamsPaginated }],
    () =>
      RESTApi.fetchFlowPairs({
        ...initOldConnectionsPaginated,
        ...flowPairsQueryParamsPaginated,
        filter: `processAggregateId.${processPairId}`
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

  const handleGetFiltersFlowPairs = useCallback((params: RequestOptions) => {
    setFlowParisQueryParamsPaginated(params);
  }, []);

  const handleOnClickDetails = useCallback((id?: string) => {
    setFlowSelected(id);
  }, []);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setConnectionsView(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

  if (
    isLoadingFlowPairsPairsData ||
    isLoadingDestinationProcess ||
    isLoadingSourceProcess ||
    isLoadingOldConnectionsData ||
    isLoadingActiveConnectionsData
  ) {
    return <LoadingPage />;
  }

  if (!flowPairsPairsData || !sourceProcess || !destinationProcess || !oldConnectionsData || !activeConnectionsData) {
    return null;
  }

  const { results: activeConnections } = activeConnectionsData;
  const { timeRangeCount: oldConnectionsCount, results: oldConnections } = oldConnectionsData;

  const httpRequests = flowPairsPairsData.results.filter(
    ({ protocol }) => protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2
  );
  const flowPairsPaginatedCount = flowPairsPairsData.timeRangeCount;

  return (
    <TransitionPage>
      <>
        <Modal
          aria-label="No header/footer modal"
          isOpen={!!flowSelected}
          onClose={() => handleOnClickDetails()}
          variant={ModalVariant.medium}
        >
          <FlowsPair flowPair={flowPairSelected} />
        </Modal>

        <Grid hasGutter>
          <GridItem>
            <Flex>
              <Title headingLevel="h1">{ProcessPairsColumnsNames.Title}</Title>
              <Link
                to={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.IdSelected}=${processPairId}`}
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
                link: `${ProcessesRoutesPaths.Processes}/${sourceProcess.name}@${sourceId}`,
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
                link: `${ProcessesRoutesPaths.Processes}/${destinationProcess.name}@${destinationId}`,
                type: 'process'
              })}
            />
          </GridItem>

          {!!activeConnections.length && (
            <GridItem>
              <Tabs activeKey={connectionsView} onSelect={handleTabClick} isBox>
                <Tab
                  eventKey={TAB_1_KEY}
                  title={
                    <TabTitleText>{`${ProcessesLabels.ActiveConnections} (${activeConnections.length})`}</TabTitleText>
                  }
                >
                  <SkTable
                    title={ProcessesLabels.TcpConnection}
                    columns={activeTcpColumns}
                    rows={activeConnections}
                    pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                    components={{
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
                    title={ProcessesLabels.TcpConnection}
                    columns={oldTcpColumns}
                    rows={oldConnections}
                    rowsCount={oldConnectionsCount}
                    pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                    components={{
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

          {!!httpRequests.length && (
            <GridItem>
              <SkTable
                title={ProcessesLabels.HttpRequests}
                columns={httpColumns}
                rows={httpRequests}
                onGetFilters={handleGetFiltersFlowPairs}
                rowsCount={flowPairsPaginatedCount}
                components={{
                  ...flowPairsComponentsTable,
                  viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
                    <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
                  )
                }}
              />
            </GridItem>
          )}
        </Grid>
      </>
    </TransitionPage>
  );
};

export default ProcessPairs;
