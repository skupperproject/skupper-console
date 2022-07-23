import React, { useState } from 'react';

import { Page } from '@patternfly/react-core';
import { LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import DescriptionItem from '@pages/Sites/components/DescriptionItem';
import { UPDATE_INTERVAL } from 'config';

import { MonitorServices } from '../services';
import { QueriesMonitoring } from '../services/services.enum';
import { FlowInfoColumns } from './FlowInfo.enum';

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
        <Page>
            <DescriptionItem
                title={FlowInfoColumns.Address}
                value={startFlow?.device.address || ''}
            />
            <DescriptionItem
                title={FlowInfoColumns.Protocol}
                value={startFlow?.device.protocol || ''}
            />

            <TableComposable borders={true} isStriped>
                <Thead>
                    <Tr>
                        <Th>{FlowInfoColumns.Source}</Th>
                        <Th>{FlowInfoColumns.RouterName}</Th>
                        <Th>{FlowInfoColumns.Namespace}</Th>
                        <Th>{FlowInfoColumns.HostName}</Th>
                        <Th>{FlowInfoColumns.Bytes}</Th>
                        <Th>{FlowInfoColumns.ByteRate}</Th>
                        <Th>{FlowInfoColumns.Latency}</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td dataLabel={FlowInfoColumns.Source}>
                            {startFlow?.device.recType === 'LISTENER' ? (
                                <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />
                            ) : (
                                <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />
                            )}
                            {`${startFlow?.sourceHost}: ${startFlow?.sourcePort}`}
                        </Td>
                        <Td dataLabel={FlowInfoColumns.RouterName}>{startFlow?.router.name}</Td>
                        <Td dataLabel={FlowInfoColumns.Namespace}>{startFlow?.router.namespace}</Td>
                        <Td dataLabel={FlowInfoColumns.HostName}>{startFlow?.router.hostame}</Td>
                        <Td dataLabel={FlowInfoColumns.Bytes}>
                            {formatBytes(startFlow?.octets || 0)}
                        </Td>
                        <Td dataLabel={FlowInfoColumns.ByteRate}>
                            {`${formatBytes(startFlow?.octetRate || 0)}/sec`}
                        </Td>
                        <Td dataLabel={FlowInfoColumns.Latency}>
                            {formatTime(startFlow?.latency || 0)}
                        </Td>
                    </Tr>
                    {endFlow && (
                        <Tr>
                            <Td dataLabel={FlowInfoColumns.Source}>
                                {endFlow?.device.recType === 'LISTENER' ? (
                                    <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />
                                ) : (
                                    <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />
                                )}
                                {`${endFlow?.sourceHost}: ${endFlow?.sourcePort}`}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.RouterName}>{endFlow?.router.name}</Td>
                            <Td dataLabel={FlowInfoColumns.Namespace}>
                                {endFlow?.router.namespace}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.HostName}>{endFlow?.router.hostame}</Td>
                            <Td dataLabel={FlowInfoColumns.Bytes}>
                                {formatBytes(endFlow?.octets || 0)}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.ByteRate}>
                                {`${formatBytes(endFlow?.octetRate || 0)}/sec`}
                            </Td>
                            <Td dataLabel={FlowInfoColumns.Latency}>
                                {formatTime(endFlow?.latency || 0)}
                            </Td>
                        </Tr>
                    )}
                </Tbody>
            </TableComposable>
        </Page>
    );
};

export default FlowInfo;
