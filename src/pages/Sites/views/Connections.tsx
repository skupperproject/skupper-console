import React, { FC } from 'react';

import { Card, CardTitle, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';

import { ConnectionsDetailsColumns, ConnectionsDetailsLabels } from './Connections.enum';
import { SiteConnectionsProps, ConnectionProps } from './Connections.interfaces';

const SitesConnections: FC<SiteConnectionsProps> = function ({
    httpRequestsReceived,
    httpRequestsSent,
    tcpConnectionsIn,
    tcpConnectionsOut,
}) {
    const httpRequestsReceivedEntries = Object.entries(httpRequestsReceived);
    const httpRequestsSentEntries = Object.entries(httpRequestsSent);
    const tcpConnectionsInEntries = Object.entries(tcpConnectionsIn);
    const tcpConnectionsOutEntries = Object.entries(tcpConnectionsOut);

    return (
        <Stack hasGutter>
            {httpRequestsReceivedEntries.length !== 0 && (
                <StackItem>
                    <Card isRounded>
                        <CardTitle>{ConnectionsDetailsLabels.HTTPrequestsIn}</CardTitle>
                        <HTTPtable rows={httpRequestsReceivedEntries} />
                    </Card>
                </StackItem>
            )}
            {httpRequestsSentEntries.length !== 0 && (
                <StackItem>
                    <Card isRounded>
                        <CardTitle>{ConnectionsDetailsLabels.HTTPrequestsOut}</CardTitle>
                        <HTTPtable rows={httpRequestsSentEntries} />
                    </Card>
                </StackItem>
            )}

            <StackItem>
                <Split hasGutter>
                    {tcpConnectionsInEntries.length !== 0 && (
                        <SplitItem isFilled>
                            <Card isFullHeight isRounded>
                                <CardTitle>{ConnectionsDetailsLabels.TCPconnectionsIn}</CardTitle>
                                <TCPTable rows={tcpConnectionsInEntries} />
                            </Card>
                        </SplitItem>
                    )}
                    {tcpConnectionsOutEntries.length !== 0 && (
                        <SplitItem isFilled>
                            <Card isFullHeight isRounded>
                                <CardTitle>{ConnectionsDetailsLabels.TCPconnectionsOut}</CardTitle>
                                <TCPTable rows={tcpConnectionsOutEntries} />
                            </Card>
                        </SplitItem>
                    )}
                </Split>
            </StackItem>
        </Stack>
    );
};

export default SitesConnections;

const TCPTable: FC<ConnectionProps> = function ({ rows }) {
    return (
        <TableComposable
            className="network-table"
            aria-label="network table"
            borders={false}
            variant="compact"
            isStriped
        >
            <Thead>
                <Tr>
                    <Th>{ConnectionsDetailsColumns.Name}</Th>
                    <Th>{ConnectionsDetailsColumns.Ip}</Th>
                    <Th>
                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                        {ConnectionsDetailsColumns.BytesIn}
                    </Th>
                    <Th>
                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                        {ConnectionsDetailsColumns.BytesOut}
                    </Th>
                </Tr>
            </Thead>
            {rows.map(([siteName, tcpConnectionsIn]) => (
                <Tbody key={siteName}>
                    <Tr>
                        <Td dataLabel={ConnectionsDetailsColumns.Name}>{`${siteName}`}</Td>
                        <Td dataLabel={ConnectionsDetailsColumns.Ip}>{`${
                            tcpConnectionsIn.id.split('@')[0]
                        }`}</Td>
                        <Td dataLabel={ConnectionsDetailsColumns.BytesIn}>{`${formatBytes(
                            tcpConnectionsIn.bytes_in,
                        )}`}</Td>
                        <Td dataLabel={ConnectionsDetailsColumns.BytesOut}>{`${formatBytes(
                            tcpConnectionsIn.bytes_out,
                        )}`}</Td>
                    </Tr>
                </Tbody>
            ))}
        </TableComposable>
    );
};

const HTTPtable: FC<ConnectionProps> = function ({ rows }) {
    return (
        <TableComposable
            className="network-table"
            aria-label="network table"
            borders={false}
            variant="compact"
            isStriped
        >
            <Thead>
                <Tr>
                    <Th>{ConnectionsDetailsColumns.Name}</Th>
                    <Th>{ConnectionsDetailsColumns.Requests}</Th>
                    <Th>{ConnectionsDetailsColumns.MaxLatency}</Th>
                    <Th>
                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                        {ConnectionsDetailsColumns.BytesIn}
                    </Th>
                    <Th>
                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                        {ConnectionsDetailsColumns.BytesOut}
                    </Th>
                </Tr>
            </Thead>
            {rows.map(([siteName, requestReceived]) => (
                <Tbody key={siteName}>
                    <Tr>
                        <Td dataLabel={ConnectionsDetailsColumns.Name}>{`${siteName}`}</Td>
                        <Td dataLabel={ConnectionsDetailsColumns.Requests}>
                            {`${requestReceived.requests}`}
                        </Td>
                        <Td dataLabel={ConnectionsDetailsColumns.MaxLatency}>
                            {`${formatTime(requestReceived.latency_max, {
                                startSize: 'ms',
                            })}`}
                        </Td>
                        <Td dataLabel={ConnectionsDetailsColumns.BytesIn}>
                            {`${formatBytes(requestReceived.bytes_in)}`}
                        </Td>
                        <Td dataLabel={ConnectionsDetailsColumns.BytesOut}>
                            {`${formatBytes(requestReceived.bytes_out)}`}
                        </Td>
                    </Tr>
                </Tbody>
            ))}
        </TableComposable>
    );
};
