import React, { FC } from 'react';

import { Card, CardTitle, Stack, StackItem } from '@patternfly/react-core';
import { LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';

import { SitesRoutesPaths } from '../Sites.enum';
import { ConnectionsColumns, ConnectionsLabels, HTTPConnectionsColumns } from './Traffic.enum';
import { ConnectionPropsTCP, ConnectionPropsHTTP, ConnectionsProps } from './Traffic.interfaces';

const Connections: FC<ConnectionsProps> = function ({ siteName, httpRequests, tcpRequests }) {
    return (
        <Stack hasGutter>
            {!!tcpRequests.length && (
                <StackItem>
                    <Card isFullHeight isRounded>
                        <CardTitle>{ConnectionsLabels.TCPprotocol}</CardTitle>
                        <TCPTable rows={tcpRequests} siteName={siteName} />
                    </Card>
                </StackItem>
            )}

            {!!httpRequests.length && (
                <StackItem>
                    <Card isRounded>
                        <CardTitle>{ConnectionsLabels.HTTPprotocol}</CardTitle>
                        <HTTPtable rows={httpRequests} siteName={siteName} />
                    </Card>
                </StackItem>
            )}
        </Stack>
    );
};

export default Connections;

const TCPTable: FC<ConnectionPropsTCP> = function ({ rows, siteName }) {
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

            {rows.map(({ id, name, byteIn, byteOut }) => (
                <Tbody key={id}>
                    <Tr>
                        <Td dataLabel={ConnectionsColumns.Name}>
                            <ResourceIcon type="site" />
                            {siteName} {' -> '}
                            <Link to={`${SitesRoutesPaths.Details}/${id}`}>{name}</Link>
                        </Td>
                        <Td dataLabel={ConnectionsColumns.BytesIn}>
                            {byteIn ? `${formatBytes(byteIn)}` : '-'}
                        </Td>
                        <Td dataLabel={ConnectionsColumns.BytesOut}>
                            {byteOut ? `${formatBytes(byteOut)}` : '-'}
                        </Td>
                    </Tr>
                </Tbody>
            ))}
        </TableComposable>
    );
};

const HTTPtable: FC<ConnectionPropsHTTP> = function ({ rows, siteName }) {
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
                    <Th>{HTTPConnectionsColumns.Name}</Th>
                    <Th>{HTTPConnectionsColumns.RequestsCountSent}</Th>
                    <Th>{HTTPConnectionsColumns.RequestsCountReceived}</Th>
                    <Th>{HTTPConnectionsColumns.MaxLatencySent}</Th>
                    <Th>{HTTPConnectionsColumns.MaxLatencyReceived}</Th>
                    <Th>
                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                        {HTTPConnectionsColumns.BytesIn}
                    </Th>
                    <Th>
                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                        {HTTPConnectionsColumns.BytesOut}
                    </Th>
                </Tr>
            </Thead>
            {rows.map((row) => (
                <Tbody key={row.id}>
                    <Tr>
                        <Td dataLabel={HTTPConnectionsColumns.Name}>
                            <ResourceIcon type="site" />
                            {siteName} {' -> '}
                            <Link to={`${SitesRoutesPaths.Details}/${row.id}`}>{row.name}</Link>
                        </Td>
                        <Td dataLabel={HTTPConnectionsColumns.RequestsCountSent}>
                            {`${row.requestsCountSent || '-'}`}
                        </Td>
                        <Td dataLabel={HTTPConnectionsColumns.RequestsCountReceived}>
                            {`${row.requestsCountReceived || '-'}`}
                        </Td>
                        <Td dataLabel={HTTPConnectionsColumns.MaxLatencySent}>
                            {row.maxLatencySent
                                ? `${formatTime(row.maxLatencySent, {
                                      startSize: 'ms',
                                  })}`
                                : '-'}
                        </Td>
                        <Td dataLabel={HTTPConnectionsColumns.MaxLatencyReceived}>
                            {row.maxLatencyReceived
                                ? `${formatTime(row.maxLatencyReceived, {
                                      startSize: 'ms',
                                  })}`
                                : '-'}
                        </Td>
                        <Td dataLabel={HTTPConnectionsColumns.BytesIn}>
                            {row.byteIn ? `${formatBytes(row.byteIn)}` : '-'}
                        </Td>
                        <Td dataLabel={HTTPConnectionsColumns.BytesOut}>
                            {row.byteOut ? `${formatBytes(row.byteOut)}` : '-'}
                        </Td>
                    </Tr>
                </Tbody>
            ))}
        </TableComposable>
    );
};
