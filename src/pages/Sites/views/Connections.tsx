import React, { FC } from 'react';

import { Card, CardTitle, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';

import { SitesConnectionsColumns, SitesConnectionsLabels } from './Connections.enum';
import { SitesConnectionsProps, SitesConnectionProps } from './Connections.interfaces';

const SitesConnections: FC<SitesConnectionsProps> = function ({
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
                        <CardTitle>{SitesConnectionsLabels.HTTPrequestsIn}</CardTitle>
                        <HTTPtable rows={httpRequestsReceivedEntries} />
                    </Card>
                </StackItem>
            )}
            {httpRequestsSentEntries.length !== 0 && (
                <StackItem>
                    <Card isRounded>
                        <CardTitle>{SitesConnectionsLabels.HTTPrequestsOut}</CardTitle>
                        <HTTPtable rows={httpRequestsSentEntries} />
                    </Card>
                </StackItem>
            )}

            <StackItem>
                <Split hasGutter>
                    {tcpConnectionsInEntries.length !== 0 && (
                        <SplitItem isFilled>
                            <Card isFullHeight isRounded>
                                <CardTitle>{SitesConnectionsLabels.TCPconnectionsIn}</CardTitle>
                                <TCPTable rows={tcpConnectionsInEntries} />
                            </Card>
                        </SplitItem>
                    )}
                    {tcpConnectionsOutEntries.length !== 0 && (
                        <SplitItem isFilled>
                            <Card isFullHeight isRounded>
                                <CardTitle>{SitesConnectionsLabels.TCPconnectionsOut}</CardTitle>
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

const TCPTable: FC<SitesConnectionProps> = function ({ rows }) {
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
                    <Th>{SitesConnectionsColumns.Name}</Th>
                    <Th>{SitesConnectionsColumns.Ip}</Th>
                    <Th>
                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                        {SitesConnectionsColumns.BytesIn}
                    </Th>
                    <Th>
                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                        {SitesConnectionsColumns.BytesOut}
                    </Th>
                </Tr>
            </Thead>
            {rows.map(([siteName, tcpConnectionsIn]) => (
                <Tbody key={siteName}>
                    <Tr>
                        <Td dataLabel={SitesConnectionsColumns.Name}>{`${siteName}`}</Td>
                        <Td dataLabel={SitesConnectionsColumns.Ip}>{`${
                            tcpConnectionsIn.id.split('@')[0]
                        }`}</Td>
                        <Td dataLabel={SitesConnectionsColumns.BytesIn}>{`${formatBytes(
                            tcpConnectionsIn.bytes_in,
                        )}`}</Td>
                        <Td dataLabel={SitesConnectionsColumns.BytesOut}>{`${formatBytes(
                            tcpConnectionsIn.bytes_out,
                        )}`}</Td>
                    </Tr>
                </Tbody>
            ))}
        </TableComposable>
    );
};

const HTTPtable: FC<SitesConnectionProps> = function ({ rows }) {
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
                    <Th>{SitesConnectionsColumns.Name}</Th>
                    <Th>{SitesConnectionsColumns.Requests}</Th>
                    <Th>{SitesConnectionsColumns.MaxLatency}</Th>
                    <Th>
                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                        {SitesConnectionsColumns.BytesIn}
                    </Th>
                    <Th>
                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                        {SitesConnectionsColumns.BytesOut}
                    </Th>
                </Tr>
            </Thead>
            {rows.map(([siteName, requestReceived]) => (
                <Tbody key={siteName}>
                    <Tr>
                        <Td dataLabel={SitesConnectionsColumns.Name}>{`${siteName}`}</Td>
                        <Td dataLabel={SitesConnectionsColumns.Requests}>
                            {`${requestReceived.requests}`}
                        </Td>
                        <Td dataLabel={SitesConnectionsColumns.MaxLatency}>
                            {`${formatTime(requestReceived.latency_max, {
                                startSize: 'ms',
                            })}`}
                        </Td>
                        <Td dataLabel={SitesConnectionsColumns.BytesIn}>
                            {`${formatBytes(requestReceived.bytes_in)}`}
                        </Td>
                        <Td dataLabel={SitesConnectionsColumns.BytesOut}>
                            {`${formatBytes(requestReceived.bytes_out)}`}
                        </Td>
                    </Tr>
                </Tbody>
            ))}
        </TableComposable>
    );
};
