import React, { useState } from 'react';

import { Alert, Card, Label } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';
import { FlowInfoColumns, FlowInfoLables } from './FlowInfo.enum';

const FlowInfo = function () {
    const navigate = useNavigate();
    const { idFlow } = useParams();

    const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

    const { data: connection, isLoading } = useQuery(
        [QueriesMonitoring.GetMonitoringConnection],
        () => (idFlow ? MonitorServices.fetchConnectionByFlowId(idFlow) : null),
        {
            cacheTime: 0,
            refetchOnWindowFocus: false,
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

    if (!connection) {
        return null;
    }

    const { startFlow, endFlow } = connection;

    return (
        <>
            {(!startFlow || !endFlow) && (
                <Alert
                    variant="warning"
                    isInline
                    title={FlowInfoLables.WarningMessage}
                    className="pf-u-mb-md"
                />
            )}

            <Card data-cy="sk-monitoring-services" className="pf-u-mb-md">
                <TableComposable>
                    <Thead hasNestedHeader>
                        <Tr>
                            <Th colSpan={4} hasRightBorder>
                                <Label color="blue">
                                    {' '}
                                    {startFlow?.parentType === FlowInfoLables.Listener
                                        ? FlowInfoLables.Listener
                                        : FlowInfoLables.Connector}
                                </Label>
                            </Th>
                            <Th colSpan={4} hasRightBorder>
                                <Label color="blue">
                                    {startFlow?.parentType === FlowInfoLables.Listener
                                        ? FlowInfoLables.Connector
                                        : FlowInfoLables.Listener}
                                </Label>
                            </Th>
                        </Tr>
                        <Tr>
                            <Th isSubheader>{FlowInfoColumns.IP}</Th>
                            <Th isSubheader>{FlowInfoColumns.Port}</Th>
                            <Th isSubheader>{FlowInfoColumns.Bytes}</Th>
                            <Th isSubheader hasRightBorder>
                                {FlowInfoColumns.Latency}
                            </Th>
                            <Th isSubheader>{FlowInfoColumns.IP}</Th>
                            <Th isSubheader>{FlowInfoColumns.Port}</Th>
                            <Th isSubheader> {FlowInfoColumns.Bytes}</Th>
                            <Th isSubheader hasRightBorder>
                                {FlowInfoColumns.Latency}
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td dataLabel={'IP'}>{startFlow?.sourceHost || '-'}</Td>
                            <Td dataLabel={'port'}>{startFlow?.sourcePort || '-'}</Td>
                            <Td dataLabel={'bytes'}>
                                {startFlow?.octets ? formatBytes(startFlow?.octets) : '-'}
                            </Td>
                            <Td dataLabel={'latency'}>
                                {startFlow?.latency ? formatTime(startFlow?.latency) : '-'}
                            </Td>
                            <Td dataLabel={'destination'}>{endFlow?.sourceHost || '-'}</Td>
                            <Td dataLabel={'port'}>{endFlow?.sourcePort || '-'}</Td>
                            <Td dataLabel={'bytes'}>
                                {endFlow?.octets ? formatBytes(endFlow?.octets) : '-'}
                            </Td>
                            <Td dataLabel={'latency'}>
                                {endFlow?.latency ? formatTime(endFlow?.latency) : '-'}
                            </Td>
                        </Tr>
                    </Tbody>
                </TableComposable>
            </Card>
        </>
    );
};

export default FlowInfo;
