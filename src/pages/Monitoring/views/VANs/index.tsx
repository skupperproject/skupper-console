import React, { useEffect, useState } from 'react';

import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { UPDATE_INTERVAL } from 'config';

import {
  MonitoringRoutesPaths,
  QueriesMonitoring,
  RoutersColumns,
  VansColumns,
} from '../../Monitoring.enum';
import { MonitorServices } from '../../services';
import { RoutersStats, vansStats } from '../../services/services.interfaces';

const VANs = function () {
  const navigate = useNavigate();
  const [vans, setVans] = useState<vansStats[]>();
  const [routersStats, setRoutersStats] = useState<RoutersStats[]>();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

  const { data, isLoading } = useQuery(
    QueriesMonitoring.GetMonitoringStats,
    MonitorServices.fetchMonitoringStats,
    {
      refetchInterval,
      onError: handleError,
    },
  );

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  useEffect(() => {
    if (data) {
      setVans(data.vansStats);
      setRoutersStats(data.routersStats);
    }
  }, [data]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <TableComposable className="flows-table" aria-label="flows table" borders>
        <Thead>
          <Tr>
            <Th>{RoutersColumns.Name}</Th>
            <Th>{RoutersColumns.NumVans}</Th>
            <Th>{RoutersColumns.NumFLows}</Th>
            <Th>{RoutersColumns.TotalBytes}</Th>
          </Tr>
        </Thead>
        {routersStats?.map((row) => (
          <Tbody key={row.id}>
            <Tr>
              <Td dataLabel={RoutersColumns.Name}>{row.name}</Td>
              <Td dataLabel={RoutersColumns.NumVans}>{row.totalVanAddress}</Td>
              <Td dataLabel={RoutersColumns.NumFLows}>{row.totalFlows}</Td>
              <Td dataLabel={RoutersColumns.TotalBytes}>{formatBytes(row.totalBytes)}</Td>
            </Tr>
          </Tbody>
        ))}
      </TableComposable>
      <TableComposable className="flows-table" aria-label="flows table" borders>
        <Thead>
          <Tr>
            <Th>{VansColumns.Name}</Th>
            <Th>{VansColumns.NumDevices}</Th>
            <Th>{VansColumns.NumFLows}</Th>
            <Th>{VansColumns.TotalBytes}</Th>
          </Tr>
        </Thead>
        {vans?.map(({ id, name, totalDevices, totalFlows, totalBytes }) => (
          <Tbody key={id}>
            <Tr>
              <Td dataLabel={VansColumns.Name}>
                <Link to={`${MonitoringRoutesPaths.Devices}/${name}`}>{name}</Link>
              </Td>
              <Td dataLabel={VansColumns.NumDevices}>{totalDevices}</Td>
              <Td dataLabel={VansColumns.NumFLows}>{totalFlows}</Td>
              <Td dataLabel={VansColumns.TotalBytes}>{formatBytes(totalBytes)}</Td>
            </Tr>
          </Tbody>
        ))}
      </TableComposable>
      <Outlet />
    </>
  );
};

export default VANs;

// function buildVanRows(data: VansInfo[]): Row<VansInfo>[] {
//   return data?.flatMap((item) => ({ data: item }));
// }

/**
 *  Converts input bytes in the most appropriate format
 */
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
