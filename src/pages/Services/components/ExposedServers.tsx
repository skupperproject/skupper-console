import { FC } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
import { PrometheusLabelsV2 } from '@config/prometheus';
import SkTable from '@core/components/SkTable';
import { CustomProcessCells } from '@pages/Processes/Processes.constants';

import { initServersQueryParams, tcpServerColumns } from '../Services.constants';
import { QueriesServices } from '../Services.enum';

interface ExposedServersProps {
  serviceId: string;
  serviceName: string;
  pagination?: number;
}

const ExposedServers: FC<ExposedServersProps> = function ({
  serviceId,
  serviceName,
  pagination = BIG_PAGINATION_SIZE
}) {
  const { data: exposedServersData } = useSuspenseQuery({
    queryKey: [QueriesServices.GetProcessesByService, { ...initServersQueryParams, addresses: [serviceId] }],
    queryFn: () => RESTApi.fetchProcesses({ ...initServersQueryParams, addresses: [serviceId] }),

    refetchInterval: UPDATE_INTERVAL
  });

  const { data: byteRates } = useSuspenseQuery({
    queryKey: [QueriesServices.GetTcpByteRateByService, { serviceName }],
    queryFn: () => PrometheusApi.fetchTcpByteRateByService({ serviceName }),
    refetchInterval: UPDATE_INTERVAL
  });

  let servers = exposedServersData?.results || [];

  if (byteRates) {
    // Create a map of byte rates using the destination process as the key
    const byteRatesMap = byteRates.reduce(
      (acc, byteRate) => {
        // Extract the destination process from the byteRate metric
        const destProcess = byteRate.metric[PrometheusLabelsV2.DestProcess];
        // Accumulate the byte rate value for the destination process
        acc[destProcess] = (acc[destProcess] || 0) + Number(byteRate.value[1]);

        return acc;
      },
      {} as Record<string, number>
    );
    // Map over the servers array and add the byteRate property to each server object
    servers = servers.map((server) => ({
      ...server,
      byteRate: byteRatesMap[server.name] || 0
    }));
  }

  return (
    <SkTable
      columns={tcpServerColumns}
      rows={servers}
      pagination={true}
      paginationPageSize={pagination}
      customCells={CustomProcessCells}
    />
  );
};

export default ExposedServers;
