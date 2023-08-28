import { FC, useCallback, useMemo, useRef, useState } from 'react';

import { Card, CardBody, CardHeader, Stack, StackItem, Title } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { SortDirection } from '@API/REST.enum';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import SkSankeyChart from '@core/components/SKSanckeyChart';
import SankeyFilter, {
  sankeyMetricOptions,
  ServiceClientResourceOptions,
  ServiceServerResourceOptions
} from '@core/components/SKSanckeyChart/SankeyFilter';
import SearchFilter from '@core/components/skSearchFilter';
import SkTable from '@core/components/SkTable';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { CustomProcessCells, processesTableColumns } from '@pages/Processes/Processes.constants';
import { httpSelectOptions } from '@pages/shared/FlowPair/FlowPair.constants';
import FlowPairsTable from '@pages/shared/FlowPair/FlowPairsTable';
import Metrics from '@pages/shared/Metrics';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { FlowPairsResponse, RequestOptions } from 'API/REST.interfaces';

import { TAB_0_KEY, TAB_1_KEY, TAB_2_KEY, httpColumns } from '../Addresses.constants';
import { RequestLabels, AddressesLabels, FlowPairsLabels } from '../Addresses.enum';
import { RequestsByAddressProps } from '../Addresses.interfaces';
import { AddressesController } from '../services';
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

const defaultMetricOption = sankeyMetricOptions[0].id;

const RequestsByAddress: FC<RequestsByAddressProps> = function ({ addressId, addressName, protocol, viewSelected }) {
  const requestsDataPaginatedPrevRef = useRef<FlowPairsResponse[]>();
  const forceMetricUpdateNonceRef = useRef<number>(0);
  const [clientResourceSelected, setClientResourceSelected] = useState<'client' | 'clientSite'>(
    ServiceClientResourceOptions[0].id
  );
  const [serverResourceSelected, setServerResourceSelected] = useState<'server' | 'serverSite'>(
    ServiceServerResourceOptions[0].id
  );

  const [servicePairMetricSelected, setServicePairMetricSelected] = useState(defaultMetricOption);

  const [requestsQueryParams, setRequestsQueryParams] = useState<RequestOptions>(initRequestsQueryParams);

  const { data: requestsDataPaginated } = useQuery(
    [QueriesServices.GetFlowPairsByAddress, addressId, requestsQueryParams],
    () => (addressId ? RESTApi.fetchFlowPairsByAddress(addressId, requestsQueryParams) : null),
    {
      refetchInterval: viewSelected === TAB_2_KEY ? UPDATE_INTERVAL : 0,
      keepPreviousData: true
    }
  );

  const { data: servicePairs } = useQuery(
    [QueriesServices.GetResourcePairsByAddress, addressName, clientResourceSelected, serverResourceSelected],
    () =>
      addressId
        ? PrometheusApi.fethServicePairsByAddress({
            addressName,
            clientType: clientResourceSelected,
            serverType: serverResourceSelected
          })
        : null,
    {
      enabled: viewSelected === TAB_2_KEY,
      refetchInterval: UPDATE_INTERVAL,
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

  const handleGetPairType = useCallback(
    ({
      clientType,
      serverType,
      visibleMetrics
    }: {
      clientType: 'client' | 'clientSite';
      serverType: 'server' | 'serverSite';
      visibleMetrics: string;
    }) => {
      setClientResourceSelected(clientType);
      setServerResourceSelected(serverType);
      setServicePairMetricSelected(visibleMetrics);
    },
    []
  );

  const handleGetFiltersConnections = useCallback((params: RequestOptions) => {
    setRequestsQueryParams((previousQueryParams) => ({ ...previousQueryParams, ...params }));
  }, []);

  const checkDataChanged = useMemo((): number => {
    requestsDataPaginatedPrevRef.current = requestsDataPaginated?.results;

    return (forceMetricUpdateNonceRef.current += 1);
  }, [requestsDataPaginated?.results]);

  const servers = serversByAddressData?.results || [];

  const requestsPaginated = requestsDataPaginated?.results || [];
  const requestsPaginatedCount = requestsDataPaginated?.timeRangeCount;

  const serverNames = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNamesId = servers.map(({ name }) => name).join('|');
  const startTime = servers.reduce((acc, process) => Math.min(acc, process.startTime), 0);

  const enableMetric = servicePairMetricSelected !== defaultMetricOption;
  const { nodes, links } = AddressesController.convertToSankeyChartData(servicePairs || [], enableMetric);

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
        <SkTable columns={processesTableColumns} rows={servers} customCells={CustomProcessCells} />
      )}

      {viewSelected === TAB_2_KEY && (
        <Stack hasGutter>
          {!!nodes.length && (
            <StackItem>
              <Card>
                <CardHeader>
                  <Title headingLevel="h1">{FlowPairsLabels.SankeyChartTitle}</Title>
                </CardHeader>
                <CardBody>
                  <SankeyFilter onSearch={handleGetPairType} />
                  <SkSankeyChart data={{ nodes, links }} />
                </CardBody>
              </Card>
            </StackItem>
          )}

          <StackItem>
            <SearchFilter onSearch={handleGetFiltersConnections} selectOptions={httpSelectOptions} />

            <FlowPairsTable
              columns={httpColumns}
              rows={requestsPaginated}
              paginationTotalRows={requestsPaginatedCount}
              pagination={true}
              paginationPageSize={BIG_PAGINATION_SIZE}
              onGetFilters={handleGetFiltersConnections}
            />
          </StackItem>
        </Stack>
      )}
    </>
  );
};

export default RequestsByAddress;
