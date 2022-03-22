import React, { useEffect, useState } from 'react';

import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';

import { MonitoringRoutesPaths, QueriesMonitoring, VansColumns } from '../Monitoring.enum';
import { Row } from '../Monitoring.interfaces';
import { MonitorServices } from '../services';
import { VansInfo } from '../services/services.interfaces';

const VANs = function () {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row<VansInfo>[]>();

  const { data: vans, isLoading } = useQuery(QueriesMonitoring.GetVans, MonitorServices.fetchVans, {
    onError: handleError,
  });

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

    navigate(route);
  }

  useEffect(() => {
    if (vans) {
      setRows(buildVanRows(vans));
    }
  }, [vans]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <TableComposable className="flows-table" aria-label="flows table" borders>
        <Thead>
          <Tr>
            <Th>{VansColumns.Name}</Th>
            <Th>{VansColumns.NumDevices}</Th>
            <Th>{VansColumns.NumFLows}</Th>
          </Tr>
        </Thead>
        {rows?.map(({ data: row }) => (
          <Tbody key={row.id}>
            <Tr>
              <Td dataLabel={VansColumns.Name}>
                <Link to={`${MonitoringRoutesPaths.Devices}/${row.id}`}>{row.name}</Link>
              </Td>
              <Td dataLabel={VansColumns.NumDevices}>{row.nunDevices}</Td>
              <Td dataLabel={VansColumns.Name}>{row.numFLows}</Td>
            </Tr>
          </Tbody>
        ))}
      </TableComposable>
      <Outlet />
    </>
  );
};

export default VANs;

function buildVanRows(data: VansInfo[]): Row<VansInfo>[] {
  return data?.flatMap((item) => ({ data: item }));
}
