import React, { useState } from 'react';

import { Card } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import ServicesServices from '../services';
import { QueriesServices } from '../services/services.enum';
import { ServicesOverviewColumns } from './Overview.enum';

const ServicesOverview = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: rows, isLoading } = useQuery(
        QueriesServices.GetServices,
        ServicesServices.fetchServices,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <Card>
            <TableComposable
                className="flows-table"
                aria-label="flows table"
                borders={false}
                variant="compact"
                isStickyHeader
                isStriped
            >
                <Thead>
                    <Tr>
                        <Th>{ServicesOverviewColumns.Name}</Th>
                        <Th>{ServicesOverviewColumns.Protocol}</Th>
                    </Tr>
                </Thead>
                {rows
                    ?.sort((a, b) => a.id.localeCompare(b.id))
                    .map((row) => (
                        <Tbody key={row.id}>
                            <Tr>
                                <Td dataLabel={ServicesOverviewColumns.Name}>
                                    <ResourceIcon type="service" />
                                    {row.name}
                                </Td>
                                <Td
                                    dataLabel={ServicesOverviewColumns.Protocol}
                                >{`${row.protocol}`}</Td>
                            </Tr>
                        </Tbody>
                    ))}
            </TableComposable>
        </Card>
    );
};

export default ServicesOverview;
