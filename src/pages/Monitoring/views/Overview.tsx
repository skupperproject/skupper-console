import React, { useState } from 'react';

import { Card } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { MonitoringRoutesPaths, ServicesColumns } from '../Monitoring.enum';
import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';

const Overview = function () {
    const navigate = useNavigate();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: vanServices, isLoading } = useQuery(
        QueriesMonitoring.GetMonitoringNetworkStats,
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
            >
                <Thead>
                    <Tr>
                        <Th>{ServicesColumns.Name}</Th>
                        <Th>{ServicesColumns.RoutersAssociated}</Th>
                        <Th>{ServicesColumns.TotalBytes}</Th>
                        <Th>{ServicesColumns.NumDevices}</Th>
                        <Th>{ServicesColumns.NumFLows}</Th>
                    </Tr>
                </Thead>
                {vanServices?.map((row) => (
                    <Tbody key={row.id}>
                        <Tr>
                            <Td dataLabel={ServicesColumns.Name}>
                                <Link to={`${MonitoringRoutesPaths.Connections}/${row.name}`}>
                                    {row.name}
                                </Link>
                            </Td>
                            <Td dataLabel={ServicesColumns.RoutersAssociated}>
                                {`${row.routersAssociated}`}
                            </Td>
                            <Td dataLabel={ServicesColumns.TotalBytes}>
                                {`${formatBytes(row.totalBytes)}`}
                            </Td>
                            <Td dataLabel={ServicesColumns.NumDevices}>{`${row.totalDevices}`}</Td>
                            <Td dataLabel={ServicesColumns.NumFLows}>{`${row.totalFlows}`}</Td>
                        </Tr>
                    </Tbody>
                ))}
            </TableComposable>
        </Card>
    );
};

export default Overview;
