import { useSuspenseQueries } from '@tanstack/react-query';

import { getAllConnectors, getAllListeners } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';

const useListenersAndConnectorsData = (serviceId: string) => {
  const [{ data: listenersData }, { data: connectorsData }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [getAllListeners(), serviceId],
        queryFn: () => RESTApi.fetchListeners({ serviceId }),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [getAllConnectors(), serviceId],
        queryFn: () => RESTApi.fetchConnectors({ serviceId }),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return {
    listeners: listenersData.results,
    connectors: connectorsData.results,
    summary: {
      listenerCount: listenersData.timeRangeCount || 0,
      connectorCount: connectorsData.timeRangeCount || 0
    }
  };
};

export default useListenersAndConnectorsData;
