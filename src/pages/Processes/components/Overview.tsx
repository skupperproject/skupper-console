import { FC, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { ProcessResponse } from '@API/REST.interfaces';
import { UPDATE_INTERVAL } from '@config/config';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { SelectedMetricFilters } from '@pages/shared/Metrics/Metrics.interfaces';

import { QueriesProcesses } from '../Processes.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'process-metric-filters';

interface OverviewProps {
  process: ProcessResponse;
}

const Overview: FC<OverviewProps> = function ({ process: { identity: processId, name, startTime } }) {
  const processesPairsTxQueryParams = {
    sourceId: processId
  };

  const processesPairsRxQueryParams = {
    destinationId: processId
  };

  const { data: processesPairsTxData } = useQuery(
    [QueriesProcesses.GetProcessPairsResult, processesPairsTxQueryParams],
    () => RESTApi.fetchProcessesPairsResult(processesPairsTxQueryParams),
    { refetchInterval: UPDATE_INTERVAL }
  );

  const { data: processesPairsRxData } = useQuery(
    [QueriesProcesses.GetProcessPairsResult, processesPairsRxQueryParams],
    () => RESTApi.fetchProcessesPairsResult(processesPairsRxQueryParams),
    { refetchInterval: UPDATE_INTERVAL }
  );

  const handleSelectedFilters = useCallback(
    (filters: SelectedMetricFilters) => {
      storeDataToSession(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${processId}`, filters);
    },
    [processId]
  );

  const processesPairsRxReverse =
    (processesPairsRxData || []).map((processPairsData) => ({
      ...processPairsData,
      sourceId: processPairsData.destinationId,
      sourceName: processPairsData.destinationName,
      destinationName: processPairsData.sourceName,
      destinationId: processPairsData.sourceId
    })) || [];

  const destProcesses = [...(processesPairsTxData || []), ...processesPairsRxReverse];
  const availableProtocols = [
    ...new Set(destProcesses.map(({ protocol }) => protocol).filter(Boolean))
  ] as AvailableProtocols[];

  return (
    <Metrics
      key={processId}
      defaultMetricFilterValues={{
        sourceProcess: name,
        ...getDataFromSession<SelectedMetricFilters>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${processId}`)
      }}
      startTimeLimit={startTime}
      destProcesses={destProcesses}
      availableProtocols={availableProtocols}
      configFilters={{
        destinationProcesses: {
          placeholder: MetricsLabels.FilterAllDestinationProcesses,
          hide: destProcesses.length === 0
        },
        sourceProcesses: { disabled: true, placeholder: name }
      }}
      onGetMetricFilters={handleSelectedFilters}
    />
  );
};

export default Overview;
