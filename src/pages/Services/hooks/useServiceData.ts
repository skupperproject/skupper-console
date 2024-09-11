import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

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

const useServiceData = () => {
  const { service } = useParams();
  const serviceName = service?.split('@')[0];
  const serviceId = service?.split('@')[1] as string;
  const protocol = service?.split('@')[2] as AvailableProtocols | undefined;

  const { data: serversData } = useQuery({
    queryKey: [QueriesServices.GetProcessesByService, serviceId, initServersQueryParams],
    queryFn: () => RESTApi.fetchServersByService(serviceId, initServersQueryParams),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: requestsData } = useQuery({
    queryKey: [QueriesServices.GetFlowPairsByService, initServersQueryParams],
    queryFn: () => RESTApi.fetchFlowPairs({ ...initServersQueryParams, routingKey: serviceName }),
    enabled: protocol !== AvailableProtocols.Tcp,
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: activeConnectionsData } = useQuery({
    queryKey: [QueriesServices.GetFlowPairsByService, activeConnectionsQueryParams],
    queryFn: () => RESTApi.fetchFlowPairs({ ...activeConnectionsQueryParams, routingKey: serviceName }),
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: terminatedConnectionsData } = useQuery({
    queryKey: [QueriesServices.GetFlowPairsByService, terminatedConnectionsQueryParams],
    queryFn: () => RESTApi.fetchFlowPairs({ ...terminatedConnectionsQueryParams, routingKey: serviceName }),
    enabled: protocol === AvailableProtocols.Tcp,
    refetchInterval: UPDATE_INTERVAL
  });

  return {
    serviceName,
    serviceId,
    protocol,
    serverCount: serversData?.timeRangeCount || 0,
    requestsCount: requestsData?.timeRangeCount || 0,
    tcpActiveConnectionCount: activeConnectionsData?.timeRangeCount || 0,
    tcpTerminatedConnectionCount: terminatedConnectionsData?.timeRangeCount || 0
  };
};

export default useServiceData;
