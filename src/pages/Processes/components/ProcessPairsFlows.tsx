import { FC, startTransition, useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import { Card, CardBody, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { ResourcesEmptyIcon } from '@patternfly/react-icons';
import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { DEFAULT_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import EmptyData from '@core/components/EmptyData';
import FlowPairs from '@pages/shared/FlowPairs';
import { TopologyURLQueyParams } from '@pages/Topology/Topology.enum';
import { RemoteFilterOptions } from 'API/REST.interfaces';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import { activeTcpColumns, httpColumns, oldTcpColumns } from '../Processes.constants';
import { ProcessesLabels, QueriesProcesses } from '../Processes.enum';
import { ProcessPairsFlowsProps, RemoteFilterOptionsProtocolMap } from '../Processes.interfaces';

const TAB_1_KEY = 'liveConnections';
const TAB_2_KEY = 'connections';

const initPaginatedFlowPairsQueryParams: RemoteFilterOptions = {
  offset: 0,
  limit: DEFAULT_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

const initPaginatedHttpRequestsQueryParams: RemoteFilterOptions = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: AvailableProtocols.Http
};

const initPaginatedHttp2RequestsQueryParams: RemoteFilterOptions = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: AvailableProtocols.Http2
};

const initPaginatedActiveConnectionsQueryParams: RemoteFilterOptions = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: AvailableProtocols.Tcp,
  state: TcpStatus.Active
};

const initPaginatedOldConnectionsQueryParams: RemoteFilterOptions = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: AvailableProtocols.Tcp,
  state: TcpStatus.Terminated
};

const initPaginatedQueryParams: RemoteFilterOptionsProtocolMap = {
  [AvailableProtocols.Http]: initPaginatedHttpRequestsQueryParams,
  [AvailableProtocols.Http2]: initPaginatedHttp2RequestsQueryParams,
  [AvailableProtocols.Tcp]: {
    active: initPaginatedActiveConnectionsQueryParams,
    old: initPaginatedOldConnectionsQueryParams
  }
};

const useProcessPairsContent = ({ protocol }: { protocol: AvailableProtocols }) => {
  const [queryParamsPaginated, setQueryParamsPaginated] =
    useState<RemoteFilterOptionsProtocolMap>(initPaginatedQueryParams);

  const handleGetFilters = useCallback(
    (params: RemoteFilterOptions, tcpType?: 'active' | 'old') => {
      const protocolKey = protocol as keyof RemoteFilterOptionsProtocolMap;

      //we are using the startTransition hook to ensure that the UI remains responsive during the update
      startTransition(() => {
        setQueryParamsPaginated((prevQueryParams) => ({
          ...prevQueryParams,
          [protocolKey]: tcpType
            ? { ...(prevQueryParams[protocolKey][tcpType] as RemoteFilterOptions), ...params }
            : { ...prevQueryParams[protocolKey], ...params }
        }));
      });
    },

    [protocol]
  );

  return { queryParamsPaginated, handleGetFilters };
};

const ProcessPairsFlows: FC<ProcessPairsFlowsProps> = function ({ processPairId, protocol }) {
  const [tabSelected, setTabSelected] = useState<string>();
  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected || '', true);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as string);
  }

  const { queryParamsPaginated, handleGetFilters } = useProcessPairsContent({ protocol });

  const { results: httpRequests, count: httpRequestsCount } = extractData(
    useFlowPairsQuery(
      queryParamsPaginated[AvailableProtocols.Http],
      processPairId,
      AvailableProtocols.Http === protocol
    )
  );

  const { results: http2Requests, count: http2RequestsCount } = extractData(
    useFlowPairsQuery(
      queryParamsPaginated[AvailableProtocols.Http2],
      processPairId,
      AvailableProtocols.Http2 === protocol
    )
  );

  const { results: activeConnections, count: activeConnectionsCount } = extractData(
    useFlowPairsQuery(
      queryParamsPaginated[AvailableProtocols.Tcp].active,
      processPairId,
      AvailableProtocols.Tcp === protocol
    )
  );

  const { results: oldConnections, count: oldConnectionsCount } = extractData(
    useFlowPairsQuery(
      queryParamsPaginated[AvailableProtocols.Tcp].old,
      processPairId,
      AvailableProtocols.Tcp === protocol
    )
  );

  const activeTab = tabSelected
    ? tabSelected
    : activeConnectionsCount
      ? TAB_1_KEY
      : oldConnectionsCount
        ? TAB_2_KEY
        : '';

  return (
    <>
      {!activeConnectionsCount && !oldConnectionsCount && !http2RequestsCount && !httpRequestsCount && (
        <Card isFullHeight>
          <CardBody>
            <EmptyData
              message={ProcessesLabels.ProcessPairsEmptyTitle}
              description={ProcessesLabels.ProcessPairsEmptyMessage}
              icon={ResourcesEmptyIcon}
            />
          </CardBody>
        </Card>
      )}

      {((protocol === AvailableProtocols.Tcp && !!activeConnectionsCount) || !!oldConnectionsCount) && (
        <Tabs activeKey={activeTab} onSelect={handleTabClick} component="nav" isBox>
          <Tab
            eventKey={TAB_1_KEY}
            title={<TabTitleText>{`${ProcessesLabels.ActiveConnections} (${activeConnectionsCount})`}</TabTitleText>}
          >
            <FlowPairs
              data-testid={'tcp-active-connections-table'}
              columns={activeTcpColumns}
              rows={activeConnections}
              paginationTotalRows={activeConnectionsCount}
              pagination={true}
              paginationPageSize={DEFAULT_PAGINATION_SIZE}
              onGetFilters={(filters: RemoteFilterOptions) => handleGetFilters(filters, 'active')}
            />
          </Tab>
          <Tab
            disabled={oldConnectionsCount === 0}
            eventKey={TAB_2_KEY}
            title={<TabTitleText>{`${ProcessesLabels.OldConnections} (${oldConnectionsCount})`}</TabTitleText>}
          >
            <FlowPairs
              data-testid={'tcp-old-connections-table'}
              columns={oldTcpColumns}
              rows={oldConnections}
              paginationTotalRows={oldConnectionsCount}
              pagination={true}
              paginationPageSize={DEFAULT_PAGINATION_SIZE}
              onGetFilters={(filters: RemoteFilterOptions) => handleGetFilters(filters, 'old')}
            />
          </Tab>
        </Tabs>
      )}
      {protocol === AvailableProtocols.Http2 && !!http2RequestsCount && (
        <FlowPairs
          data-testid={'http2-table'}
          title={ProcessesLabels.Http2Requests}
          columns={httpColumns}
          rows={http2Requests}
          paginationTotalRows={http2RequestsCount}
          pagination={true}
          paginationPageSize={DEFAULT_PAGINATION_SIZE}
          onGetFilters={handleGetFilters}
        />
      )}
      {protocol === AvailableProtocols.Http && !!httpRequestsCount && (
        <FlowPairs
          data-testid={'http-table'}
          title={ProcessesLabels.HttpRequests}
          columns={httpColumns}
          rows={httpRequests}
          paginationTotalRows={httpRequestsCount}
          pagination={true}
          paginationPageSize={DEFAULT_PAGINATION_SIZE}
          onGetFilters={handleGetFilters}
        />
      )}
    </>
  );
};

export default ProcessPairsFlows;

const useFlowPairsQuery = (queryParams: RemoteFilterOptions, processPairId: string, enabled: boolean) => {
  const { data } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetFlowPairs, queryParams, processPairId],
    queryFn: () =>
      enabled
        ? RESTApi.fetchFlowPairs({
            ...queryParams,
            processAggregateId: processPairId
          })
        : null,
    refetchInterval: UPDATE_INTERVAL
  });

  return data;
};

interface Data<T> {
  results?: T[];
  timeRangeCount?: number;
}

function extractData<T>(data?: Data<T> | null) {
  if (!data) {
    return {
      results: [],
      count: 0
    };
  }

  return {
    results: data?.results || [],
    count: data?.timeRangeCount || 0
  };
}
