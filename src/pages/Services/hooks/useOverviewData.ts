import { useSuspenseQuery } from '@tanstack/react-query';

import { getProcessPairsByServiceId } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';
import { UPDATE_INTERVAL } from '../../../config/reactQuery';

export const useServiceOverviewData = (id: string) => {
  const { data } = useSuspenseQuery({
    queryKey: [getProcessPairsByServiceId(id), id],
    queryFn: () => RESTApi.fetchProcessPairsByService(id),
    refetchInterval: UPDATE_INTERVAL
  });

  //TODO: API should give me an empty array instead of null
  return { pairs: data.results || [] };
};
