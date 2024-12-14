import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

import { getAllProcesses, getAllProcessPairs } from '../../../API/REST.endpoints';
import { RESTApi } from '../../../API/REST.resources';

interface useProcessPairDataProps {
  id: string;
}

export const useProcessPairData = ({ id }: useProcessPairDataProps) => {
  const { data } = useSuspenseQuery({
    queryKey: [getAllProcessPairs(), id],
    queryFn: () => RESTApi.fetchProcessesPair(id)
  });

  const sourceId = data.results.sourceId;
  const destId = data.results.destinationId;

  const [{ data: source }, { data: destination }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [getAllProcesses(), sourceId],
        queryFn: () => RESTApi.fetchProcess(sourceId)
      },
      {
        queryKey: [getAllProcesses(), destId],
        queryFn: () => RESTApi.fetchProcess(destId)
      }
    ]
  });

  return { processPair: data.results, source: source.results, destination: destination.results };
};
