import { FC, MouseEvent as ReactMouseEvent, useCallback, useMemo, useRef, useState } from 'react';

import { Card, Grid, GridItem, Modal, ModalVariant, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, SortDirection } from '@API/REST.enum';
import { DEFAULT_TABLE_PAGE_SIZE, UPDATE_INTERVAL } from '@config/config';
import { isPrometheusActive } from '@config/Prometheus.config';
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
import { FlowPairsLabelsHttp, FlowPairsLabels, AddressesLabels } from '../Addresses.enum';
import { RequestsByAddressProps } from '../Addresses.interfaces';
import { QueriesAddresses } from '../services/services.enum';

const TAB_1_KEY = 'servers';
const TAB_2_KEY = 'connections';
const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'address-display-interval';

const initAllRequestsQueryParamsPaginated: RequestOptions = {
  limit: DEFAULT_TABLE_PAGE_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

const initServersQueryParams = {
  limit: DEFAULT_TABLE_PAGE_SIZE,
  endTime: 0 // active servers
};

const RequestsByAddress: FC<RequestsByAddressProps> = function ({ addressId, addressName, protocol }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || TAB_1_KEY;

  const requestsDataPaginatedPrevRef = useRef<FlowPairsResponse[]>();
  const forceMetricUpdateNonceRef = useRef<number>(0);

  const [addressView, setAddressView] = useState<string>(type);
  const [requestsQueryParamsPaginated, setRequestsQueryParamsPaginated] = useState<RequestOptions>(
    initAllRequestsQueryParamsPaginated
  );
  const [flowSelected, setFlowSelected] = useState<string>();

  const { data: requestsDataPaginated, isLoading: isLoadingRequestsPaginated } = useQuery(
    [
      QueriesAddresses.GetFlowPairsByAddress,
      addressId,
      {
        ...initAllRequestsQueryParamsPaginated,
        ...requestsQueryParamsPaginated
      }
    ],
    () =>
      addressId
        ? RESTApi.fetchFlowPairsByAddress(addressId, {
            ...initAllRequestsQueryParamsPaginated,
            ...requestsQueryParamsPaginated
          })
        : null,
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
  const startTime = servers.reduce((acc, process) => Math.max(acc, process.startTime), 0);

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
      <Grid hasGutter>
        <GridItem>
          <SkTitle
            title={addressName}
            icon="address"
            link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Processes}&${TopologyURLFilters.AddressId}=${addressId}`}
          />
        </GridItem>

        {/* requests table*/}
        <GridItem>
          <Card isRounded className="pf-u-pt-md">
            <Tabs activeKey={addressView} onSelect={handleTabClick} isBox>
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
                title={<TabTitleText>{`${FlowPairsLabelsHttp.Requests} (${requestsPaginatedCount})`}</TabTitleText>}
              >
                <SkTable
                  columns={httpColumns}
                  rows={requestsPaginated}
                  pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
                  onGetFilters={handleGetFiltersConnections}
                  rowsCount={requestsPaginatedCount}
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
                processIdSource: serverNamesId,
                protocol: AvailableProtocols.AllHttp
              }}
              startTime={startTime}
              sourceProcesses={serverNames}
              filterOptions={{
                protocols: { disabled: true, placeholder: protocol },
                sourceProcesses: { placeholder: AddressesLabels.MetricDestinationProcessFilter },
                destinationProcesses: { placeholder: FlowPairsLabelsHttp.Clients, disabled: true }
              }}
              onGetMetricFilters={handleRefreshMetrics}
            />
          </GridItem>
        )}
      </Grid>
    </>
  );
};

export default RequestsByAddress;
