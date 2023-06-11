import { FC, MouseEvent as ReactMouseEvent, useCallback, useMemo, useRef, useState } from 'react';

import { Card, Grid, GridItem, Modal, ModalVariant, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { DEFAULT_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { isPrometheusActive } from '@config/Prometheus.config';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import ViewDetailCell from '@core/components/ViewDetailsCell';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { ProcessesComponentsTable } from '@pages/Processes/Processes.constant';
import FlowsPair from '@pages/shared/FlowPairs/FlowPair';
import { flowPairsComponentsTable, tcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPairs.constant';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { FlowPairsResponse, RequestOptions } from 'API/REST.interfaces';

import { serverColumns, tcpColumns } from '../Addresses.constants';
import { ConnectionLabels, FlowPairsLabels, RequestLabels, AddressesLabels } from '../Addresses.enum';
import { ConnectionsByAddressProps } from '../Addresses.interfaces';
import { QueriesAddresses } from '../services/services.enum';

const TAB_1_KEY = 'servers';
const TAB_2_KEY = 'liveConnections';
const TAB_3_KEY = 'connections';
const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'address-display-interval';

const initServersQueryParams = {
  limit: DEFAULT_PAGINATION_SIZE,
  endTime: 0 // active servers
};

const initActiveConnectionsQueryParams: RequestOptions = {
  state: TcpStatus.Active,
  limit: DEFAULT_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

const initPaginatedOldConnectionsQueryParams: RequestOptions = {
  state: TcpStatus.Terminated,
  limit: DEFAULT_PAGINATION_SIZE,
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

  const [connectionsQueryParamsPaginated, setConnectionsQueryParamsPaginated] = useState<RequestOptions>(
    initPaginatedOldConnectionsQueryParams
  );
  const [activeConnectionsQueryParamsPaginated, setActiveConnectionsQueryParamsPaginated] = useState<RequestOptions>(
    initActiveConnectionsQueryParams
  );

  const { data: activeConnectionsData, isLoading: isLoadingActiveConnections } = useQuery(
    [
      QueriesAddresses.GetFlowPairsByAddress,
      addressId,
      { ...initActiveConnectionsQueryParams, ...activeConnectionsQueryParamsPaginated }
    ],
    () =>
      addressId
        ? RESTApi.fetchFlowPairsByAddress(addressId, {
            ...initActiveConnectionsQueryParams,
            ...activeConnectionsQueryParamsPaginated
          })
        : undefined,
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: oldConnectionsData, isLoading: isLoadingOldConnections } = useQuery(
    [
      QueriesAddresses.GetFlowPairsByAddress,
      addressId,
      { ...initPaginatedOldConnectionsQueryParams, ...connectionsQueryParamsPaginated }
    ],
    () =>
      addressId
        ? RESTApi.fetchFlowPairsByAddress(addressId, {
            ...initPaginatedOldConnectionsQueryParams,
            ...connectionsQueryParamsPaginated
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

  const { data: connectionSelected } = useQuery(
    [QueriesAddresses.GetFlowPair],
    () => (flowSelected ? RESTApi.fetchFlowPair(flowSelected) : undefined),
    {
      refetchInterval: UPDATE_INTERVAL,
      enabled: !!flowSelected
    }
  );

  const { data: byteRates } = useQuery(
    ['QueriesAddresses.GetFlowPair', { addressName }],
    () => PrometheusApi.fetchTcpByteRateByAddress({ addressName }),
    {
      refetchInterval: UPDATE_INTERVAL,
      enabled: isPrometheusActive() && connectionsView === TAB_1_KEY
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

  const handleGetFiltersActiveConnections = useCallback((params: RequestOptions) => {
    setActiveConnectionsQueryParamsPaginated(params);
  }, []);

  const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
    setConnectionsQueryParamsPaginated(params);
  }, []);

  if (isLoadingServersByAddress || isLoadingActiveConnections || isLoadingOldConnections) {
    return <LoadingPage />;
  }

  const activeConnections = activeConnectionsData?.results || [];
  const activeConnectionsRowsCount = activeConnectionsData?.timeRangeCount;

  const oldConnections = oldConnectionsData?.results || [];
  const oldConnectionsRowsCount = oldConnectionsData?.timeRangeCount;

  let servers = serversByAddressData?.results || [];
  const serversRowsCount = serversByAddressData?.timeRangeCount;

  const serverNames = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNamesIds = servers.map(({ name }) => name).join('|');
  const startTime = servers.reduce((acc, process) => Math.max(acc, process.startTime), 0);

  if (isPrometheusActive() && byteRates) {
    const byteRatesMap = byteRates.reduce((acc, byteRate) => {
      acc[`${byteRate.metric.destProcess}`] = Number(byteRate.value[1]);

      return acc;
    }, {} as Record<string, number>);
    servers = servers.map((conn) => ({
      ...conn,
      byteRate: byteRatesMap[`${conn.name}`] || 0
    }));
  }

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
            connectionSelected && {
              ...connectionSelected,
              counterFlow: { ...connectionSelected.counterFlow, sourcePort: addressName?.split(':')[1] as string }
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
                  columns={serverColumns}
                  rows={servers}
                  pagination={true}
                  paginationPageSize={DEFAULT_PAGINATION_SIZE}
                  customCells={ProcessesComponentsTable}
                />
              </Tab>
              <Tab
                eventKey={TAB_2_KEY}
                title={
                  <TabTitleText>{`${ConnectionLabels.ActiveConnections} (${activeConnectionsRowsCount})`}</TabTitleText>
                }
              >
                <SkTable
                  columns={tcpColumns}
                  rows={activeConnections}
                  paginationTotalRows={activeConnectionsRowsCount}
                  pagination={true}
                  paginationPageSize={DEFAULT_PAGINATION_SIZE}
                  onGetFilters={handleGetFiltersActiveConnections}
                  customCells={{
                    ...flowPairsComponentsTable,
                    viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
                      <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
                    )
                  }}
                />
              </Tab>
              <Tab
                eventKey={TAB_3_KEY}
                title={<TabTitleText>{`${ConnectionLabels.OldConnections} (${oldConnectionsRowsCount})`}</TabTitleText>}
              >
                <SkTable
                  columns={tcpFlowPairsColumns}
                  rows={oldConnections}
                  paginationTotalRows={oldConnectionsRowsCount}
                  pagination={true}
                  paginationPageSize={DEFAULT_PAGINATION_SIZE}
                  onGetFilters={handleGetFiltersConnections}
                  customCells={{
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
                destinationProcesses: { placeholder: RequestLabels.Clients, disabled: true }
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
