import React, { FC } from 'react';

import { Card, CardTitle, Stack, StackItem, Title } from '@patternfly/react-core';
import { LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';

import { SitesRoutesPaths } from '../Sites.enum';
import { ConnectionsColumns, ConnectionsLabels, HTTPRequestsColumns } from './Traffic.enum';
import { ConnectionPropsTCP, RequestPropsHTTP, ConnectionsProps } from './Traffic.interfaces';

const Connections: FC<ConnectionsProps> = function ({ siteName, httpRequests, tcpRequests }) {
    return (
        <Stack hasGutter>
            {!!tcpRequests.length && (
                <StackItem>
                    <Card isFullHeight isRounded>
                        <CardTitle>
                            <Title headingLevel="h2">{ConnectionsLabels.TCPprotocol}</Title>
                        </CardTitle>
                        <TCPTable rows={tcpRequests} siteName={siteName} />
                    </Card>
                </StackItem>
            )}

            {!!httpRequests.length && (
                <StackItem>
                    <Card isRounded>
                        <CardTitle>
                            <Title headingLevel="h2">{ConnectionsLabels.HTTPprotocol}</Title>
                        </CardTitle>
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

const HTTPtable: FC<RequestPropsHTTP> = function ({ rows, siteName }) {
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
                    <Th>{HTTPRequestsColumns.Name}</Th>
                    <Th>{HTTPRequestsColumns.RequestsCountSent}</Th>
                    <Th>{HTTPRequestsColumns.RequestsCountReceived}</Th>
                    <Th>{HTTPRequestsColumns.MaxLatencySent}</Th>
                    <Th>{HTTPRequestsColumns.MaxLatencyReceived}</Th>
                    <Th>
                        <LongArrowAltDownIcon color="var(--pf-global--palette--blue-200)" />{' '}
                        {HTTPRequestsColumns.BytesIn}
                    </Th>
                    <Th>
                        <LongArrowAltUpIcon color="var(--pf-global--palette--red-100)" />{' '}
                        {HTTPRequestsColumns.BytesOut}
                    </Th>
                </Tr>
            </Thead>
            {rows.map((row) => (
                <Tbody key={row.id}>
                    <Tr>
                        <Td dataLabel={HTTPRequestsColumns.Name}>
                            <ResourceIcon type="site" />
                            {siteName} {' -> '}
                            <Link to={`${SitesRoutesPaths.Details}/${row.id}`}>{row.name}</Link>
                        </Td>
                        <Td dataLabel={HTTPRequestsColumns.RequestsCountSent}>
                            {`${row.requestsCountSent || '-'}`}
                        </Td>
                        <Td dataLabel={HTTPRequestsColumns.RequestsCountReceived}>
                            {`${row.requestsCountReceived || '-'}`}
                        </Td>
                        <Td dataLabel={HTTPRequestsColumns.MaxLatencySent}>
                            {row.maxLatencySent
                                ? `${formatTime(row.maxLatencySent, {
                                      startSize: 'ms',
                                  })}`
                                : '-'}
                        </Td>
                        <Td dataLabel={HTTPRequestsColumns.MaxLatencyReceived}>
                            {row.maxLatencyReceived
                                ? `${formatTime(row.maxLatencyReceived, {
                                      startSize: 'ms',
                                  })}`
                                : '-'}
                        </Td>
                        <Td dataLabel={HTTPRequestsColumns.BytesIn}>
                            {row.byteIn ? `${formatBytes(row.byteIn)}` : '-'}
                        </Td>
                        <Td dataLabel={HTTPRequestsColumns.BytesOut}>
                            {row.byteOut ? `${formatBytes(row.byteOut)}` : '-'}
                        </Td>
                    </Tr>
                </Tbody>
            ))}
        </TableComposable>
    );
};
