import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '../../../API/REST.api';
import { QueriesProcesses } from '../Processes.enum';

interface useProcessPairDataProps {
  id: string;
}

export const useProcessPairData = ({ id }: useProcessPairDataProps) => {
  const { data } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetProcessPair, id],
    queryFn: () => RESTApi.fetchProcessesPair(id)
  });

  const sourceId = data.results.sourceId;
  const destId = data.results.destinationId;

  const [{ data: source }, { data: destination }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcess, sourceId],
        queryFn: () => RESTApi.fetchProcess(sourceId)
      },
      {
        queryKey: [QueriesProcesses.GetDestination, destId],
        queryFn: () => RESTApi.fetchProcess(destId)
      }
    ]
  });

  return { processPair: data.results, source: source.results, destination: destination.results };
};
