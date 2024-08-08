import { FC, startTransition, useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import { Card, CardBody, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { ResourcesEmptyIcon } from '@patternfly/react-icons';
import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { RemoteFilterOptions } from '@API/REST.interfaces';
import { DEFAULT_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import SKEmptyData from '@core/components/SkEmptyData';
import FlowPairs from '@pages/shared/FlowPairs';
import { TopologyURLQueyParams } from '@pages/Topology/Topology.enum';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import { activeTcpColumns, httpColumns, oldTcpColumns } from '../Processes.constants';
import { ProcessesLabels, QueriesProcesses } from '../Processes.enum';
import { ProcessPairsFlowsProps, RemoteFilterOptionsProtocolMap } from '../Processes.interfaces';

const TAB_1_KEY = 'liveConnections';
const TAB_2_KEY = 'connections';
const TAB_3_KEY = 'http2Requests';
const TAB_4_KEY = 'httpRequests';

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

const useProcessPairsContent = ({ protocol }: { protocol: AvailableProtocols | 'undefined' }) => {
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
      AvailableProtocols.Http === protocol || protocol === 'undefined'
    )
  );

  const { results: http2Requests, count: http2RequestsCount } = extractData(
    useFlowPairsQuery(
      queryParamsPaginated[AvailableProtocols.Http2],
      processPairId,
      AvailableProtocols.Http2 === protocol || protocol === 'undefined'
    )
  );

  const { results: activeConnections, count: activeConnectionsCount } = extractData(
    useFlowPairsQuery(
      queryParamsPaginated[AvailableProtocols.Tcp].active,
      processPairId,
      AvailableProtocols.Tcp === protocol || protocol === 'undefined'
    )
  );

  const { results: oldConnections, count: oldConnectionsCount } = extractData(
    useFlowPairsQuery(
      queryParamsPaginated[AvailableProtocols.Tcp].old,
      processPairId,
      AvailableProtocols.Tcp === protocol || protocol === 'undefined'
    )
  );

  const activeTab = tabSelected
    ? tabSelected
    : activeConnectionsCount
      ? TAB_1_KEY
      : oldConnectionsCount
        ? TAB_2_KEY
        : http2RequestsCount
          ? TAB_3_KEY
          : httpRequestsCount
            ? TAB_4_KEY
            : '';

  return (
    <>
      {!activeConnectionsCount && !oldConnectionsCount && !http2RequestsCount && !httpRequestsCount && (
        <Card isFullHeight>
          <CardBody>
            <SKEmptyData
              message={ProcessesLabels.ProcessPairsEmptyTitle}
              description={ProcessesLabels.ProcessPairsEmptyMessage}
              icon={ResourcesEmptyIcon}
            />
          </CardBody>
        </Card>
      )}

      {(!!activeConnectionsCount || !!oldConnectionsCount || !!http2RequestsCount || !!httpRequestsCount) && (
        <Tabs activeKey={activeTab} onSelect={handleTabClick} component="nav" isBox>
          {!!activeConnectionsCount && (
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
          )}

          {!!oldConnectionsCount && (
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
          )}
          {!!http2RequestsCount && (
            <Tab
              disabled={http2RequestsCount === 0}
              eventKey={TAB_3_KEY}
              title={<TabTitleText>{`${ProcessesLabels.Http2Requests} (${http2RequestsCount})`}</TabTitleText>}
            >
              <FlowPairs
                data-testid={'http2-table'}
                columns={httpColumns}
                rows={http2Requests}
                paginationTotalRows={http2RequestsCount}
                pagination={true}
                paginationPageSize={DEFAULT_PAGINATION_SIZE}
                onGetFilters={handleGetFilters}
              />
            </Tab>
          )}

          {!!httpRequestsCount && (
            <Tab
              disabled={httpRequestsCount === 0}
              eventKey={TAB_4_KEY}
              title={<TabTitleText>{`${ProcessesLabels.HttpRequests} (${httpRequestsCount})`}</TabTitleText>}
            >
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
            </Tab>
          )}
        </Tabs>
      )}
    </>
  );
};

export default ProcessPairsFlows;

const useFlowPairsQuery = (queryParams: RemoteFilterOptions, processPairId: string, enabled = true) => {
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
