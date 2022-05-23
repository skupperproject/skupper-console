import React, { useState } from 'react';

import { Card } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import { MonitoringRoutesPaths, ServicesColumns } from '../Monitoring.enum';
import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';

const Overview = function () {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(0);

    const { data: vanServices, isLoading } = useQuery(
        QueriesMonitoring.GetVanAdresses,
        MonitorServices.fetchVanAddresses,
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
        <Card data-cy="sk-monitoring-services">
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
                        <Th>{ServicesColumns.Name}</Th>
                        <Th>{ServicesColumns.TotalListeners}</Th>
                        <Th>{ServicesColumns.TotalConnectors}</Th>
                        <Th>{ServicesColumns.NumFLows}</Th>
                        <Th>{ServicesColumns.NumFlowsActive}</Th>
                    </Tr>
                </Thead>
                {vanServices?.map((row) => (
                    <Tbody key={row.id}>
                        <Tr>
                            <Td dataLabel={ServicesColumns.Name}>
                                <ResourceIcon type="vanAddress" />

                                <Link to={`${MonitoringRoutesPaths.Connections}/${row.id}`}>
                                    {row.id}
                                </Link>
                            </Td>
                            <Td dataLabel={ServicesColumns.TotalListeners}>
                                {`${row.listenerCount}`}
                            </Td>
                            <Td
                                dataLabel={ServicesColumns.TotalConnectors}
                            >{`${row.connectorCount}`}</Td>
                            <Td dataLabel={ServicesColumns.NumFLows}>{`${row.totalFlows}`}</Td>
                            <Td dataLabel={ServicesColumns.NumFLows}>{`${row.currentFlows}`}</Td>
                        </Tr>
                    </Tbody>
                ))}
            </TableComposable>
        </Card>
    );
};

export default Overview;
