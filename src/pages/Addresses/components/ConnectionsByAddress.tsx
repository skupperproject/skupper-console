import { FC, useCallback, useMemo, useRef, useState } from 'react';

import { Modal, ModalVariant } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL, isPrometheusActive } from '@config/config';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import ViewDetailCell from '@core/components/ViewDetailsCell';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { ProcessesComponentsTable } from '@pages/Processes/Processes.constant';
import FlowsPair from '@pages/shared/FlowPairs/FlowPair';
import { flowPairsComponentsTable, tcpFlowPairsColumns } from '@pages/shared/FlowPairs/FlowPairs.constant';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { FlowPairsResponse, RequestOptions } from 'API/REST.interfaces';

import { serverColumns, tcpColumns } from '../Addresses.constants';
import { RequestLabels, AddressesLabels } from '../Addresses.enum';
import { ConnectionsByAddressProps } from '../Addresses.interfaces';
import { QueriesServices } from '../services/services.enum';

const TAB_0_KEY = '0';
const TAB_1_KEY = '1';
const TAB_2_KEY = '2';
const TAB_3_KEY = '3';

const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'service-display-interval';

const initServersQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  endTime: 0 // active servers
};

const initActiveConnectionsQueryParams: RequestOptions = {
  state: TcpStatus.Active,
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

const initPaginatedOldConnectionsQueryParams: RequestOptions = {
  state: TcpStatus.Terminated,
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

const ConnectionsByAddress: FC<ConnectionsByAddressProps> = function ({
  addressId,
  addressName,
  protocol,
  viewSelected
}) {
  const activeConnectionsDataRef = useRef<FlowPairsResponse[]>();
  const forceMetricUpdateNonceRef = useRef<number>(0);

  const [flowSelected, setFlowSelected] = useState<string>();

  const [connectionsQueryParamsPaginated, setConnectionsQueryParamsPaginated] = useState<RequestOptions>(
    initPaginatedOldConnectionsQueryParams
  );
  const [activeConnectionsQueryParamsPaginated, setActiveConnectionsQueryParamsPaginated] = useState<RequestOptions>(
    initActiveConnectionsQueryParams
  );

  const { data: activeConnectionsData, isLoading: isLoadingActiveConnections } = useQuery(
    [
      QueriesServices.GetFlowPairsByAddress,
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
      QueriesServices.GetFlowPairsByAddress,
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
    [QueriesServices.GetProcessesByAddress, addressId, initServersQueryParams],
    () => (addressId ? RESTApi.fetchServersByAddress(addressId, initServersQueryParams) : null),
    {
      keepPreviousData: true
    }
  );

  const { data: connectionSelected } = useQuery(
    [QueriesServices.GetFlowPair],
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
      enabled: isPrometheusActive && viewSelected === TAB_1_KEY
    }
  );

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
  //const serversRowsCount = serversByAddressData?.timeRangeCount;

  const serverNames = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNamesIds = servers.map(({ name }) => name).join('|');
  const startTime = servers.reduce((acc, process) => Math.min(acc, process.startTime), 0);

  if (isPrometheusActive && byteRates) {
    const byteRatesMap = byteRates.reduce(
      (acc, byteRate) => {
        acc[`${byteRate.metric.destProcess}`] = Number(byteRate.value[1]);

        return acc;
      },
      {} as Record<string, number>
    );
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

      {viewSelected === TAB_0_KEY && isPrometheusActive && (
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
            sourceProcesses: {
              disabled: serverNames.length < 2,
              placeholder: AddressesLabels.MetricDestinationProcessFilter
            },
            destinationProcesses: { placeholder: RequestLabels.Clients, hide: true }
          }}
          onGetMetricFilters={handleSetMetricFilters}
        />
      )}

      {viewSelected === TAB_1_KEY && (
        <SkTable
          columns={serverColumns}
          rows={servers}
          pagination={true}
          paginationPageSize={BIG_PAGINATION_SIZE}
          customCells={ProcessesComponentsTable}
        />
      )}

      {viewSelected === TAB_2_KEY && (
        <SkTable
          columns={tcpColumns}
          rows={activeConnections}
          paginationTotalRows={activeConnectionsRowsCount}
          pagination={true}
          paginationPageSize={BIG_PAGINATION_SIZE}
          onGetFilters={handleGetFiltersActiveConnections}
          customCells={{
            ...flowPairsComponentsTable,
            viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
              <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
            )
          }}
        />
      )}

      {viewSelected === TAB_3_KEY && (
        <SkTable
          columns={tcpFlowPairsColumns}
          rows={oldConnections}
          paginationTotalRows={oldConnectionsRowsCount}
          pagination={true}
          paginationPageSize={BIG_PAGINATION_SIZE}
          onGetFilters={handleGetFiltersConnections}
          customCells={{
            ...flowPairsComponentsTable,
            viewDetailsLinkCell: ({ data }: LinkCellProps<FlowPairsResponse>) => (
              <ViewDetailCell onClick={handleOnClickDetails} value={data.identity} />
            )
          }}
        />
      )}
    </>
  );
};

export default ConnectionsByAddress;
