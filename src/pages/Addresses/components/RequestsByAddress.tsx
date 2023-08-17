import { FC, useCallback, useMemo, useRef, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { SortDirection } from '@API/REST.enum';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import SkTable from '@core/components/SkTable';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { ProcessesComponentsTable, processesTableColumns } from '@pages/Processes/Processes.constants';
import { httpSelectOptions } from '@pages/shared/FlowPair/FlowPair.constants';
import FlowPairsTable from '@pages/shared/FlowPair/FlowPairsTable';
import Metrics from '@pages/shared/Metrics';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { FlowPairsResponse, RequestOptions } from 'API/REST.interfaces';

import SearchFilter from '../../../core/components/skSearchFilter';
import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, httpColumns } from '../Addresses.constants';
import { RequestLabels, AddressesLabels } from '../Addresses.enum';
import { RequestsByAddressProps } from '../Addresses.interfaces';
import { QueriesServices } from '../services/services.enum';

const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'service-display-interval';

const initRequestsQueryParams: RequestOptions = {
  limit: BIG_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

const initServersQueryParams = {
  limit: BIG_PAGINATION_SIZE,
  endTime: 0
};

const RequestsByAddress: FC<RequestsByAddressProps> = function ({ addressId, protocol, viewSelected }) {
  const requestsDataPaginatedPrevRef = useRef<FlowPairsResponse[]>();
  const forceMetricUpdateNonceRef = useRef<number>(0);

  const [requestsQueryParams, setRequestsQueryParams] = useState<RequestOptions>(initRequestsQueryParams);

  const { data: requestsDataPaginated } = useQuery(
    [QueriesServices.GetFlowPairsByAddress, addressId, requestsQueryParams],
    () => (addressId ? RESTApi.fetchFlowPairsByAddress(addressId, requestsQueryParams) : null),
    {
      refetchInterval: viewSelected === TAB_2_KEY ? UPDATE_INTERVAL : 0,
      keepPreviousData: true
    }
  );

  const { data: serversByAddressData } = useQuery(
    [QueriesServices.GetProcessesByAddress, addressId, initServersQueryParams],
    () => (addressId ? RESTApi.fetchServersByAddress(addressId, initServersQueryParams) : null),
    {
      refetchInterval: viewSelected === TAB_1_KEY ? UPDATE_INTERVAL : 0,
      keepPreviousData: true
    }
  );

  const handleRefreshMetrics = useCallback(
    (interval: string) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${addressId}`, interval);
    },
    [addressId]
  );

  const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
    setRequestsQueryParams((previousQueryParams) => ({ ...previousQueryParams, ...params }));
  }, []);

  const checkDataChanged = useMemo((): number => {
    requestsDataPaginatedPrevRef.current = requestsDataPaginated?.results;

    return (forceMetricUpdateNonceRef.current += 1);
  }, [requestsDataPaginated?.results]);

  const servers = serversByAddressData?.results || [];
  // const serversRowsCount = serversByAddressData?.timeRangeCount;

  const requestsPaginated = requestsDataPaginated?.results || [];
  const requestsPaginatedCount = requestsDataPaginated?.timeRangeCount;

  const serverNames = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNamesId = servers.map(({ name }) => name).join('|');
  const startTime = servers.reduce((acc, process) => Math.min(acc, process.startTime), 0);

  return (
    <>
      {viewSelected === TAB_0_KEY && (
        <Metrics
          key={addressId}
          forceUpdate={checkDataChanged}
          selectedFilters={{
            ...getDataFromSession<SelectedFilters>(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${addressId}`),
            processIdSource: serverNamesId,
            protocol
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
          onGetMetricFilters={handleRefreshMetrics}
        />
      )}

      {viewSelected === TAB_1_KEY && (
        <SkTable columns={processesTableColumns} rows={servers} customCells={ProcessesComponentsTable} />
      )}

      {viewSelected === TAB_2_KEY && (
        <>
          <SearchFilter onSearch={handleGetFiltersConnections} selectOptions={httpSelectOptions} />

          <FlowPairsTable
            columns={httpColumns}
            rows={requestsPaginated}
            paginationTotalRows={requestsPaginatedCount}
            pagination={true}
            paginationPageSize={BIG_PAGINATION_SIZE}
            onGetFilters={handleGetFiltersConnections}
          />
        </>
      )}
    </>
  );
};

export default RequestsByAddress;
