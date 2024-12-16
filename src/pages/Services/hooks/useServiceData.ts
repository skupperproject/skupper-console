import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import {
  getAllConnectors,
  getAllHttpRequests,
  getAllListeners,
  getAllProcesses,
  getAllServices,
  getAllTcpConnections
} from '../../../API/REST.endpoints';
import { TcpStatus } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';

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
    queryKey: [getAllServices(), serviceId],
    queryFn: () => RESTApi.fetchService(serviceId),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: serversData } = useQuery({
    queryKey: [getAllProcesses(), { ...initServersQueryParams, addresses: [service.results.identity] }],
    queryFn: () => RESTApi.fetchProcesses({ ...initServersQueryParams, addresses: [service.results.identity] }),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: requestsData } = useQuery({
    queryKey: [getAllHttpRequests(), initServersQueryParams],
    queryFn: () => RESTApi.fetchApplicationFlows({ ...initServersQueryParams, routingKey: service.results.name }),
    enabled: !!service.results.observedApplicationProtocols.length,
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: activeConnectionsData } = useQuery({
    queryKey: [getAllTcpConnections(), activeConnectionsQueryParams],
    queryFn: () => RESTApi.fetchTransportFlows({ ...activeConnectionsQueryParams, routingKey: service.results.name }),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: terminatedConnectionsData } = useQuery({
    queryKey: [getAllTcpConnections(), terminatedConnectionsQueryParams],
    queryFn: () =>
      RESTApi.fetchTransportFlows({ ...terminatedConnectionsQueryParams, routingKey: service.results.name }),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: listenersData } = useQuery({
    queryKey: [getAllListeners(), initServersQueryParams],
    queryFn: () => RESTApi.fetchListeners({ ...initServersQueryParams, addressId: serviceId }),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: connectorsData } = useQuery({
    queryKey: [getAllConnectors(), initServersQueryParams],
    queryFn: () => RESTApi.fetchConnectors({ ...initServersQueryParams, addressId: serviceId }),
    refetchInterval: UPDATE_INTERVAL
  });

  return {
    service: service.results,
    summary: {
      serverCount: serversData?.timeRangeCount || 0,
      requestsCount: requestsData?.timeRangeCount || 0,
      activeConnectionCount: activeConnectionsData?.timeRangeCount || 0,
      terminatedConnectionCount: terminatedConnectionsData?.timeRangeCount || 0,
      listenerCount: listenersData?.timeRangeCount || 0,
      connectorCount: connectorsData?.timeRangeCount || 0
    }
  };
};

export default useServiceData;
