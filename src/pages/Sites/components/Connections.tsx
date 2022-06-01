import React, { FC } from 'react';

import { Card, CardTitle, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import EmptyData from '@core/components/EmptyData';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';

import { ConnectionsColumns, ConnectionsLabels } from './Connections.enum';
import { ConnectionsProps, ConnectionProps } from './Connections.interfaces';

const Connections: FC<ConnectionsProps> = function ({
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
            {!!(tcpConnectionsInEntries.length || tcpConnectionsOutEntries.length) && (
                <StackItem>
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <Card isFullHeight isRounded>
                                <CardTitle>{ConnectionsLabels.TCPconnectionsIn}</CardTitle>
                                {tcpConnectionsInEntries.length !== 0 ? (
                                    <TCPTable rows={tcpConnectionsInEntries} />
                                ) : (
                                    <EmptyData />
                                )}
                            </Card>
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <Card isFullHeight isRounded>
                                <CardTitle>{ConnectionsLabels.TCPconnectionsOut}</CardTitle>
                                {tcpConnectionsOutEntries.length !== 0 ? (
                                    <TCPTable rows={tcpConnectionsOutEntries} />
                                ) : (
                                    <EmptyData />
                                )}
                            </Card>
                        </SplitItem>
                    </Split>
                </StackItem>
            )}

            {!!(httpRequestsReceivedEntries.length || httpRequestsSentEntries.length) && (
                <StackItem>
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <Card isRounded>
                                <CardTitle>{ConnectionsLabels.HTTPrequestsIn}</CardTitle>
                                {httpRequestsReceivedEntries.length !== 0 ? (
                                    <HTTPtable rows={httpRequestsReceivedEntries} />
                                ) : (
                                    <EmptyData />
                                )}
                            </Card>
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <Card isRounded>
                                <CardTitle>{ConnectionsLabels.HTTPrequestsOut}</CardTitle>
                                {httpRequestsSentEntries.length !== 0 ? (
                                    <HTTPtable rows={httpRequestsSentEntries} />
                                ) : (
                                    <EmptyData />
                                )}
                            </Card>
                        </SplitItem>
                    </Split>
                </StackItem>
            )}
        </Stack>
    );
};

export default Connections;

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
                    <Th>{ConnectionsColumns.Name}</Th>
                    <Th>{ConnectionsColumns.Ip}</Th>
                    <Th>
                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                        {ConnectionsColumns.BytesIn}
                    </Th>
                    <Th>
                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                        {ConnectionsColumns.BytesOut}
                    </Th>
                </Tr>
            </Thead>
            {rows.map(([siteName, tcpConnectionsIn]) => (
                <Tbody key={siteName}>
                    <Tr>
                        <Td dataLabel={ConnectionsColumns.Name}>{`${siteName}`}</Td>
                        <Td dataLabel={ConnectionsColumns.Ip}>{`${
                            tcpConnectionsIn.id.split('@')[0]
                        }`}</Td>
                        <Td dataLabel={ConnectionsColumns.BytesIn}>{`${formatBytes(
                            tcpConnectionsIn.bytes_in,
                        )}`}</Td>
                        <Td dataLabel={ConnectionsColumns.BytesOut}>{`${formatBytes(
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
                    <Th>{ConnectionsColumns.Name}</Th>
                    <Th>{ConnectionsColumns.Requests}</Th>
                    <Th>{ConnectionsColumns.MaxLatency}</Th>
                    <Th>
                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                        {ConnectionsColumns.BytesIn}
                    </Th>
                    <Th>
                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                        {ConnectionsColumns.BytesOut}
                    </Th>
                </Tr>
            </Thead>
            {rows.map(([siteName, requestReceived]) => (
                <Tbody key={siteName}>
                    <Tr>
                        <Td dataLabel={ConnectionsColumns.Name}>{`${siteName}`}</Td>
                        <Td dataLabel={ConnectionsColumns.Requests}>
                            {`${requestReceived.requests}`}
                        </Td>
                        <Td dataLabel={ConnectionsColumns.MaxLatency}>
                            {`${formatTime(requestReceived.latency_max, {
                                startSize: 'ms',
                            })}`}
                        </Td>
                        <Td dataLabel={ConnectionsColumns.BytesIn}>
                            {`${formatBytes(requestReceived.bytes_in)}`}
                        </Td>
                        <Td dataLabel={ConnectionsColumns.BytesOut}>
                            {`${formatBytes(requestReceived.bytes_out)}`}
                        </Td>
                    </Tr>
                </Tbody>
            ))}
        </TableComposable>
    );
};
