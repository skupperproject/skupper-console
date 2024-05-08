import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { QueriesComponent } from '@pages/ProcessGroups/ProcessGroups.enum';

import { QueriesTopology } from '../Topology.enum';

const componentQueryParams = {
  processGroupRole: ['remote', 'external'],
  endTime: 0
};

interface UseTopologyDataProps {
  idSelected?: string[];
}

const useTopologyComponentData = ({ idSelected }: UseTopologyDataProps) => {
  const [{ data: components }, { data: componentPairs }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesComponent.GetProcessGroups, componentQueryParams],
        queryFn: () => RESTApi.fetchProcessGroups(componentQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },

      {
        queryKey: [QueriesTopology.GetProcessGroupsPairs],
        queryFn: () => RESTApi.fetchProcessGroupsPairs(),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  let filteredPairs = componentPairs;
  let filteredComponents = components.results;

  if (idSelected) {
    filteredPairs = filteredPairs.filter(
      (edge) => idSelected.includes(edge.sourceId) || idSelected.includes(edge.destinationId)
    );

    const idsFromEdges = filteredPairs.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
    const uniqueIds = [...new Set(idSelected.concat(idsFromEdges))];

    filteredComponents = filteredComponents.filter(({ identity }) => uniqueIds.includes(identity));
  }

  return {
    components: filteredComponents,
    componentsPairs: filteredPairs
  };
};

export default useTopologyComponentData;
