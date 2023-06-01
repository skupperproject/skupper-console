import { FC, MouseEvent as ReactMouseEvent, useCallback, useMemo, useRef, useState } from 'react';

import { Card, Grid, GridItem, Modal, ModalVariant, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { isPrometheusActive } from '@API/Prometheus.queries';
import { RESTApi } from '@API/REST';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { DEFAULT_TABLE_PAGE_SIZE, UPDATE_INTERVAL } from '@config/config';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import ViewDetailCell from '@core/components/ViewDetailsCell';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { ProcessesComponentsTable, processesTableColumns } from '@pages/Processes/Processes.constant';
import FlowsPair from '@pages/shared/FlowPairs/FlowPair';
import { flowPairsComponentsTable, tcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPairs.constant';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { FlowPairsResponse, RequestOptions } from 'API/REST.interfaces';

import { tcpColumns } from '../Addresses.constants';
import { FlowPairsLabelsTcp, FlowPairsLabels, FlowPairsLabelsHttp, AddressesLabels } from '../Addresses.enum';
import { ConnectionsByAddressProps } from '../Addresses.interfaces';
import { QueriesAddresses } from '../services/services.enum';

const TAB_1_KEY = 'servers';
const TAB_2_KEY = 'liveConnections';
const TAB_3_KEY = 'connections';
const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'address-display-interval';

const initServersQueryParams = {
  endTime: 0 // active servers
};

const initActiveConnectionsQueryParams: RequestOptions = {
  state: TcpStatus.Active
};

const initOldConnectionsQueryParams: RequestOptions = {
  state: TcpStatus.Terminated,
  limit: DEFAULT_TABLE_PAGE_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};
const ConnectionsByAddress: FC<ConnectionsByAddressProps> = function ({ addressId, addressName, protocol }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || TAB_1_KEY;

  const activeConnectionsDataRef = useRef<FlowPairsResponse[]>();
  const forceMetricUpdateNonceRef = useRef<number>(0);

  const [connectionsView, setConnectionsView] = useState<string>(type);
  const [flowSelected, setFlowSelected] = useState<string>();

  const [requestsQueryParamsPaginated, setRequestsQueryParamsPaginated] =
    useState<RequestOptions>(initOldConnectionsQueryParams);

  const { data: activeConnectionsData, isLoading: isLoadingActiveConnections } = useQuery(
    [QueriesAddresses.GetFlowPairsByAddress, addressId, initActiveConnectionsQueryParams],
    () => (addressId ? RESTApi.fetchFlowPairsByAddress(addressId, initActiveConnectionsQueryParams) : undefined),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: oldConnectionsData, isLoading: isLoadingOldConnections } = useQuery(
    [
      QueriesAddresses.GetFlowPairsByAddress,
      addressId,
      { ...initOldConnectionsQueryParams, ...requestsQueryParamsPaginated }
    ],
    () =>
      addressId
        ? RESTApi.fetchFlowPairsByAddress(addressId, {
            ...initOldConnectionsQueryParams,
            ...requestsQueryParamsPaginated
          })
        : undefined,
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: serversByAddressData, isLoading: isLoadingServersByAddress } = useQuery(
    [QueriesAddresses.GetProcessesByAddress, addressId, initServersQueryParams],
    () => (addressId ? RESTApi.fetchServersByAddress(addressId, initServersQueryParams) : null),
    {
      keepPreviousData: true
    }
  );

  const { data: flowPairSelected } = useQuery(
    [QueriesAddresses.GetFlowPair],
    () => (flowSelected ? RESTApi.fetchFlowPair(flowSelected) : undefined),
    {
      refetchInterval: UPDATE_INTERVAL,
      enabled: !!flowSelected
    }
  );

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setConnectionsView(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

  const handleSetMetricFilters = useCallback(
    (interval: string) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${addressId}`, interval);
    },
    [addressId]
  );

  const handleOnClickDetails = useCallback((id?: string) => {
    setFlowSelected(id);
  }, []);

  const checkDataChanged = useMemo((): number => {
    activeConnectionsDataRef.current = activeConnectionsData?.results;

    return (forceMetricUpdateNonceRef.current += 1);
  }, [activeConnectionsData?.results]);

  const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
    setRequestsQueryParamsPaginated(params);
  }, []);

  if (isLoadingServersByAddress || isLoadingActiveConnections || isLoadingOldConnections) {
    return <LoadingPage />;
  }

  const activeConnections = activeConnectionsData?.results || [];
  const activeConnectionsRowsCount = activeConnectionsData?.timeRangeCount;

  const oldConnections = oldConnectionsData?.results || [];
  const oldConnectionsRowsCount = oldConnectionsData?.timeRangeCount;

  const servers = serversByAddressData?.results || [];
  const serversRowsCount = serversByAddressData?.timeRangeCount;

  const serverNames = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNamesIds = servers.map(({ name }) => name).join('|');
  const startTime = servers.reduce((acc, process) => Math.max(acc, process.startTime), 0);

  return (
    <>
      <Modal
        aria-label="No header/footer modal"
        isOpen={!!flowSelected}
        onClose={() => handleOnClickDetails()}
        variant={ModalVariant.medium}
      >
        <FlowsPair
          flowPair={
            flowPairSelected && {
              ...flowPairSelected,
              counterFlow: { ...flowPairSelected.counterFlow, sourcePort: addressName?.split(':')[1] as string }
            }
          }
        />
      </Modal>
      <Grid hasGutter>
        <GridItem>
          <SkTitle
            title={addressName}
            icon="address"
            link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.AddressId}=${addressId}`}
          />
        </GridItem>

        {/* connection table*/}
        <GridItem>
          <Card isRounded className="pf-u-pt-md">
            <Tabs activeKey={connectionsView} onSelect={handleTabClick} isBox>
              <Tab
                eventKey={TAB_1_KEY}
                title={<TabTitleText>{`${FlowPairsLabels.Servers} (${serversRowsCount})`}</TabTitleText>}
              >
                <SkTable
                  columns={processesTableColumns}
                  rows={servers}
                  pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                  components={ProcessesComponentsTable}
                />
              </Tab>
              <Tab
                eventKey={TAB_2_KEY}
                title={
                  <TabTitleText>{`${FlowPairsLabelsTcp.ActiveConnections} (${activeConnectionsRowsCount})`}</TabTitleText>
                }
              >
                <SkTable
                  columns={tcpColumns}
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
                eventKey={TAB_3_KEY}
                title={
                  <TabTitleText>{`${FlowPairsLabelsTcp.OldConnections} (${oldConnectionsRowsCount})`}</TabTitleText>
                }
              >
                <SkTable
                  columns={tcpFlowPairsColumns}
                  rows={oldConnections}
                  pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                  rowsCount={oldConnectionsRowsCount}
                  onGetFilters={handleGetFiltersConnections}
                  components={{
                    ...flowPairsComponentsTable,
                    viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
                      <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
                    )
                  }}
                />
              </Tab>
            </Tabs>
          </Card>
        </GridItem>

        {/* Process Metrics*/}
        {isPrometheusActive() && (
          <GridItem>
            <Metrics
              key={addressId}
              forceUpdate={checkDataChanged}
              selectedFilters={{
                ...getDataFromSession<SelectedFilters>(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${addressId}`),
                processIdSource: serverNamesIds,
                protocol: AvailableProtocols.Tcp
              }}
              startTime={startTime}
              sourceProcesses={serverNames}
              filterOptions={{
                protocols: { disabled: true, placeholder: protocol },
                sourceProcesses: { placeholder: AddressesLabels.MetricDestinationProcessFilter },
                destinationProcesses: { placeholder: FlowPairsLabelsHttp.Clients, disabled: true }
              }}
              onGetMetricFilters={handleSetMetricFilters}
            />
          </GridItem>
        )}
      </Grid>
    </>
  );
};

export default ConnectionsByAddress;
