import { useCallback, useState } from 'react';

import { Flex, Grid, GridItem, Icon, Modal, ModalVariant, Title } from '@patternfly/react-core';
import { LongArrowAltLeftIcon, LongArrowAltRightIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import { AvailableProtocols } from '@API/REST.enum';
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
import { httpColumns, tcpColumns } from '../Processes.constant';
import { ProcessesLabels, ProcessesRoutesPaths, ProcessPairsColumnsNames } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const initAllFlowParisQueryParamsPaginated = {
  offset: 0,
  limit: DEFAULT_TABLE_PAGE_SIZE,
  sortBy: 'endTime.desc'
};

const ProcessPairs = function () {
  const { processPairId } = useParams();

  const ids = processPairId?.split('-to-') || [];
  const sourceId = ids[0];
  const destinationId = ids[1];

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

  const handleGetFiltersFlowPairs = useCallback((params: RequestOptions) => {
    setFlowParisQueryParamsPaginated(params);
  }, []);

  const handleOnClickDetails = useCallback((id?: string) => {
    setFlowSelected(id);
  }, []);

  if (isLoadingFlowPairsPairsData || isLoadingDestinationProcess || isLoadingSourceProcess) {
    return <LoadingPage />;
  }

  if (!flowPairsPairsData || !sourceProcess || !destinationProcess) {
    return null;
  }

  const TcpFlowPairs = flowPairsPairsData.results.filter(({ protocol }) => protocol === AvailableProtocols.Tcp);
  const HttpFlowPairs = flowPairsPairsData.results.filter(
    ({ protocol }) => protocol === AvailableProtocols.Http || protocol === AvailableProtocols.Http2
  );
  const flowPairsPaginatedCount = flowPairsPairsData.timeRangeCount;
  const flow = flowPairsPairsData.results.find((flowPairs) => flowPairs.identity === flowSelected);

  return (
    <TransitionPage>
      <>
        <Modal
          aria-label="No header/footer modal"
          isOpen={!!flowSelected}
          onClose={() => handleOnClickDetails()}
          variant={ModalVariant.medium}
        >
          <FlowsPair flowPair={flow} />
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

          {!!TcpFlowPairs.length && (
            <GridItem>
              <SkTable
                title={ProcessesLabels.TcpConnection}
                columns={tcpColumns}
                rows={TcpFlowPairs}
                pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                components={{
                  ...flowPairsComponentsTable,
                  viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
                    <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
                  )
                }}
              />
            </GridItem>
          )}

          {!!HttpFlowPairs.length && (
            <GridItem>
              <SkTable
                title={ProcessesLabels.HttpRequests}
                columns={httpColumns}
                rows={HttpFlowPairs}
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
