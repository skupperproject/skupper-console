import React, { FC } from 'react';

import { Card, CardTitle, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import EmptyData from '@core/components/EmptyData';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { SitesRoutesPaths } from '@pages/Sites/sites.enum';

import { TrafficColumns, TrafficLabels } from './Traffic.enum';
import { TrafficTablesProps } from './Traffic.interfaces';

const TrafficTables: FC<TrafficTablesProps> = function ({
    httpConnectionsIn,
    httpConnectionsOut,
    tcpConnectionsIn,
    tcpConnectionsOut,
}) {
    return (
        <Stack hasGutter>
            {!!(httpConnectionsIn.length || httpConnectionsOut.length) && (
                <StackItem>
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <Card>
                                <CardTitle>{TrafficLabels.HTTPrequestsIn}</CardTitle>
                                {httpConnectionsIn.length === 0 ? (
                                    <EmptyData />
                                ) : (
                                    <TableComposable
                                        className="network-table"
                                        aria-label="network table"
                                        borders={false}
                                        variant="compact"
                                        isStriped
                                    >
                                        <Thead>
                                            <Tr>
                                                <Th>{TrafficColumns.SiteName}</Th>
                                                <Th>{TrafficColumns.ServiceName}</Th>
                                                <Th>{TrafficColumns.Requests}</Th>
                                                <Th>{TrafficColumns.MaxLatency}</Th>
                                                <Th>{TrafficColumns.Bytes}</Th>
                                            </Tr>
                                        </Thead>
                                        {httpConnectionsIn.map(
                                            ({
                                                id,
                                                client,
                                                bytes_out,
                                                requests,
                                                latency_max,
                                                site,
                                            }) => (
                                                <Tbody key={`${id}${client}`}>
                                                    <Tr>
                                                        <Td dataLabel={TrafficColumns.SiteName}>
                                                            <Link
                                                                to={`${SitesRoutesPaths.Details}/${site.site_id}`}
                                                            >
                                                                {' '}
                                                                <ResourceIcon type="site" />
                                                                {client.split('/')[0]}
                                                            </Link>
                                                        </Td>
                                                        <Td dataLabel={TrafficColumns.ServiceName}>
                                                            <ResourceIcon type="service" />
                                                            {client.split('/')[1]}
                                                        </Td>
                                                        <Td dataLabel={TrafficColumns.Requests}>
                                                            {requests}
                                                        </Td>
                                                        <Td dataLabel={TrafficColumns.MaxLatency}>
                                                            {`${formatTime(latency_max, {
                                                                startSize: 'ms',
                                                            })}`}
                                                        </Td>
                                                        <Td dataLabel={TrafficColumns.Bytes}>
                                                            {`${formatBytes(bytes_out)}`}
                                                        </Td>
                                                    </Tr>
                                                </Tbody>
                                            ),
                                        )}
                                    </TableComposable>
                                )}
                            </Card>
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <Card>
                                <CardTitle>{TrafficLabels.HTTPrequestsOut}</CardTitle>
                                {httpConnectionsOut.length === 0 ? (
                                    <EmptyData />
                                ) : (
                                    <TableComposable
                                        className="network-table"
                                        aria-label="network table"
                                        borders={false}
                                        variant="compact"
                                        isStriped
                                    >
                                        <Thead>
                                            <Tr>
                                                <Th>{TrafficColumns.SiteName}</Th>
                                                <Th>{TrafficColumns.ServiceName}</Th>
                                                <Th>{TrafficColumns.Requests}</Th>
                                                <Th>{TrafficColumns.MaxLatency}</Th>
                                                <Th>{TrafficColumns.Bytes}</Th>
                                            </Tr>
                                        </Thead>
                                        {httpConnectionsOut.map(
                                            ({
                                                id,
                                                client,
                                                bytes_out,
                                                requests,
                                                latency_max,
                                                site,
                                            }) => (
                                                <Tbody key={`${id}${client}`}>
                                                    <Tr>
                                                        <Td dataLabel={TrafficColumns.SiteName}>
                                                            <ResourceIcon type="site" />
                                                            <Link
                                                                to={`${SitesRoutesPaths.Details}/${site.site_id}`}
                                                            >
                                                                {client.split('/')[0]}
                                                            </Link>
                                                        </Td>
                                                        <Td dataLabel={TrafficColumns.ServiceName}>
                                                            <ResourceIcon type="service" />
                                                            {client.split('/')[1]}
                                                        </Td>
                                                        <Td dataLabel={TrafficColumns.Requests}>
                                                            {requests}
                                                        </Td>
                                                        <Td dataLabel={TrafficColumns.MaxLatency}>
                                                            {`${formatTime(latency_max, {
                                                                startSize: 'ms',
                                                            })}`}
                                                        </Td>
                                                        <Td dataLabel={TrafficColumns.Bytes}>
                                                            {`${formatBytes(bytes_out)}`}
                                                        </Td>
                                                    </Tr>
                                                </Tbody>
                                            ),
                                        )}
                                    </TableComposable>
                                )}
                            </Card>
                        </SplitItem>
                    </Split>
                </StackItem>
            )}

            {!!(tcpConnectionsIn.length || tcpConnectionsOut.length) && (
                <StackItem>
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <Card>
                                <CardTitle>{TrafficLabels.TCPconnectionsIn}</CardTitle>
                                {tcpConnectionsIn.length === 0 ? (
                                    <EmptyData />
                                ) : (
                                    <TableComposable
                                        className="network-table"
                                        aria-label="network table"
                                        borders={false}
                                        variant="compact"
                                        isStriped
                                    >
                                        <Thead>
                                            <Tr>
                                                <Th>{TrafficColumns.SiteName}</Th>
                                                <Th>{TrafficColumns.ServiceName}</Th>
                                                <Th>{TrafficColumns.Bytes}</Th>
                                            </Tr>
                                        </Thead>
                                        {tcpConnectionsIn.map(({ id, client, bytes_out, site }) => (
                                            <Tbody key={`${id}${client}`}>
                                                <Tr>
                                                    <Td dataLabel={TrafficColumns.SiteName}>
                                                        <ResourceIcon type="site" />
                                                        <Link
                                                            to={`${SitesRoutesPaths.Details}/${site.site_id}`}
                                                        >
                                                            {client.split('/')[0]}
                                                        </Link>{' '}
                                                        {`(${id.split('@')[0].split(':')[0]})`}
                                                    </Td>
                                                    <Td dataLabel={TrafficColumns.ServiceName}>
                                                        <ResourceIcon type="service" />
                                                        {client.split('/')[1]}
                                                    </Td>
                                                    <Td
                                                        dataLabel={TrafficColumns.Bytes}
                                                    >{`${formatBytes(bytes_out)}`}</Td>
                                                </Tr>
                                            </Tbody>
                                        ))}
                                    </TableComposable>
                                )}
                            </Card>
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <Card>
                                <CardTitle>{TrafficLabels.TCPconnectionsOut}</CardTitle>
                                {tcpConnectionsOut.length === 0 ? (
                                    <EmptyData />
                                ) : (
                                    <TableComposable
                                        className="network-table"
                                        aria-label="network table"
                                        borders={false}
                                        variant="compact"
                                        isStriped
                                    >
                                        <Thead>
                                            <Tr>
                                                <Th>{TrafficColumns.SiteName}</Th>
                                                <Th>{TrafficColumns.ServiceName}</Th>
                                                <Th>{TrafficColumns.Bytes}</Th>
                                            </Tr>
                                        </Thead>
                                        {tcpConnectionsOut.map(
                                            ({ id, client, bytes_out, site }) => (
                                                <Tbody key={`${id}${client}`}>
                                                    <Tr>
                                                        <Td dataLabel={TrafficColumns.SiteName}>
                                                            <ResourceIcon type="site" />
                                                            <Link
                                                                to={`${SitesRoutesPaths.Details}/${site.site_id}`}
                                                            >
                                                                {client.split('/')[0]}
                                                            </Link>
                                                        </Td>
                                                        <Td dataLabel={TrafficColumns.ServiceName}>
                                                            <ResourceIcon type="service" />
                                                            {client.split('/')[1]}
                                                        </Td>
                                                        <Td
                                                            dataLabel={TrafficColumns.Bytes}
                                                        >{`${formatBytes(bytes_out)}`}</Td>
                                                    </Tr>
                                                </Tbody>
                                            ),
                                        )}
                                    </TableComposable>
                                )}
                            </Card>
                        </SplitItem>
                    </Split>
                </StackItem>
            )}
        </Stack>
    );
};

export default TrafficTables;
