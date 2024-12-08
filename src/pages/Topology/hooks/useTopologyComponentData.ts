import { useSuspenseQueries } from '@tanstack/react-query';

import { Role } from '../../../API/REST.enum';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/app';
import { QueriesComponent } from '../../Components/Components.enum';
import { QueriesPairs } from '../Topology.enum';

const componentQueryParams = {
  processGroupRole: [Role.Remote, Role.External],
  endTime: 0
};

const useTopologyComponentData = () => {
  const [{ data: components }, { data: componentsPairs }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesComponent.GetComponents, componentQueryParams],
        queryFn: () => RESTApi.fetchComponents(componentQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },

      {
        queryKey: [QueriesPairs.GetComponentsPairs],
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
