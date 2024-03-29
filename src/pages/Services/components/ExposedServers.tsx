import { FC } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL } from '@config/config';
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
    queryKey: [QueriesServices.GetProcessesByService, serviceId, initServersQueryParams],
    queryFn: () => (serviceId ? RESTApi.fetchServersByService(serviceId, initServersQueryParams) : null),

    refetchInterval: UPDATE_INTERVAL
  });

  const { data: byteRates } = useSuspenseQuery({
    queryKey: [QueriesServices.GetTcpByteRateByService, { serviceName }],
    queryFn: () => PrometheusApi.fetchTcpByteRateByService({ serviceName }),
    refetchInterval: UPDATE_INTERVAL
  });

  let servers = exposedServersData?.results || [];

  if (byteRates) {
    const byteRatesMap = byteRates.reduce(
      (acc, byteRate) => {
        acc[`${byteRate.metric.destProcess}`] = Number(byteRate.value[1]);

        return acc;
      },
      {} as Record<string, number>
    );
    servers = servers.map((conn) => ({
      ...conn,
      byteRate: byteRatesMap[`${conn.name}`] || 0
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
