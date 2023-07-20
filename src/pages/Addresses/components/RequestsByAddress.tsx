import { FC, MouseEvent as ReactMouseEvent, useCallback, useMemo, useRef, useState } from 'react';

import { Modal, ModalVariant, PageSection, PageSectionVariants, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { SortDirection } from '@API/REST.enum';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL, isPrometheusActive } from '@config/config';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import SkTitle from '@core/components/SkTitle';
import ViewDetailCell from '@core/components/ViewDetailsCell';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { ProcessesComponentsTable, processesTableColumns } from '@pages/Processes/Processes.constant';
import FlowsPair from '@pages/shared/FlowPairs/FlowPair';
import { flowPairsComponentsTable } from '@pages/shared/FlowPairs/FlowPairs.constant';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { FlowPairsResponse, RequestOptions } from 'API/REST.interfaces';

import { httpColumns } from '../Addresses.constants';
import { RequestLabels, FlowPairsLabels, AddressesLabels } from '../Addresses.enum';
import { RequestsByAddressProps } from '../Addresses.interfaces';
import { QueriesServices } from '../services/services.enum';

const TAB_0_KEY = 'overview';
const TAB_1_KEY = 'servers';
const TAB_2_KEY = 'requests';
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

const RequestsByAddress: FC<RequestsByAddressProps> = function ({ addressId, addressName, protocol }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || TAB_0_KEY;

  const requestsDataPaginatedPrevRef = useRef<FlowPairsResponse[]>();
  const forceMetricUpdateNonceRef = useRef<number>(0);

  const [requestView, setAddressView] = useState<string>(type);
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

  const { data: flowPairSelected } = useQuery(
    [QueriesServices.GetFlowPair],
    () => (flowSelected ? RESTApi.fetchFlowPair(flowSelected) : undefined),
    {
      refetchInterval: UPDATE_INTERVAL,
      enabled: !!flowSelected
    }
  );

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setAddressView(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

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
  const serversRowsCount = serversByAddressData?.timeRangeCount;

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

      <PageSection padding={{ default: 'noPadding' }} variant={PageSectionVariants.light}>
        <SkTitle
          isPlain
          title={addressName}
          link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.AddressId}=${addressId}`}
        />

        <Tabs activeKey={requestView} onSelect={handleTabClick}>
          <Tab eventKey={TAB_0_KEY} title={<TabTitleText>{`${FlowPairsLabels.Overview}`}</TabTitleText>} />
          <Tab
            eventKey={TAB_1_KEY}
            title={<TabTitleText>{`${FlowPairsLabels.Servers} (${serversRowsCount})`}</TabTitleText>}
          />
          <Tab
            eventKey={TAB_2_KEY}
            title={<TabTitleText>{`${RequestLabels.Requests} (${requestsPaginatedCount})`}</TabTitleText>}
          />
        </Tabs>
      </PageSection>

      <PageSection>
        {requestView === TAB_0_KEY && isPrometheusActive && (
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

        {requestView === TAB_1_KEY && (
          <SkTable columns={processesTableColumns} rows={servers} customCells={ProcessesComponentsTable} />
        )}

        {requestView === TAB_2_KEY && (
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
      </PageSection>
    </>
  );
};

export default RequestsByAddress;
