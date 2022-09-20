import React, { FC } from 'react';

import { Label, Panel, TextContent, Title, TitleSizes, Tooltip } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { formatBytes } from '@core/utils/formatBytes';
import { ConnectionsColumns, ConnectionsLabels } from '@pages/Sites/components/Traffic.enum';
import { FlowAggregatesResponse } from 'API/REST.interfaces';

interface TopologyDetailsProps {
    name: string;
    tcpConnectionsOutEntries: FlowAggregatesResponse[];
    tcpConnectionsInEntries: FlowAggregatesResponse[];
}

const TopologyDetails: FC<TopologyDetailsProps> = function ({
    name,
    tcpConnectionsOutEntries,
    tcpConnectionsInEntries,
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
                    {name}
                </Title>
            </Tooltip>
            <TextContent className="pf-u-mt-md">
                {(!!tcpConnectionsOutEntries.length || !!tcpConnectionsInEntries.length) && (
                    <>
                        {!!tcpConnectionsOutEntries.length && (
                            <>
                                <Label color="green">{ConnectionsLabels.TCPConnectionsOut}</Label>

                                <TableComposable variant="compact" isStickyHeader borders={false}>
                                    <Thead>
                                        <Tr>
                                            <Th>{ConnectionsColumns.Name}</Th>
                                            <Th>{ConnectionsColumns.BytesOut}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {tcpConnectionsOutEntries.map((info) => (
                                            <Tr key={info.identity}>
                                                <Td>{`${info.identity}`}</Td>
                                                <Td>{`${formatBytes(info.sourceOctets)}`}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </TableComposable>
                            </>
                        )}
                        {!!tcpConnectionsInEntries.length && (
                            <>
                                <Label color="purple">{ConnectionsLabels.TCPConnectionsIn}</Label>
                                <TableComposable variant="compact" isStickyHeader borders={false}>
                                    <Thead>
                                        <Tr>
                                            <Th>{ConnectionsColumns.Name}</Th>
                                            <Th>{ConnectionsColumns.BytesOut}</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {tcpConnectionsInEntries.map((info) => (
                                            <Tr key={info.identity}>
                                                <Td>{`${info.identity}`}</Td>
                                                <Td>{`${formatBytes(info.destinationOctets)}`}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </TableComposable>
                            </>
                        )}
                    </>
                )}
            </TextContent>
        </Panel>
    );
};

export default TopologyDetails;
