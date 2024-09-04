import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';

import { QueriesProcesses } from '../Processes.enum';

interface useProcessPairDataProps {
  processPairId: string;
}

const useProcessPairData = ({ processPairId }: useProcessPairDataProps) => {
  const { data: processPair } = useSuspenseQuery({
    queryKey: [QueriesProcesses.GetProcessPair, processPairId],
    queryFn: () => RESTApi.fetchProcessesPair(processPairId)
  });

  const sourceId = processPair.results.sourceId;
  const destId = processPair.results.destinationId;

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

  return { source, destination };
};

export default useProcessPairData;
