import { useSuspenseQueries } from '@tanstack/react-query';

import { ConnectorResponse } from 'types/REST.interfaces';

import { RESTApi } from '../../../API/REST.api';
import { UPDATE_INTERVAL } from '../../../config/config';
import { QueriesServices } from '../Services.enum';

const useListenersAndConnectorsData = (serviceId: string) => {
  const [{ data: listenersData }, { data: connectorsData }, { data: processesData }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesServices.GetListeners, serviceId],
        queryFn: () => RESTApi.fetchListeners({ addressId: serviceId }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesServices.GetConnectors, serviceId],
        queryFn: () => RESTApi.fetchConnectors({ addressId: serviceId }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesServices.GetProcessesByService, { addresses: [serviceId] }],
        queryFn: () => RESTApi.fetchProcesses({ addresses: [serviceId] }),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return {
    listeners: listenersData.results,
    connectors: connectorsData.results,
    processes: processesData.results,
    summary: {
      listenerCount: listenersData.timeRangeCount || 0,
      connectorCount: connectorsData.timeRangeCount || 0
    }
  };
};

export default useListenersAndConnectorsData;

export function getBaseName(name: string): string {
  const ipSuffixRegex = /-\d{1,3}(\.\d{1,3}){3}$/;

  return name.replace(ipSuffixRegex, '');
}

export function aggregateConnectorResponses(connectors: ConnectorResponse[]) {
  const aggregatedResults: Record<string, ConnectorResponse> = {};

  connectors.forEach((connector) => {
    const baseName = getBaseName(connector.name);
    const key = `${connector.parent}-${baseName}`;

    if (!aggregatedResults[key]) {
      aggregatedResults[key] = { ...connector, name: baseName, count: 1, processes: [connector] };
    } else {
      aggregatedResults[key].count!++;
      aggregatedResults[key].processes!.push(connector);
    }
  });

  return Object.values(aggregatedResults);
}
