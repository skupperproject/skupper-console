import { FC } from 'react';

import { useQuery } from '@tanstack/react-query';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { BIG_PAGINATION_SIZE, UPDATE_INTERVAL, isPrometheusActive } from '@config/config';
import SkTable from '@core/components/SkTable';
import { CustomProcessCells } from '@pages/Processes/Processes.constants';

import { QueriesServices } from '../services/services.enum';
import { initServersQueryParams, tcpServerColumns } from '../Services.constants';

interface ExposedServersProps {
  addressId: string;
  addressName: string;
  pagination?: number;
}

const ExposedServers: FC<ExposedServersProps> = function ({
  addressId,
  addressName,
  pagination = BIG_PAGINATION_SIZE
}) {
  const { data: exposedServersData } = useQuery(
    [QueriesServices.GetProcessesByAddress, addressId, initServersQueryParams],
    () => (addressId ? RESTApi.fetchServersByAddress(addressId, initServersQueryParams) : null),
    {
      refetchInterval: UPDATE_INTERVAL,
      keepPreviousData: true
    }
  );

  const { data: byteRates } = useQuery(
    ['QueriesAddresses.fetchTcpByteRateByAddress', { addressName }],
    () => PrometheusApi.fetchTcpByteRateByAddress({ addressName }),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  let servers = exposedServersData?.results || [];

  if (isPrometheusActive && byteRates) {
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
