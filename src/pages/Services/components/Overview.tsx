import { FC, useCallback } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { ExpandedMetricSections, QueryMetricsParams } from '@sk-types/Metrics.interfaces';

import { QueriesServices } from '../Services.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'service-metric-filter';
const PREFIX_METRIC_OPEN_SECTION_CACHE_KEY = `service-open-metric-sections`;

interface OverviewProps {
  serviceId: string;
  serviceName: string;
  protocol: AvailableProtocols;
}

const Overview: FC<OverviewProps> = function ({ serviceId, serviceName, protocol }) {
  const { data: processPairs } = useSuspenseQuery({
    queryKey: [QueriesServices.GetProcessPairsByService, serviceId],
    queryFn: () => RESTApi.fetchProcessPairsByService(serviceId),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleSelectedFilters = useCallback(
    (filters: string) => {
      storeDataToSession(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${serviceId}`, filters);
    },
    [serviceId]
  );

  const handleGetExpandedSectionsConfig = useCallback(
    (sections: ExpandedMetricSections) => {
      storeDataToSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${serviceId}`, sections);
    },
    [serviceId]
  );

  const processPairsResults = processPairs?.results || [];

  const sourceProcesses = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>(
    processPairsResults.map(({ sourceName, sourceSiteName }) => ({
      destinationName: sourceName,
      siteName: sourceSiteName
    }))
  );
  const destProcesses = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>(
    processPairsResults.map(({ destinationName, destinationSiteName }) => ({
      destinationName,
      siteName: destinationSiteName
    }))
  );

  const destSites = removeDuplicatesFromArrayOfObjects<{ destinationName: string }>(
    processPairsResults.map(({ destinationSiteName }) => ({
      destinationName: destinationSiteName
    }))
  );

  const sourceSites = removeDuplicatesFromArrayOfObjects<{ destinationName: string }>(
    processPairsResults.map(({ sourceSiteName }) => ({
      destinationName: sourceSiteName
    }))
  );

  return (
    <Metrics
      key={serviceId}
      sourceSites={sourceSites}
      destSites={destSites}
      sourceProcesses={sourceProcesses}
      destProcesses={destProcesses}
      availableProtocols={[protocol]}
      defaultOpenSections={{
        ...getDataFromSession<ExpandedMetricSections>(`${PREFIX_METRIC_OPEN_SECTION_CACHE_KEY}-${serviceId}`)
      }}
      defaultMetricFilterValues={{
        service: serviceName,
        ...getDataFromSession<QueryMetricsParams>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${serviceId}`)
      }}
      configFilters={{
        sourceSites: {
          disabled: !sourceSites.length
        },
        sourceProcesses: {
          disabled: !sourceProcesses.length
        },
        destSites: {
          hide: destSites.length === 0
        },
        destinationProcesses: {
          hide: destProcesses.length === 0
        }
      }}
      onGetMetricFiltersConfig={handleSelectedFilters}
      onGetExpandedSectionsConfig={handleGetExpandedSectionsConfig}
    />
  );
};

export default Overview;
