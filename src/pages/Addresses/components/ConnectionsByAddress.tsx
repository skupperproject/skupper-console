import { FC, useCallback, useMemo, useRef, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL, isPrometheusActive } from '@config/config';
import SkTable from '@core/components/SkTable';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { ProcessesComponentsTable } from '@pages/Processes/Processes.constants';
import { tcpFlowPairsColumns, tcpSelectOptions } from '@pages/shared/FlowPair/FlowPair.constants';
import FlowPairsTable from '@pages/shared/FlowPair/FlowPairsTable';
import Metrics from '@pages/shared/Metrics';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { FlowPairsResponse, RequestOptions } from 'API/REST.interfaces';

import SearchFilter from '../../../core/components/skSearchFilter';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, TAB_3_KEY, serverColumns, tcpColumns } from '../Addresses.constants';
import { RequestLabels, AddressesLabels } from '../Addresses.enum';
import { ConnectionsByAddressProps } from '../Addresses.interfaces';
import { QueriesServices } from '../services/services.enum';

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

const initOldConnectionsQueryParams: RequestOptions = {
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

  const [connectionsQueryParams, setConnectionsQueryParams] = useState<RequestOptions>(initOldConnectionsQueryParams);
  const [activeConnectionsQueryParams, setActiveConnectionsQueryParamsPaginated] = useState<RequestOptions>(
    initActiveConnectionsQueryParams
  );

  const { data: exposedServersData } = useQuery(
    [QueriesServices.GetProcessesByAddress, addressId, initServersQueryParams],
    () => (addressId ? RESTApi.fetchServersByAddress(addressId, initServersQueryParams) : null),
    {
      refetchInterval: viewSelected === TAB_1_KEY ? UPDATE_INTERVAL : 0,
      keepPreviousData: true
    }
  );

  const { data: byteRates } = useQuery(
    ['QueriesAddresses.GetFlowPair', { addressName }],
    () => PrometheusApi.fetchTcpByteRateByAddress({ addressName }),
    {
      enabled: isPrometheusActive && viewSelected === TAB_1_KEY,
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: activeConnectionsData } = useQuery(
    [QueriesServices.GetFlowPairsByAddress, addressId, activeConnectionsQueryParams],
    () => (addressId ? RESTApi.fetchFlowPairsByAddress(addressId, activeConnectionsQueryParams) : null),
    {
      enabled: viewSelected === TAB_2_KEY,
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: oldConnectionsData } = useQuery(
    [QueriesServices.GetFlowPairsByAddress, addressId, connectionsQueryParams],
    () => (addressId ? RESTApi.fetchFlowPairsByAddress(addressId, connectionsQueryParams) : null),
    {
      enabled: viewSelected === TAB_3_KEY,
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const handleSetMetricFilters = useCallback(
    (interval: string) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${addressId}`, interval);
    },
    [addressId]
  );

  // Active connections may change live, requiring corresponding metric updates
  const activeConnectionsUpdated = useMemo((): number => {
    activeConnectionsDataRef.current = activeConnectionsData?.results;

    return (forceMetricUpdateNonceRef.current += 1);
  }, [activeConnectionsData?.results]);

  const handleGetFiltersActiveConnections = useCallback(
    (params: RequestOptions) => {
      setActiveConnectionsQueryParamsPaginated({ ...activeConnectionsQueryParams, ...params });
    },
    [activeConnectionsQueryParams]
  );

  const handleGetFiltersConnections = useCallback(
    (params: RequestOptions) => {
      setConnectionsQueryParams({ ...connectionsQueryParams, ...params });
    },
    [connectionsQueryParams]
  );

  const activeConnections = activeConnectionsData?.results || [];
  const activeConnectionsRowsCount = activeConnectionsData?.timeRangeCount;

  const oldConnections = oldConnectionsData?.results || [];
  const oldConnectionsRowsCount = oldConnectionsData?.timeRangeCount;

  let servers = exposedServersData?.results || [];
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
      {viewSelected === TAB_0_KEY && (
        <Metrics
          key={addressId}
          forceUpdate={activeConnectionsUpdated}
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
        <>
          <SearchFilter onSearch={handleGetFiltersActiveConnections} selectOptions={tcpSelectOptions} />

          <FlowPairsTable
            columns={tcpColumns}
            rows={activeConnections}
            paginationTotalRows={activeConnectionsRowsCount}
            pagination={true}
            paginationPageSize={BIG_PAGINATION_SIZE}
            onGetFilters={handleGetFiltersActiveConnections}
          />
        </>
      )}

      {viewSelected === TAB_3_KEY && (
        <>
          <SearchFilter onSearch={handleGetFiltersConnections} selectOptions={tcpSelectOptions} />

          <FlowPairsTable
            columns={tcpFlowPairsColumns}
            rows={oldConnections}
            paginationTotalRows={oldConnectionsRowsCount}
            pagination={true}
            paginationPageSize={BIG_PAGINATION_SIZE}
            onGetFilters={handleGetFiltersConnections}
          />
        </>
      )}
    </>
  );
};

export default ConnectionsByAddress;
