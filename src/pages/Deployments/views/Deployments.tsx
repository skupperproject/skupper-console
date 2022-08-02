import React, { useState } from 'react';

import { Card } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import { DeploymentsRoutesPaths } from '../Deployments.enum';
import DeploymentsServices from '../services';
import { QueriesDeployments } from '../services/deployments.enum';
import { DeploymentsOverviewColumns } from './Deployments.enum';

const DeploymentsOverview = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: deployments, isLoading } = useQuery(
        [QueriesDeployments.GetDeployments],
        DeploymentsServices.fetchDeployments,
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
                        <Th>{DeploymentsOverviewColumns.Name}</Th>
                    </Tr>
                </Thead>
                {deployments
                    ?.sort((a, b) => a.site.site_id.localeCompare(b.site.site_id))
                    .map((row) => (
                        <Tbody key={row.key}>
                            <Tr>
                                <Td dataLabel={DeploymentsOverviewColumns.Name}>
                                    <ResourceIcon type="deployment" />
                                    <Link
                                        to={`${DeploymentsRoutesPaths.Details}/${row.service.address}_${row.site.site_id}`}
                                    >
                                        {`${row.site.site_name} -> ${row.service.address}`}
                                    </Link>
                                </Td>
                            </Tr>
                        </Tbody>
                    ))}
            </TableComposable>
        </Card>
    );
};

export default DeploymentsOverview;
