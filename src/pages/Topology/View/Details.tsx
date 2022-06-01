import React, { FC, useState } from 'react';

import { Divider, Panel, Text, TextContent, Title, TitleSizes } from '@patternfly/react-core';
import { Caption, TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { formatBytes } from '@core/utils/formatBytes';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import SitesServices from '@pages/Sites/services';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import {
    SitesConnectionsColumns,
    SitesConnectionsLabels,
} from '@pages/Sites/views/Connections.enum';
import { UPDATE_INTERVAL } from 'config';

interface TopologySiteDetailsProps {
    id?: string;
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
            <Title headingLevel="h1" size={TitleSizes['4xl']} className="pf-u-mb-md">
                {capitalizeFirstLetter(site.siteName)}
            </Title>
            <Text component="h3" style={{ color: 'var(--pf-global--Color--200)' }}>
                {site.namespace} ● {site.namespace} ● {site.version}
            </Text>
            <Divider className="pf-u-mt-xs" />
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
                                <Caption>{SitesConnectionsLabels.HTTPrequestsOut}</Caption>

                                <Thead>
                                    <Tr>
                                        <Th>{SitesConnectionsColumns.Name}</Th>
                                        <Th>{SitesConnectionsColumns.BytesOut}</Th>
                                        <Th>{SitesConnectionsColumns.Requests}</Th>
                                    </Tr>
                                </Thead>
                                {httpRequestsSentEntries.map(([siteName, info]) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td dataLabel={SitesConnectionsColumns.Name}>
                                                {`${siteName}`}
                                            </Td>
                                            <Td
                                                dataLabel={SitesConnectionsColumns.BytesIn}
                                            >{`${formatBytes(info.bytes_in)}`}</Td>
                                            <Td
                                                dataLabel={SitesConnectionsColumns.Requests}
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
                                <Caption>{SitesConnectionsLabels.HTTPrequestsIn}</Caption>

                                <Thead>
                                    <Tr>
                                        <Th>{SitesConnectionsColumns.Name}</Th>
                                        <Th>{SitesConnectionsColumns.BytesOut}</Th>
                                        <Th>{SitesConnectionsColumns.Requests}</Th>
                                    </Tr>
                                </Thead>
                                {httpRequestsReceivedEntries.map(([siteName, info]) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={SitesConnectionsColumns.Name}
                                            >{`${siteName}`}</Td>
                                            <Td
                                                dataLabel={SitesConnectionsColumns.BytesIn}
                                            >{`${formatBytes(info.bytes_in)}`}</Td>
                                            <Td
                                                dataLabel={SitesConnectionsColumns.Requests}
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
                                <Caption>{SitesConnectionsLabels.TCPconnectionsOut}</Caption>
                                <Thead>
                                    <Tr>
                                        <Th>{SitesConnectionsColumns.Name}</Th>
                                        <Th>{SitesConnectionsColumns.BytesOut}</Th>
                                    </Tr>
                                </Thead>
                                {tcpConnectionsOutEntries.map(([siteName, info]) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={SitesConnectionsColumns.Name}
                                            >{`${siteName}`}</Td>
                                            <Td
                                                dataLabel={SitesConnectionsColumns.Bytes}
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
                                <Caption>{SitesConnectionsLabels.TCPconnectionsIn}</Caption>
                                <Thead>
                                    <Tr>
                                        <Th>{SitesConnectionsColumns.Name}</Th>
                                        <Th>{SitesConnectionsColumns.BytesIn}</Th>
                                    </Tr>
                                </Thead>
                                {tcpConnectionsInEntries.map(([siteName, info]) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={SitesConnectionsColumns.Name}
                                            >{`${siteName}`}</Td>
                                            <Td
                                                dataLabel={SitesConnectionsColumns.Bytes}
                                            >{`${formatBytes(info.bytes_in)}`}</Td>
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
