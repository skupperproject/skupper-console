import { FC, startTransition, useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

import { Card, CardBody, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { ResourcesEmptyIcon } from '@patternfly/react-icons';
import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { Protocols, SortDirection, TcpStatus } from '@API/REST.enum';
import { DEFAULT_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import SKEmptyData from '@core/components/SkEmptyData';
import SkFlowPairsTable from '@core/components/SkFlowPairsList';
import { httpFlowPairsColumns, tcpFlowPairsColumns } from '@core/components/SkFlowPairsList/FlowPairs.constants';
import { setColumnVisibility } from '@core/components/SkTable/SkTable.utils';
import { TopologyURLQueyParams } from '@pages/Topology/Topology.enum';
import { QueryFiltersProtocolMap } from '@sk-types/Processes.interfaces';
import { QueryFilters } from '@sk-types/REST.interfaces';
import useUpdateQueryStringValueWithoutNavigation from 'hooks/useUpdateQueryStringValueWithoutNavigation';

import { ProcessesLabels, QueriesProcesses } from '../Processes.enum';

const TAB_1_KEY = 'liveConnections';
const TAB_2_KEY = 'connections';
const TAB_3_KEY = 'http2Requests';
const TAB_4_KEY = 'httpRequests';

const initPaginatedFlowPairsQueryParams: QueryFilters = {
  offset: 0,
  limit: DEFAULT_PAGINATION_SIZE,
  sortName: 'endTime',
  sortDirection: SortDirection.DESC
};

const initPaginatedHttpRequestsQueryParams: QueryFilters = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: Protocols.Http
};

const initPaginatedHttp2RequestsQueryParams: QueryFilters = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: Protocols.Http2
};

const initPaginatedActiveConnectionsQueryParams: QueryFilters = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: Protocols.Tcp,
  state: TcpStatus.Active
};

const initPaginatedOldConnectionsQueryParams: QueryFilters = {
  ...initPaginatedFlowPairsQueryParams,
  protocol: Protocols.Tcp,
  state: TcpStatus.Terminated
};

const initPaginatedQueryParams: QueryFiltersProtocolMap = {
  [Protocols.Http]: initPaginatedHttpRequestsQueryParams,
  [Protocols.Http2]: initPaginatedHttp2RequestsQueryParams,
  [Protocols.Tcp]: {
    active: initPaginatedActiveConnectionsQueryParams,
    old: initPaginatedOldConnectionsQueryParams
  }
};

const useFlowPairsQuery = (
  queryParams: QueryFilters,
  sourceProcessId: string,
  destProcessId: string,
  enabled = true
) => {
  const { data } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetFlowPairs, queryParams, sourceProcessId, destProcessId],
    queryFn: () =>
      enabled
        ? RESTApi.fetchFlowPairs({
            ...queryParams,
            sourceProcessId,
            destProcessId
          })
        : null,
    refetchInterval: UPDATE_INTERVAL
  });

  return data;
};

const useProcessPairsContent = ({ protocol }: { protocol: Protocols | 'undefined' }) => {
  const [queryParamsPaginated, setQueryParamsPaginated] = useState<QueryFiltersProtocolMap>(initPaginatedQueryParams);

  const handleGetFilters = useCallback(
    (params: QueryFilters, tcpType?: 'active' | 'old') => {
      const protocolKey = protocol as keyof QueryFiltersProtocolMap;

      //we are using the startTransition hook to ensure that the UI remains responsive during the update
      startTransition(() => {
        setQueryParamsPaginated((prevQueryParams) => ({
          ...prevQueryParams,
          [protocolKey]: tcpType
            ? { ...(prevQueryParams[protocolKey][tcpType] as QueryFilters), ...params }
            : { ...prevQueryParams[protocolKey], ...params }
        }));
      });
    },

    [protocol]
  );

  return { queryParamsPaginated, handleGetFilters };
};

interface FlowPairsListProps {
  sourceProcessId: string;
  destProcessId: string;
  protocol: Protocols | 'undefined';
}

const FlowPairsList: FC<FlowPairsListProps> = function ({ sourceProcessId, destProcessId, protocol }) {
  const [tabSelected, setTabSelected] = useState<string>();
  useUpdateQueryStringValueWithoutNavigation(TopologyURLQueyParams.Type, tabSelected || '', true);

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as string);
  }

  const { queryParamsPaginated, handleGetFilters } = useProcessPairsContent({ protocol });

  const { results: httpRequests, count: httpRequestsCount } = extractData(
    useFlowPairsQuery(
      queryParamsPaginated[Protocols.Http],
      sourceProcessId,
      destProcessId,
      Protocols.Http === protocol || protocol === 'undefined'
    )
  );

  const { results: http2Requests, count: http2RequestsCount } = extractData(
    useFlowPairsQuery(
      queryParamsPaginated[Protocols.Http2],
      sourceProcessId,
      destProcessId,
      Protocols.Http2 === protocol || protocol === 'undefined'
    )
  );

  const { results: activeConnections, count: activeConnectionsCount } = extractData(
    useFlowPairsQuery(queryParamsPaginated[Protocols.Tcp].active, sourceProcessId, destProcessId, true)
  );

  const { results: oldConnections, count: oldConnectionsCount } = extractData(
    useFlowPairsQuery(queryParamsPaginated[Protocols.Tcp].old, sourceProcessId, destProcessId, true)
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

  if (!activeConnectionsCount && !oldConnectionsCount) {
    return (
      <Card isFullHeight>
        <CardBody>
          <SKEmptyData
            message={ProcessesLabels.ProcessPairsEmptyTitle}
            description={ProcessesLabels.ProcessPairsEmptyMessage}
            icon={ResourcesEmptyIcon}
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Tabs activeKey={activeTab} onSelect={handleTabClick} component="nav" isBox>
      {!!activeConnectionsCount && (
        <Tab eventKey={TAB_1_KEY} title={<TabTitleText>{ProcessesLabels.OpenConnections}</TabTitleText>}>
          <SkFlowPairsTable
            data-testid={'tcp-active-connections-table'}
            columns={setColumnVisibility(tcpFlowPairsColumns, { duration: false, endTime: false })}
            rows={activeConnections}
            paginationTotalRows={activeConnectionsCount}
            pagination={true}
            paginationPageSize={DEFAULT_PAGINATION_SIZE}
            onGetFilters={(filters: QueryFilters) => handleGetFilters(filters, 'active')}
          />
        </Tab>
      )}

      {!!oldConnectionsCount && (
        <Tab
          disabled={oldConnectionsCount === 0}
          eventKey={TAB_2_KEY}
          title={<TabTitleText>{ProcessesLabels.OldConnections}</TabTitleText>}
        >
          <SkFlowPairsTable
            data-testid={'tcp-old-connections-table'}
            columns={setColumnVisibility(tcpFlowPairsColumns, { duration: false, endTime: false })}
            rows={oldConnections}
            paginationTotalRows={oldConnectionsCount}
            pagination={true}
            paginationPageSize={DEFAULT_PAGINATION_SIZE}
            onGetFilters={(filters: QueryFilters) => handleGetFilters(filters, 'old')}
          />
        </Tab>
      )}

      {!!http2RequestsCount && (
        <Tab
          disabled={http2RequestsCount === 0}
          eventKey={TAB_3_KEY}
          title={<TabTitleText>{ProcessesLabels.Http2Requests}</TabTitleText>}
        >
          <SkFlowPairsTable
            data-testid={'http2-table'}
            columns={setColumnVisibility(httpFlowPairsColumns, {
              sourceProcessName: false,
              destProcessName: false,
              sourceSiteName: false,
              destSiteName: false
            })}
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
          title={<TabTitleText>{ProcessesLabels.HttpRequests}</TabTitleText>}
        >
          <SkFlowPairsTable
            data-testid={'http-table'}
            title={ProcessesLabels.HttpRequests}
            columns={setColumnVisibility(httpFlowPairsColumns, {
              sourceProcessName: false,
              destProcessName: false,
              sourceSiteName: false,
              destSiteName: false
            })}
            rows={httpRequests}
            paginationTotalRows={httpRequestsCount}
            pagination={true}
            paginationPageSize={DEFAULT_PAGINATION_SIZE}
            onGetFilters={handleGetFilters}
          />
        </Tab>
      )}
    </Tabs>
  );
};

export default FlowPairsList;

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
