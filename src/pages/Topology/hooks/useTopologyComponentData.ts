import { useSuspenseQueries } from '@tanstack/react-query';

import { getAllComponentPairs, getAllComponents } from '../../../API/REST.endpoints';
import { Role } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';

const componentQueryParams = {
  processGroupRole: [Role.Remote, Role.External],
  endTime: 0
};

const useTopologyComponentData = () => {
  const [{ data: components }, { data: componentsPairs }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [getAllComponents(), componentQueryParams],
        queryFn: () => RESTApi.fetchComponents(componentQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },

      {
        queryKey: [getAllComponentPairs()],
        queryFn: () => RESTApi.fetchComponentsPairs(),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  return {
    components: components.results,
    componentsPairs: componentsPairs.results
  };
};

export default useTopologyComponentData;
