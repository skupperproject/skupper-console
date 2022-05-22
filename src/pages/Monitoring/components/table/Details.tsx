import React from 'react';

import {
    InnerScrollContainer,
    TableComposable,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from '@patternfly/react-table';

import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';

import { ConnectionColumns } from '../../Monitoring.enum';
import { Connection } from '../../Monitoring.interfaces';

const ConnectionDetailsTable = function ({
    connection,
    connectorName,
    listenerName,
}: {
    connection: Connection[];
    connectorName: string;
    listenerName?: string;
}) {
    return (
        <InnerScrollContainer>
            <TableComposable
                isStickyHeader
                className="flows-table"
                aria-label="flows table"
                borders
                variant="compact"
                gridBreakPoint=""
                isStriped
            >
                <Thead hasNestedHeader>
                    <Tr>
                        <Th hasRightBorder>{ConnectionColumns.ConnectionStatus}</Th>
                        <Th hasRightBorder colSpan={2}>
                            {connectorName}
                        </Th>

                        <Th hasRightBorder colSpan={2}>
                            {listenerName}
                        </Th>
                    </Tr>
                    <Tr>
                        <Th hasRightBorder />
                        <Th hasRightBorder isSubheader>
                            {ConnectionColumns.Traffic}
                        </Th>
                        <Th hasRightBorder isSubheader>
                            {ConnectionColumns.Latency}
                        </Th>
                        <Th hasRightBorder isSubheader>
                            {ConnectionColumns.TrafficIn}
                        </Th>
                        <Th hasRightBorder isSubheader>
                            {ConnectionColumns.LatencyIn}
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {connection.map(({ id, octets, latency, latencyIn, endTime, octetsIn }) => (
                        <Tr key={id}>
                            <Th hasRightBorder dataLabel={ConnectionColumns.ConnectionStatus}>
                                {endTime ? 'Closed' : 'Open'}
                            </Th>
                            <Td
                                className="pf-u-text-align-right"
                                dataLabel={ConnectionColumns.Traffic}
                            >
                                {formatBytes(octets)}
                            </Td>
                            <Th
                                hasRightBorder
                                className="pf-u-text-align-right"
                                dataLabel={ConnectionColumns.Latency}
                            >
                                {formatTime(latency)}
                            </Th>

                            <Td
                                className="pf-u-text-align-right"
                                dataLabel={ConnectionColumns.TrafficIn}
                            >
                                {formatBytes(octetsIn)}
                            </Td>
                            <Td
                                className="pf-u-text-align-right"
                                dataLabel={ConnectionColumns.LatencyIn}
                            >
                                {formatTime(latencyIn)}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </TableComposable>
        </InnerScrollContainer>
    );
};

export default ConnectionDetailsTable;
