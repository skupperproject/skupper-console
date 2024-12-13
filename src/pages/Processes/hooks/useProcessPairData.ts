import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.resources';
import { QueriesProcesses } from '../Processes.enum';

interface useProcessPairDataProps {
  id: string;
}

export const useProcessPairData = ({ id }: useProcessPairDataProps) => {
  const { data } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetProcessPairs, id],
    queryFn: () => RESTApi.fetchProcessesPair(id)
  });

  const sourceId = data.results.sourceId;
  const destId = data.results.destinationId;

  const [{ data: source }, { data: destination }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcesses, sourceId],
        queryFn: () => RESTApi.fetchProcess(sourceId)
      },
      {
        queryKey: [QueriesProcesses.GetProcesses, destId],
        queryFn: () => RESTApi.fetchProcess(destId)
      }
    ]
  });

  return { processPair: data.results, source: source.results, destination: destination.results };
};
