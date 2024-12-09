import { useSuspenseQueries } from '@tanstack/react-query';

import { TcpStatus } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';
import { QueriesProcesses } from '../Processes.enum';

const initServersQueryParams = {
  limit: 0
};

const activeConnectionsQueryParams = {
  limit: 0,
  state: TcpStatus.Active
};

const terminatedConnectionsQueryParams = {
  limit: 0,
  state: TcpStatus.Terminated
};

export const useBiflowListData = (sourceProcessId: string, destProcessId: string) => {
  const [{ data: requestsData }, { data: activeConnectionsData }, { data: terminatedConnectionsData }] =
    useSuspenseQueries({
      queries: [
        {
          queryKey: [QueriesProcesses.GetHttpRequests, initServersQueryParams, sourceProcessId, destProcessId],
          queryFn: () =>
            RESTApi.fetchApplicationFlows({
              ...initServersQueryParams,
              sourceProcessId,
              destProcessId
            }),
          refetchInterval: UPDATE_INTERVAL
        },
        {
          queryKey: [QueriesProcesses.GetTcpConnections, activeConnectionsQueryParams, sourceProcessId, destProcessId],
          queryFn: () =>
            RESTApi.fetchTransportFlows({
              ...activeConnectionsQueryParams,
              sourceProcessId,
              destProcessId
            }),
          refetchInterval: UPDATE_INTERVAL
        },
        {
          queryKey: [
            QueriesProcesses.GetTcpConnections,
            terminatedConnectionsQueryParams,
            sourceProcessId,
            destProcessId
          ],
          queryFn: () =>
            RESTApi.fetchTransportFlows({
              ...terminatedConnectionsQueryParams,
              sourceProcessId,
              destProcessId
            }),
          refetchInterval: UPDATE_INTERVAL
        }
      ]
    });

  return {
    summary: {
      requestCount: requestsData?.timeRangeCount || 0,
      activeConnectionCount: activeConnectionsData?.timeRangeCount || 0,
      terminatedConnectionCount: terminatedConnectionsData?.timeRangeCount || 0
    }
  };
};
