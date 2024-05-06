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
  idSelected?: string;
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

  //transform data
  let filteredPairs = componentPairs;
  let filteredComponents = components.results;

  // check if in the UI we are displaying data links and the option "show only neighbours" is selected
  if (filteredPairs && idSelected) {
    filteredPairs = filteredPairs.filter((edge) => edge.sourceId === idSelected || edge.destinationId === idSelected);

    const ids = filteredPairs.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
    filteredComponents = components.results.filter(({ identity }) => ids.includes(identity));
  }

  return {
    components: filteredComponents,
    componentsPairs: filteredPairs
  };
};

export default useTopologyComponentData;
