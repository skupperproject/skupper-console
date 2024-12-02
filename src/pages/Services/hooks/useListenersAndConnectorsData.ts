import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { UPDATE_INTERVAL } from '../../../config/config';
import { QueriesServices } from '../Services.enum';

const useListenersAndConnectorsData = (serviceId: string) => {
  const [{ data: listenersData }, { data: connectorsData }] = useSuspenseQueries({
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
