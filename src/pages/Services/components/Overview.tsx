import { FC } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { removeDuplicatesFromArrayOfObjects } from '@core/utils/removeDuplicatesFromArrayOfObjects';
import Metrics from '@pages/shared/Metrics';
import { useMetricSessionHandlers } from '@pages/shared/Metrics/hooks/useSessionHandler';

import { QueriesServices } from '../Services.enum';

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

  const { selectedFilters, visibleMetrics, setSelectedFilters, setVisibleMetrics } =
    useMetricSessionHandlers(serviceId);

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
      defaultOpenSections={visibleMetrics}
      defaultMetricFilterValues={{
        service: serviceName,
        ...selectedFilters
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
      onGetMetricFiltersConfig={setSelectedFilters}
      onGetExpandedSectionsConfig={setVisibleMetrics}
    />
  );
};

export default Overview;
