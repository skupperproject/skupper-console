import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols, TcpStatus } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';

import { QueriesServices } from '../Services.enum';

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

const useServiceData = (serviceId: string) => {
  const { data: service } = useSuspenseQuery({
    queryKey: [QueriesServices.GetService, serviceId],
    queryFn: () => RESTApi.fetchService(serviceId),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: serversData } = useQuery({
    queryKey: [QueriesServices.GetProcessesByService, { ...initServersQueryParams, addresses: [service.identity] }],
    queryFn: () => RESTApi.fetchProcesses({ ...initServersQueryParams, addresses: [service.identity] }),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: requestsData } = useQuery({
    queryKey: [QueriesServices.GetFlowPairsByService, initServersQueryParams],
    queryFn: () => RESTApi.fetchFlowPairs({ ...initServersQueryParams, routingKey: service.name }),
    enabled: service.protocol !== AvailableProtocols.Tcp,
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: activeConnectionsData } = useQuery({
    queryKey: [QueriesServices.GetFlowPairsByService, activeConnectionsQueryParams],
    queryFn: () => RESTApi.fetchFlowPairs({ ...activeConnectionsQueryParams, routingKey: service.name }),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: terminatedConnectionsData } = useQuery({
    queryKey: [QueriesServices.GetFlowPairsByService, terminatedConnectionsQueryParams],
    queryFn: () => RESTApi.fetchFlowPairs({ ...terminatedConnectionsQueryParams, routingKey: service.name }),
    enabled: service.protocol === AvailableProtocols.Tcp,
    refetchInterval: UPDATE_INTERVAL
  });

  return {
    service,
    serverCount: serversData?.timeRangeCount || 0,
    requestsCount: requestsData?.timeRangeCount || 0,
    tcpActiveConnectionCount: activeConnectionsData?.timeRangeCount || 0,
    tcpTerminatedConnectionCount: terminatedConnectionsData?.timeRangeCount || 0
  };
};

export default useServiceData;
