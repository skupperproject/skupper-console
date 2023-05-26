import { FC, MouseEvent as ReactMouseEvent, useCallback, useMemo, useRef, useState } from 'react';

import { Card, Grid, GridItem, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { isPrometheusActive } from '@API/Prometheus.queries';
import { RESTApi } from '@API/REST';
import { AvailableProtocols } from '@API/REST.enum';
import { DEFAULT_TABLE_PAGE_SIZE, UPDATE_INTERVAL } from '@config/config';
import SkTitle from '@core/components/SkTitle';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { FlowPairsResponse, RequestOptions } from 'API/REST.interfaces';

import FlowPairsTable from './FlowPairsTable';
import ServersTable from './ServersTable';
import { RequestsByAddressColumns } from '../Addresses.constants';
import { FlowPairsLabelsHttp, FlowPairsLabels, AddressesLabels } from '../Addresses.enum';
import { RequestsByAddressProps } from '../Addresses.interfaces';
import { QueriesAddresses } from '../services/services.enum';

const TAB_1_KEY = 'servers';
const TAB_2_KEY = 'connections';

const initAllRequestsQueryParamsPaginated = {
  limit: DEFAULT_TABLE_PAGE_SIZE,
  sortBy: 'endTime.desc'
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

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setAddressView(tabIndex as string);
    setSearchParams({ type: tabIndex as string });
  }

  const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
    setRequestsQueryParamsPaginated(params);
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
          <Tabs activeKey={addressView} onSelect={handleTabClick}>
            {serversRowsCount && (
              <Tab eventKey={TAB_1_KEY} title={<TabTitleText>{FlowPairsLabels.Servers}</TabTitleText>}>
                <ServersTable processes={servers} />
              </Tab>
            )}
            {requestsPaginated && (
              <Tab eventKey={TAB_2_KEY} title={<TabTitleText>{FlowPairsLabelsHttp.Requests}</TabTitleText>}>
                <FlowPairsTable
                  columns={RequestsByAddressColumns}
                  connections={requestsPaginated}
                  onGetFilters={handleGetFiltersConnections}
                  rowsCount={requestsPaginatedCount}
                />
              </Tab>
            )}
          </Tabs>
        </Card>
      </GridItem>

      {/* Process Metrics*/}
      {isPrometheusActive() && (
        <GridItem>
          <Metrics
            forceUpdate={checkDataChanged}
            selectedFilters={{ processIdSource: serverNamesId, protocol: AvailableProtocols.AllHttp }}
            startTime={startTime}
            sourceProcesses={serverNames}
            filterOptions={{
              protocols: { disabled: true, placeholder: protocol },
              sourceProcesses: { placeholder: AddressesLabels.MetricDestinationProcessFilter },
              destinationProcesses: { placeholder: FlowPairsLabelsHttp.Clients, disabled: true }
            }}
          />
        </GridItem>
      )}
    </Grid>
  );
};

export default RequestsByAddress;
