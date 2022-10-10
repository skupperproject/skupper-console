import React, { FC } from 'react';

import { Label, Panel, TextContent, Title, TitleSizes, Tooltip } from '@patternfly/react-core';
import { TableComposable, TableText, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { formatBytes } from '@core/utils/formatBytes';
import { ConnectionsColumns, ConnectionsLabels } from '@pages/Sites/components/Traffic.enum';
import { FlowAggregatesResponse } from 'API/REST.interfaces';

import { colors } from '../Topology.constant';

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
    const tcpConnectionsOutEntriesChartData = tcpConnectionsOutEntries.map(
        ({ identity, sourceId, sourceOctets }) => ({
            identity,
            name: sourceId,
            value: sourceOctets,
        }),
    );

    const tcpConnectionsInEntriesChartData = tcpConnectionsInEntries.map(
        ({ identity, sourceId, sourceOctets }) => ({
            identity,
            name: sourceId,
            value: sourceOctets,
        }),
    );

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
                                <TrafficChart data={tcpConnectionsOutEntriesChartData} />
                                <TrafficTable data={tcpConnectionsOutEntriesChartData} />
                            </>
                        )}
                        {!!tcpConnectionsInEntries.length && (
                            <>
                                <Label color="purple">{ConnectionsLabels.TCPConnectionsIn}</Label>
                                <TrafficChart data={tcpConnectionsInEntriesChartData} />
                                <TrafficTable data={tcpConnectionsInEntriesChartData} />
                            </>
                        )}
                    </>
                )}
            </TextContent>
        </Panel>
    );
};

export default TopologyDetails;

interface TrafficProps {
    data: { identity: string; name: string; value: number }[];
}

const TrafficChart: FC<TrafficProps> = function ({ data }) {
    return (
        <RealTimeLineChart
            data={data}
            options={{
                formatter: formatBytes,
                colorScale: colors,
                height: 200,
                padding: {
                    left: 70,
                    right: 20,
                    top: 20,
                    bottom: 40,
                },
            }}
        />
    );
};

const TrafficTable: FC<TrafficProps> = function ({ data }) {
    return (
        <TableComposable variant="compact" isStickyHeader borders={false}>
            <Thead>
                <Tr>
                    <Th>{ConnectionsColumns.Name}</Th>
                    <Th>{ConnectionsColumns.BytesOut}</Th>
                </Tr>
            </Thead>
            <Tbody>
                {data.map(({ identity, name, value }) => (
                    <Tr key={identity}>
                        <Td>
                            <TableText wrapModifier="truncate">{`${name}`} </TableText>
                        </Td>
                        <Td width={30}>{`${formatBytes(value)}`}</Td>
                    </Tr>
                ))}
            </Tbody>
        </TableComposable>
    );
};
