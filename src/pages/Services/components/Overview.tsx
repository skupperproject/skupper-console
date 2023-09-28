import { FC, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import Metrics from '@pages/shared/Metrics';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';

import { PREFIX_DISPLAY_INTERVAL_CACHE_KEY, initServersQueryParams } from '../Services.constants';
import { ServicesLabels, QueriesServices } from '../Services.enum';

interface OverviewProps {
  serviceId: string;
  protocol: AvailableProtocols;
}

const Overview: FC<OverviewProps> = function ({ serviceId, protocol }) {
  const { data: exposedServersData } = useQuery(
    [QueriesServices.GetProcessesByService, serviceId, initServersQueryParams],
    () => (serviceId ? RESTApi.fetchServersByService(serviceId, initServersQueryParams) : null),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const handleRefreshMetrics = useCallback(
    (interval: string) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${serviceId}`, interval);
    },
    [serviceId]
  );

  const servers = exposedServersData?.results || [];
  const serverNames = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNamesIds = servers.map(({ name }) => name).join('|');
  const startTime = servers.reduce((acc, process) => Math.min(acc, process.startTime), 0);

  return (
    <Metrics
      key={serviceId}
      selectedFilters={{
        ...getDataFromSession<SelectedFilters>(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${serviceId}`),
        sourceProcess: serverNamesIds,
        protocol
      }}
      startTime={startTime}
      sourceProcesses={serverNames}
      availableProtocols={[protocol]}
      filterOptions={{
        sourceProcesses: {
          placeholder: ServicesLabels.MetricDestinationProcessFilter
        },
        destinationProcesses: { placeholder: ServicesLabels.Clients, hide: true }
      }}
      onGetMetricFilters={handleRefreshMetrics}
    />
  );
};

export default Overview;
