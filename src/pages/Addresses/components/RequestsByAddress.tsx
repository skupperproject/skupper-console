import { FC, useCallback, useMemo, useRef, useState } from 'react';

import { Modal, ModalVariant } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { SortDirection } from '@API/REST.enum';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL, isPrometheusActive } from '@config/config';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import ViewDetailCell from '@core/components/ViewDetailsCell';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { ProcessesComponentsTable, processesTableColumns } from '@pages/Processes/Processes.constant';
import FlowsPair from '@pages/shared/FlowPairs/FlowPair';
import { flowPairsComponentsTable } from '@pages/shared/FlowPairs/FlowPairs.constant';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { FlowPairsResponse, RequestOptions } from 'API/REST.interfaces';

import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, httpColumns } from '../Addresses.constants';
import { RequestLabels, AddressesLabels } from '../Addresses.enum';
import { RequestsByAddressProps } from '../Addresses.interfaces';
import { QueriesServices } from '../services/services.enum';

const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'service-display-interval';

const initPaginatedRequestsQueryParams: RequestOptions = {
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

  const [paginatedRequestsQueryParams, setRequestsQueryParamsPaginated] = useState<RequestOptions>(
    initPaginatedRequestsQueryParams
  );
  const [flowSelected, setFlowSelected] = useState<string>();

  const { data: requestsDataPaginated, isLoading: isLoadingRequestsPaginated } = useQuery(
    [
      QueriesServices.GetFlowPairsByAddress,
      addressId,
      {
        ...initPaginatedRequestsQueryParams,
        ...paginatedRequestsQueryParams
      }
    ],
    () =>
      addressId
        ? RESTApi.fetchFlowPairsByAddress(addressId, {
            ...initPaginatedRequestsQueryParams,
            ...paginatedRequestsQueryParams
          })
        : null,
    {
      refetchInterval: viewSelected === TAB_2_KEY ? UPDATE_INTERVAL : 0,
      keepPreviousData: true
    }
  );

  const { data: serversByAddressData, isLoading: isLoadingServersByAddress } = useQuery(
    [QueriesServices.GetProcessesByAddress, addressId, initServersQueryParams],
    () => (addressId ? RESTApi.fetchServersByAddress(addressId, initServersQueryParams) : null),
    {
      refetchInterval: viewSelected === TAB_1_KEY ? UPDATE_INTERVAL : 0,
      keepPreviousData: true
    }
  );

  const { data: flowPairSelected } = useQuery(
    [QueriesServices.GetFlowPair],
    () => (flowSelected ? RESTApi.fetchFlowPair(flowSelected) : undefined),
    {
      refetchInterval: UPDATE_INTERVAL,
      enabled: !!flowSelected
    }
  );

  const handleRefreshMetrics = useCallback(
    (interval: string) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${addressId}`, interval);
    },
    [addressId]
  );

  const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
    setRequestsQueryParamsPaginated(params);
  }, []);

  const handleOnClickDetails = useCallback((id?: string) => {
    setFlowSelected(id);
  }, []);

  const checkDataChanged = useMemo((): number => {
    requestsDataPaginatedPrevRef.current = requestsDataPaginated?.results;

    return (forceMetricUpdateNonceRef.current += 1);
  }, [requestsDataPaginated?.results]);

  if (isLoadingServersByAddress || isLoadingRequestsPaginated) {
    return <LoadingPage />;
  }

  const servers = serversByAddressData?.results || [];
  // const serversRowsCount = serversByAddressData?.timeRangeCount;

  const requestsPaginated = requestsDataPaginated?.results || [];
  const requestsPaginatedCount = requestsDataPaginated?.timeRangeCount;

  const serverNames = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNamesId = servers.map(({ name }) => name).join('|');
  const startTime = servers.reduce((acc, process) => Math.min(acc, process.startTime), 0);

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

      {viewSelected === TAB_0_KEY && isPrometheusActive && (
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
        <SkTable
          columns={httpColumns}
          rows={requestsPaginated}
          paginationTotalRows={requestsPaginatedCount}
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

export default RequestsByAddress;
