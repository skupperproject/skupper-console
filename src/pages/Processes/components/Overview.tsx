import { FC, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { ProcessResponse } from '@API/REST.interfaces';
import { UPDATE_INTERVAL } from '@config/config';
import { siteNameAndIdSeparator } from '@config/prometheus';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { SelectedMetricFilters } from '@pages/shared/Metrics/Metrics.interfaces';

import { QueriesProcesses } from '../Processes.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'process-metric-filters';

interface OverviewProps {
  process: ProcessResponse;
}

const Overview: FC<OverviewProps> = function ({
  process: { identity: processId, name, startTime, parent, parentName }
}) {
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

  const destProcessesRx = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>([
    ...(processesPairsTxData || []).map(({ destinationName, destinationSiteId, destinationSiteName }) => ({
      destinationName,
      siteName: `${destinationSiteName}${siteNameAndIdSeparator}${destinationSiteId}`
    }))
  ]);

  const destProcessesTx = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>([
    ...processesPairsRxReverse.map(({ destinationName, sourceSiteId, sourceSiteName }) => ({
      destinationName,
      siteName: `${sourceSiteName}${siteNameAndIdSeparator}${sourceSiteId}`
    }))
  ]);

  const destProcesses = [...destProcessesTx, ...destProcessesRx];
  const destSites = destProcesses
    .map(({ siteName }) => ({
      name: siteName
    }))
    // remove site name duplicated
    .filter((arr, index, self) => index === self.findIndex((t) => t.name === arr.name));

  const availableProtocols = [
    ...new Set(
      [...(processesPairsTxData || []), ...processesPairsRxReverse].map(({ protocol }) => protocol).filter(Boolean)
    )
  ] as AvailableProtocols[];

  return (
    <Metrics
      key={processId}
      defaultMetricFilterValues={{
        sourceProcess: name,
        sourceSite: `${parentName}${siteNameAndIdSeparator}${parent}`,
        ...getDataFromSession<SelectedMetricFilters>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${processId}`)
      }}
      startTimeLimit={startTime}
      destSites={destSites}
      destProcesses={destProcesses}
      availableProtocols={availableProtocols}
      configFilters={{
        destSites: {
          hide: destSites.length === 0
        },
        destinationProcesses: {
          hide: destProcesses.length === 0
        },
        sourceProcesses: { disabled: true },
        sourceSites: { disabled: true }
      }}
      onGetMetricFilters={handleSelectedFilters}
    />
  );
};

export default Overview;
