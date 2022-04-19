import React, { useState } from 'react';

import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import AppContent from '@layout/AppContent';
import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { UPDATE_INTERVAL } from 'config';

import ServicesServices from '../services';
import { QueriesServices } from '../services/services.enum';
import { ServicesOverviewColumns } from './Overview.enum';

const ServicesOverview = function () {
  const navigate = useNavigate();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

  const { data: rows, isLoading } = useQuery(
    QueriesServices.GetServices,
    ServicesServices.fetchServices,
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

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <AppContent>
      <TableComposable
        className="flows-table"
        aria-label="flows table"
        variant="compact"
        isStickyHeader
      >
        <Thead>
          <Tr>
            <Th>{ServicesOverviewColumns.Name}</Th>
            <Th>{ServicesOverviewColumns.Protocol}</Th>
          </Tr>
        </Thead>
        {rows?.map((row) => (
          <Tbody key={row.id}>
            <Tr>
              <Td dataLabel={ServicesOverviewColumns.Name}>{row.name}</Td>
              <Td dataLabel={ServicesOverviewColumns.Protocol}>{`${row.protocol}`}</Td>
            </Tr>
          </Tbody>
        ))}
      </TableComposable>
    </AppContent>
  );
};

export default ServicesOverview;
