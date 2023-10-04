import { FC, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { siteNameAndIdSeparator } from '@config/prometheus';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import Metrics from '@pages/shared/Metrics';
import { SelectedMetricFilters } from '@pages/shared/Metrics/Metrics.interfaces';

import { ServicesLabels, QueriesServices } from '../Services.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'service-metric-filter';

interface OverviewProps {
  serviceId: string;
  protocol: AvailableProtocols;
}

const Overview: FC<OverviewProps> = function ({ serviceId, protocol }) {
  const { data: exposedServersData } = useQuery(
    [QueriesServices.GetProcessesByService, serviceId],
    () => (serviceId ? RESTApi.fetchServersByService(serviceId) : null),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

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

  const clientNames = [...new Set(processPairsResults.map(({ sourceName }) => sourceName))];
  const sourceProcesses = clientNames.map((sourceName) => ({ destinationName: sourceName }));

  const serverNames = [...new Set(processPairsResults.map(({ destinationName }) => destinationName))];
  const destProcessws = serverNames.map((destinationName) => ({ destinationName }));

  const servers = exposedServersData?.results || [];
  const destSites = servers
    .map(({ parentName, parent }) => ({
      // prometheus use a combination of process name and site name as a siteId key
      name: `${parentName}${siteNameAndIdSeparator}${parent}`
    }))
    // remove site name duplicated
    .filter((arr, index, self) => index === self.findIndex((t) => t.name === arr.name));

  return (
    <Metrics
      key={serviceId}
      sourceProcesses={sourceProcesses}
      destProcesses={destProcessws}
      destSites={destSites}
      availableProtocols={[protocol]}
      defaultMetricFilterValues={{
        protocol,
        ...getDataFromSession<SelectedMetricFilters>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${serviceId}`)
      }}
      configFilters={{
        sourceProcesses: {
          placeholder: sourceProcesses.length
            ? ServicesLabels.MetricSourceProcessFilter
            : ServicesLabels.NoMetricSourceProcessFilter,
          disabled: !sourceProcesses.length
        },
        destinationProcesses: {
          placeholder: ServicesLabels.MetricDestinationProcessFilter
        },
        protocols: { disabled: true }
      }}
      startTimeLimit={startTime}
      onGetMetricFilters={handleSelectedFilters}
    />
  );
};

export default Overview;
