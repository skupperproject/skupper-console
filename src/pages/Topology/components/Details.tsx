import React, { FC } from 'react';

import { Panel, TextContent, Title, TitleSizes, Tooltip } from '@patternfly/react-core';
import { Caption, TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { capitalizeFirstLetter } from '@core/utils/capitalize';
import { formatBytes } from '@core/utils/formatBytes';
import { DeploymentTraffic } from '@pages/Deployments/services/deployments.interfaces';
import { ConnectionsColumns, ConnectionsLabels } from '@pages/Sites/components/Traffic.enum';
import { ServiceConnection } from 'API/REST.interfaces';

interface TopologyDetailsProps {
    name: string;
    tcpConnectionsOutEntries: ServiceConnection[] | DeploymentTraffic[];
    tcpConnectionsInEntries: ServiceConnection[] | DeploymentTraffic[];
    httpRequestsSentEntries: ServiceConnection[] | DeploymentTraffic[];
    httpRequestsReceivedEntries: ServiceConnection[] | DeploymentTraffic[];
}

const TopologyDetails: FC<TopologyDetailsProps> = function ({
    name,
    tcpConnectionsOutEntries,
    tcpConnectionsInEntries,
    httpRequestsSentEntries,
    httpRequestsReceivedEntries,
}) {
    return (
        <Panel>
            <Tooltip content={name}>
                <Title
                    headingLevel="h1"
                    size={TitleSizes['2xl']}
                    className="pf-u-mb-md text-ellipsis"
                    style={{ width: '300px' }}
                >
                    {capitalizeFirstLetter(name)}
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
                                {httpRequestsSentEntries.map((info) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td dataLabel={ConnectionsColumns.Name}>
                                                {`${info.client}`}
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
                                {httpRequestsReceivedEntries.map((info) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={ConnectionsColumns.Name}
                                            >{`${info.client}`}</Td>
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
                                {tcpConnectionsOutEntries.map((info) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={ConnectionsColumns.Name}
                                            >{`${info.client}`}</Td>
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
                                {tcpConnectionsInEntries.map((info) => (
                                    <Tbody key={info.id}>
                                        <Tr>
                                            <Td
                                                dataLabel={ConnectionsColumns.Name}
                                            >{`${info.client}`}</Td>
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

export default TopologyDetails;
