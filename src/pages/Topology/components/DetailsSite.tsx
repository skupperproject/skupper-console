import React, { FC, useState } from 'react';

import { Panel, TextContent, Title, TitleSizes, Tooltip } from '@patternfly/react-core';
import { Caption, TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import { ConnectionsColumns, ConnectionsLabels } from '@pages/Sites/components/Traffic.enum';
import SitesServices from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { UPDATE_INTERVAL } from 'config';

interface TopologySiteDetailsProps {
    id: string;
}

const TopologySiteDetails: FC<TopologySiteDetailsProps> = function ({ id }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const { data: site, isLoading } = useQuery(
        [QueriesSites.GetSite, id],
        () => SitesServices.fetchSite(id),
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
        return null;
    }

    if (!site) {
        return null;
    }

    const httpRequestsReceivedEntries = Object.entries(site.httpRequestsReceived);
    const httpRequestsSentEntries = Object.entries(site.httpRequestsSent);
    const tcpConnectionsInEntries = Object.entries(site.tcpConnectionsIn);
    const tcpConnectionsOutEntries = Object.entries(site.tcpConnectionsOut);

    return (
        <Panel>
            <Tooltip content={site.siteName}>
                <Title
                    headingLevel="h1"
                    size={TitleSizes['2xl']}
                    className="pf-u-mb-md text-ellipsis"
                    style={{ width: '300px' }}
                >
                    {capitalizeFirstLetter(site.siteName)}
                </Title>
            </Tooltip>
            <TextContent className="pf-u-mt-md">
                {(!!httpRequestsSentEntries.length || !!httpRequestsReceivedEntries.length) && (
                    <>
                        {!!httpRequestsSentEntries.length && (
                            <TableComposable
                                aria-label="flows table"
                                variant="compact"
                                isStickyHeader
                                borders={false}
                            >
                                <Caption>{ConnectionsLabels.HTTPrequestsOut}</Caption>

                                <Thead>
                                    <Tr>
                                        <Th>{ConnectionsColumns.Name}</Th>
                                        <Th>{ConnectionsColumns.BytesOut}</Th>
                                        <Th>{ConnectionsColumns.Requests}</Th>
                                    </Tr>
                                </Thead>
                                {httpRequestsSentEntries.map(([siteName, info]) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td dataLabel={ConnectionsColumns.Name}>
                                                {`${siteName}`}
                                            </Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.BytesIn}
                                            >{`${formatBytes(info.bytes_out)}`}</Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.Requests}
                                            >{`${info.requests}`}</Td>
                                        </Tr>
                                    </Tbody>
                                ))}
                            </TableComposable>
                        )}
                        {!!httpRequestsReceivedEntries.length && (
                            <TableComposable
                                aria-label="flows table"
                                variant="compact"
                                isStickyHeader
                                borders={false}
                            >
                                <Caption>{ConnectionsLabels.HTTPrequestsIn}</Caption>

                                <Thead>
                                    <Tr>
                                        <Th>{ConnectionsColumns.Name}</Th>
                                        <Th>{ConnectionsColumns.BytesOut}</Th>
                                        <Th>{ConnectionsColumns.Requests}</Th>
                                    </Tr>
                                </Thead>
                                {httpRequestsReceivedEntries.map(([siteName, info]) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={ConnectionsColumns.Name}
                                            >{`${siteName}`}</Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.BytesIn}
                                            >{`${formatBytes(info.bytes_out)}`}</Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.Requests}
                                            >{`${info.requests}`}</Td>
                                        </Tr>
                                    </Tbody>
                                ))}
                            </TableComposable>
                        )}
                    </>
                )}

                {(!!tcpConnectionsOutEntries.length || !!tcpConnectionsInEntries.length) && (
                    <>
                        {!!tcpConnectionsOutEntries.length && (
                            <TableComposable
                                aria-label="flows table"
                                variant="compact"
                                isStickyHeader
                                borders={false}
                            >
                                <Caption>{ConnectionsLabels.TCPconnectionsOut}</Caption>
                                <Thead>
                                    <Tr>
                                        <Th>{ConnectionsColumns.Name}</Th>
                                        <Th>{ConnectionsColumns.BytesOut}</Th>
                                    </Tr>
                                </Thead>
                                {tcpConnectionsOutEntries.map(([siteName, info]) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={ConnectionsColumns.Name}
                                            >{`${siteName}`}</Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.Bytes}
                                            >{`${formatBytes(info.bytes_out)}`}</Td>
                                        </Tr>
                                    </Tbody>
                                ))}
                            </TableComposable>
                        )}
                        {!!tcpConnectionsInEntries.length && (
                            <TableComposable
                                aria-label="flows table"
                                variant="compact"
                                isStickyHeader
                                borders={false}
                            >
                                <Caption>{ConnectionsLabels.TCPconnectionsIn}</Caption>
                                <Thead>
                                    <Tr>
                                        <Th>{ConnectionsColumns.Name}</Th>
                                        <Th>{ConnectionsColumns.BytesOut}</Th>
                                    </Tr>
                                </Thead>
                                {tcpConnectionsInEntries.map(([siteName, info]) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={ConnectionsColumns.Name}
                                            >{`${siteName}`}</Td>
                                            <Td
                                                dataLabel={ConnectionsColumns.Bytes}
                                            >{`${formatBytes(info.bytes_out)}`}</Td>
                                        </Tr>
                                    </Tbody>
                                ))}
                            </TableComposable>
                        )}
                    </>
                )}
            </TextContent>
        </Panel>
    );
};

export default TopologySiteDetails;
