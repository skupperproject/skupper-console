import React, { useState } from 'react';

import { Card } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import DeploymentsServices from '../services';
import { QueriesDeployments } from '../services/deployments.enum';
import { ServicesOverviewColumns } from './Overview.enum';

const DeploymentsOverview = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: rows, isLoading } = useQuery(
        QueriesDeployments.GetDeployments,
        DeploymentsServices.fetchDeployments,
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
        <Card>
            <TableComposable
                className="flows-table"
                aria-label="flows table"
                borders={false}
                variant="compact"
                isStickyHeader
            >
                <Thead>
                    <Tr>
                        <Th>{ServicesOverviewColumns.Name}</Th>
                        <Th>{ServicesOverviewColumns.Protocol}</Th>
                        <Th>{ServicesOverviewColumns.Deployed}</Th>
                    </Tr>
                </Thead>
                {rows?.map((row) => (
                    <Tbody key={row.key}>
                        <Tr>
                            <Td dataLabel={ServicesOverviewColumns.Name}>{row.service.address}</Td>
                            <Td
                                dataLabel={ServicesOverviewColumns.Protocol}
                            >{`${row.service.protocol}`}</Td>
                            <Td dataLabel={ServicesOverviewColumns.Deployed}>
                                {`${row.site.site_name}`}
                            </Td>
                        </Tr>
                    </Tbody>
                ))}
            </TableComposable>
        </Card>
    );
};

export default DeploymentsOverview;
