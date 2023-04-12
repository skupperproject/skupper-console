import { FC, MouseEvent as ReactMouseEvent, useCallback, useState } from 'react';

import { Card, Grid, GridItem, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { isPrometheusActive } from '@API/Prometheus.queries';
import { RESTApi } from '@API/REST';
import { DEFAULT_TABLE_PAGE_SIZE } from '@config/config';
import SkTitle from '@core/components/SkTitle';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';
import { RequestOptions } from 'API/REST.interfaces';

import FlowPairsTable from './FlowPairsTable';
import ServersTable from './ServersTable';
import { RequestsByAddressColumns } from '../Addresses.constants';
import { FlowPairsLabelsHttp, FlowPairsLabels, AddressesLabels } from '../Addresses.enum';
import { RequestsByAddressProps } from '../Addresses.interfaces';
import { QueriesAddresses } from '../services/services.enum';

const initAllRequestsQueryParamsPaginated = {
  limit: DEFAULT_TABLE_PAGE_SIZE
};

const initServersQueryParams = {
  limit: DEFAULT_TABLE_PAGE_SIZE,
  filter: 'endTime.0' // open connections
};

const RequestsByAddress: FC<RequestsByAddressProps> = function ({ addressId, addressName, protocol }) {
  const [addressView, setAddressView] = useState<number>(0);
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
    setAddressView(tabIndex as number);
  }

  const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
    setRequestsQueryParamsPaginated(params);
  }, []);

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
              <Tab eventKey={0} title={<TabTitleText>{FlowPairsLabels.Servers}</TabTitleText>}>
                <ServersTable processes={servers} />
              </Tab>
            )}
            {requestsPaginated && (
              <Tab eventKey={1} title={<TabTitleText>{FlowPairsLabelsHttp.Requests}</TabTitleText>}>
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
            parent={{ id: serverNamesId, name: serverNamesId, startTime }}
            sourceProcesses={serverNames}
            customFilters={{
              protocols: { disabled: true, name: protocol },
              sourceProcesses: { name: AddressesLabels.MetricDestinationProcessFilter },
              destinationProcesses: { name: FlowPairsLabelsHttp.Clients, disabled: true }
            }}
          />
        </GridItem>
      )}
    </Grid>
  );
};

export default RequestsByAddress;
