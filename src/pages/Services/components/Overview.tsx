import { FC, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { siteNameAndIdSeparator } from '@config/prometheus';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { SelectedMetricFilters } from '@pages/shared/Metrics/Metrics.interfaces';

import { QueriesServices } from '../Services.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'service-metric-filter';

interface OverviewProps {
  serviceId: string;
  serviceName: string;
  protocol: AvailableProtocols;
}

const Overview: FC<OverviewProps> = function ({ serviceId, serviceName, protocol }) {
  const { data: processPairs } = useQuery(
    [QueriesServices.GetProcessPairsByService, serviceId],
    () => RESTApi.fetchProcessPairsByService(serviceId),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const handleSelectedFilters = useCallback(
    (filters: string) => {
      storeDataToSession(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${serviceId}`, filters);
    },
    [serviceId]
  );

  const processPairsResults = processPairs?.results || [];
  const startTime = processPairsResults.reduce((acc, processPair) => Math.min(acc, processPair.startTime), 0);

  const sourceProcesses = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>(
    processPairsResults.map(({ sourceName, sourceSiteName, sourceSiteId }) => ({
      destinationName: sourceName,
      // prometheus use a combination of process name and site name as a siteId key
      siteName: `${sourceSiteName}${siteNameAndIdSeparator}${sourceSiteId}`
    }))
  );
  const destProcesses = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>(
    processPairsResults.map(({ destinationName, destinationSiteName, destinationSiteId }) => ({
      destinationName,
      siteName: `${destinationSiteName}${siteNameAndIdSeparator}${destinationSiteId}`
    }))
  );

  const destSites = processPairsResults
    .map(({ destinationSiteId, destinationSiteName }) => ({
      // prometheus use a combination of process name and site name as a siteId key
      name: `${destinationSiteName}${siteNameAndIdSeparator}${destinationSiteId}`
    }))
    // remove site name duplicated
    .filter((arr, index, self) => index === self.findIndex((t) => t.name === arr.name));

  const sourceSites = processPairsResults
    .map(({ sourceSiteId, sourceSiteName }) => ({
      name: `${sourceSiteName}${siteNameAndIdSeparator}${sourceSiteId}`
    }))
    // remove site name duplicated
    .filter((arr, index, self) => index === self.findIndex((t) => t.name === arr.name));

  return (
    <Metrics
      key={serviceId}
      sourceProcesses={sourceProcesses}
      destProcesses={destProcesses}
      sourceSites={sourceSites}
      destSites={destSites}
      availableProtocols={[protocol]}
      defaultMetricFilterValues={{
        protocol,
        service: serviceName,
        ...getDataFromSession<SelectedMetricFilters>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${serviceId}`)
      }}
      configFilters={{
        sourceSites: {
          disabled: !sourceSites.length
        },
        sourceProcesses: {
          disabled: !sourceProcesses.length
        },
        protocols: { disabled: true }
      }}
      startTimeLimit={startTime}
      onGetMetricFilters={handleSelectedFilters}
    />
  );
};

export default Overview;
