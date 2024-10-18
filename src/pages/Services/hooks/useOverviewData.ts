import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { UPDATE_INTERVAL } from '../../../config/config';
import { QueriesServices } from '../Services.enum';

export const useServiceOverviewData = (id: string) => {
  const { data } = useSuspenseQuery({
    queryKey: [QueriesServices.GetProcessPairsByService, id],
    queryFn: () => RESTApi.fetchProcessPairsByService(id),
    refetchInterval: UPDATE_INTERVAL
  });

  //TODO: API should give me an empty array instead of null
  return { pairs: data.results || [] };
};
