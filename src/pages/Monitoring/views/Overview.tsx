import React, { useState } from 'react';

import { Card } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import { MonitoringRoutesPaths } from '../Monitoring.enum';
import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';
import { OverviewColumns } from './Overview.enum';

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
                        <Th>{OverviewColumns.Name}</Th>
                        <Th>{OverviewColumns.TotalListeners}</Th>
                        <Th>{OverviewColumns.TotalConnectors}</Th>
                        <Th>{OverviewColumns.NumFLows}</Th>
                        <Th>{OverviewColumns.NumFlowsActive}</Th>
                    </Tr>
                </Thead>
                {vanServices?.map((row) => (
                    <Tbody key={row.id}>
                        <Tr>
                            <Td dataLabel={OverviewColumns.Name}>
                                <ResourceIcon type="vanAddress" />

                                <Link to={`${MonitoringRoutesPaths.Connections}/${row.id}`}>
                                    {row.id}
                                </Link>
                            </Td>
                            <Td dataLabel={OverviewColumns.TotalListeners}>
                                {`${row.listenerCount}`}
                            </Td>
                            <Td
                                dataLabel={OverviewColumns.TotalConnectors}
                            >{`${row.connectorCount}`}</Td>
                            <Td dataLabel={OverviewColumns.NumFLows}>{`${row.totalFlows}`}</Td>
                            <Td dataLabel={OverviewColumns.NumFLows}>{`${row.currentFlows}`}</Td>
                        </Tr>
                    </Tbody>
                ))}
            </TableComposable>
        </Card>
    );
};

export default Overview;
