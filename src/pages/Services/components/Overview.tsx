import { FC, useCallback } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { composePrometheusSiteLabel } from '@API/Prometheus.utils';
import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { ExpandedMetricSections, QueryMetricsParams } from '@pages/shared/Metrics/Metrics.interfaces';

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
  const startTime = processPairsResults.reduce((acc, processPair) => Math.min(acc, processPair.startTime), 0);

  const sourceProcesses = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>(
    processPairsResults.map(({ sourceName, sourceSiteName, sourceSiteId }) => ({
      destinationName: sourceName,
      siteName: composePrometheusSiteLabel(sourceSiteName, sourceSiteId)
    }))
  );
  const destProcesses = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>(
    processPairsResults.map(({ destinationName, destinationSiteName, destinationSiteId }) => ({
      destinationName,
      siteName: composePrometheusSiteLabel(destinationSiteName, destinationSiteId)
    }))
  );

  const destSites = removeDuplicatesFromArrayOfObjects<{ destinationName: string }>(
    processPairsResults.map(({ destinationSiteId, destinationSiteName }) => ({
      destinationName: composePrometheusSiteLabel(destinationSiteName, destinationSiteId)
    }))
  );

  const sourceSites = removeDuplicatesFromArrayOfObjects<{ destinationName: string }>(
    processPairsResults.map(({ sourceSiteId, sourceSiteName }) => ({
      destinationName: composePrometheusSiteLabel(sourceSiteName, sourceSiteId)
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
        protocol,
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
        },
        protocols: { disabled: true }
      }}
      startTimeLimit={startTime}
      onGetMetricFiltersConfig={handleSelectedFilters}
      onGetExpandedSectionsConfig={handleGetExpandedSectionsConfig}
    />
  );
};

export default Overview;
