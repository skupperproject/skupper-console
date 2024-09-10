import { FC, useCallback } from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';

import { composePrometheusSiteLabel } from '@API/Prometheus.utils';
import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { ExpandedMetricSections, QueryMetricsParams } from '@sk-types/Metrics.interfaces';
import { ProcessResponse } from '@sk-types/REST.interfaces';

import { QueriesProcesses } from '../Processes.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'process-metric-filters';
const PREFIX_METRIC_OPEN_SECTION_CACHE_KEY = `process-open-metric-sections`;

interface OverviewProps {
  process: ProcessResponse;
}

const Overview: FC<OverviewProps> = function ({ process: { identity: processId, name } }) {
  const processesPairsTxQueryParams = {
    sourceId: processId
  };

  const processesPairsRxQueryParams = {
    destinationId: processId
  };

  const [{ data: processesPairsTxData }, { data: processesPairsRxData }] = useSuspenseQueries({
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
    (filters: QueryMetricsParams) => {
      storeDataToSession<QueryMetricsParams>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${processId}`, filters);
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
      siteName: composePrometheusSiteLabel(destinationSiteName, destinationSiteId)
    }))
  ]);

  const destProcessesTx = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>([
    ...(processesPairsRxData || []).map(({ sourceName, sourceSiteId, sourceSiteName }) => ({
      destinationName: sourceName,
      siteName: composePrometheusSiteLabel(sourceSiteName, sourceSiteId)
    }))
  ]);

  const destProcesses = [...destProcessesTx, ...destProcessesRx];
  const destSites = removeDuplicatesFromArrayOfObjects<{ destinationName: string }>(
    destProcesses.map(({ siteName }) => ({
      destinationName: siteName
    }))
  );

  const uniqueProtocols = [...new Set([...processesPairsTxData, ...processesPairsRxData].map((item) => item.protocol))];

  return (
    <Metrics
      key={processId}
      destSites={destSites}
      destProcesses={destProcesses}
      availableProtocols={uniqueProtocols}
      defaultOpenSections={{
        ...getDataFromSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${processId}`)
      }}
      defaultMetricFilterValues={{
        sourceProcess: name,
        ...getDataFromSession<QueryMetricsParams>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${processId}`)
      }}
      configFilters={{
        destSites: {
          hide: destSites.length === 0
        },
        destinationProcesses: {
          hide: destProcesses.length === 0
        },
        sourceProcesses: { disabled: true },
        sourceSites: { hide: true }
      }}
      onGetMetricFiltersConfig={handleSelectedFilters}
      onGetExpandedSectionsConfig={handleGetExpandedSectionsConfig}
    />
  );
};

export default Overview;
