import { FC, useCallback } from 'react';

import { useQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { prometheusSiteNameAndIdSeparator } from '@config/prometheus';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { ExpandedMetricSections, SelectedMetricFilters } from '@pages/shared/Metrics/Metrics.interfaces';

import { QueriesProcesses } from '../Processes.enum';
import { OverviewProps } from '../Processes.interfaces';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'process-metric-filters';
const PREFIX_METRIC_OPEN_SECTION_CACHE_KEY = `process-open-metric-sections`;

const Overview: FC<OverviewProps> = function ({
  process: { identity: processId, name, startTime, parent, parentName }
}) {
  const processesPairsTxQueryParams = {
    sourceId: processId
  };

  const processesPairsRxQueryParams = {
    destinationId: processId
  };

  const [{ data: processesPairsTxData }, { data: processesPairsRxData }] = useQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessPairsResult, processesPairsTxQueryParams],
        queryFn: () => RESTApi.fetchProcessesPairsResult(processesPairsTxQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcesses.GetProcessPairsResult, processesPairsRxQueryParams],
        queryFn: () => RESTApi.fetchProcessesPairsResult(processesPairsRxQueryParams),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const handleSelectedFilters = useCallback(
    (filters: SelectedMetricFilters) => {
      storeDataToSession<SelectedMetricFilters>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${processId}`, filters);
    },
    [processId]
  );

  const handleGetExpandedSectionsConfig = useCallback(
    (sections: ExpandedMetricSections) => {
      storeDataToSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${processId}`, sections);
    },
    [processId]
  );

  const destProcessesRx = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>([
    ...(processesPairsTxData || []).map(({ destinationName, destinationSiteId, destinationSiteName }) => ({
      destinationName,
      siteName: `${destinationSiteName}${prometheusSiteNameAndIdSeparator}${destinationSiteId}`
    }))
  ]);

  const destProcessesTx = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>([
    ...(processesPairsRxData || []).map(({ sourceName, sourceSiteId, sourceSiteName }) => ({
      destinationName: sourceName,
      siteName: `${sourceSiteName}${prometheusSiteNameAndIdSeparator}${sourceSiteId}`
    }))
  ]);

  const destProcesses = [...destProcessesTx, ...destProcessesRx];
  const destSites = removeDuplicatesFromArrayOfObjects<{ destinationName: string }>(
    destProcesses.map(({ siteName }) => ({
      destinationName: siteName
    }))
  );
  const availableProtocols = [
    ...new Set(
      [...(processesPairsTxData || []), ...(processesPairsRxData || [])].map(({ protocol }) => protocol).filter(Boolean)
    )
  ] as AvailableProtocols[];

  return (
    <Metrics
      key={processId}
      destSites={destSites}
      destProcesses={destProcesses}
      availableProtocols={availableProtocols}
      defaultOpenSections={{
        ...getDataFromSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${processId}`)
      }}
      defaultMetricFilterValues={{
        sourceProcess: name,
        sourceSite: `${parentName}${prometheusSiteNameAndIdSeparator}${parent}`,
        ...getDataFromSession<SelectedMetricFilters>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${processId}`)
      }}
      startTimeLimit={startTime}
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
      onGetMetricFiltersConfig={handleSelectedFilters}
      onGetExpandedSectionsConfig={handleGetExpandedSectionsConfig}
    />
  );
};

export default Overview;
