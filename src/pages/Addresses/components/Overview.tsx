import { FC, useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { AvailableProtocols } from '@API/REST.enum';
import { UPDATE_INTERVAL } from '@config/config';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import Metrics from '@pages/shared/Metrics';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';

import { QueriesServices } from '../services/services.enum';
import { PREFIX_DISPLAY_INTERVAL_CACHE_KEY, initServersQueryParams } from '../Services.constants';
import { RequestLabels, AddressesLabels } from '../Services.enum';

interface OverviewProps {
  addressId: string;
  protocol: AvailableProtocols;
}

const Overview: FC<OverviewProps> = function ({ addressId, protocol }) {
  const { data: exposedServersData } = useQuery(
    [QueriesServices.GetProcessesByAddress, addressId, initServersQueryParams],
    () => (addressId ? RESTApi.fetchServersByAddress(addressId, initServersQueryParams) : null),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const handleRefreshMetrics = useCallback(
    (interval: string) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${addressId}`, interval);
    },
    [addressId]
  );

  const servers = exposedServersData?.results || [];
  const serverNames = Object.values(servers).map(({ name }) => ({ destinationName: name }));
  const serverNamesIds = servers.map(({ name }) => name).join('|');
  const startTime = servers.reduce((acc, process) => Math.min(acc, process.startTime), 0);

  return (
    <Metrics
      key={addressId}
      selectedFilters={{
        ...getDataFromSession<SelectedFilters>(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${addressId}`),
        processIdSource: serverNamesIds,
        protocol: AvailableProtocols.Tcp
      }}
      startTime={startTime}
      sourceProcesses={serverNames}
      filterOptions={{
        protocols: { disabled: true, placeholder: protocol },
        sourceProcesses: {
          disabled: serverNames.length < 2,
          placeholder: AddressesLabels.MetricDestinationProcessFilter
        },
        destinationProcesses: { placeholder: RequestLabels.Clients, hide: true }
      }}
      onGetMetricFilters={handleRefreshMetrics}
    />
  );
};

export default Overview;
