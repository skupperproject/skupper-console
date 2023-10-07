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
      siteName: composePrometheusSiteId({ id: sourceSiteId, name: sourceSiteName })
    }))
  );
  const destProcesses = removeDuplicatesFromArrayOfObjects<{ destinationName: string; siteName: string }>(
    processPairsResults.map(({ destinationName, destinationSiteName, destinationSiteId }) => ({
      destinationName,
      siteName: composePrometheusSiteId({ id: destinationSiteId, name: destinationSiteName })
    }))
  );

  const destSites = removeDuplicatesFromArrayOfObjects<{ destinationName: string }>(
    processPairsResults.map(({ destinationSiteId, destinationSiteName }) => ({
      destinationName: composePrometheusSiteId({ id: destinationSiteId, name: destinationSiteName })
    }))
  );

  const sourceSites = removeDuplicatesFromArrayOfObjects<{ destinationName: string }>(
    processPairsResults.map(({ sourceSiteId, sourceSiteName }) => ({
      destinationName: composePrometheusSiteId({ id: sourceSiteId, name: sourceSiteName })
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

// prometheus use a combination of process name and site name as a siteId key
function composePrometheusSiteId({ id, name }: { id: string; name: string }) {
  return `${name}${siteNameAndIdSeparator}${id}`;
}
