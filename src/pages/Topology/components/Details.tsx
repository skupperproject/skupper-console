import React, { FC, useState } from 'react';

import {
    Checkbox,
    Label,
    Panel,
    TextContent,
    Title,
    TitleSizes,
    Tooltip,
} from '@patternfly/react-core';
import { TableComposable, TableText, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { formatBytes } from '@core/utils/formatBytes';
import { ConnectionsColumns, ConnectionsLabels } from '@pages/Sites/components/Traffic.enum';

import { colors } from '../Topology.constant';
import { TopologyDetailsProps, TrafficProps } from '../Topology.interfaces';

const TopologyDetails: FC<TopologyDetailsProps> = function ({
    name,
    link,
    tcpConnectionsOutEntries,
    tcpConnectionsInEntries,
}) {
    const [checkBoxSelectedSent, setCheckBoxSelectedStatusSent] = useState<Record<
        string,
        boolean
    > | null>(null);
    const [checkBoxSelectedReceived, setCheckBoxSelectedStatusReceived] = useState<Record<
        string,
        boolean
    > | null>(null);

    const tcpConnectionsOutEntriesChartData = tcpConnectionsOutEntries.map(
        ({ identity, destinationId, destinationName, sourceOctetRate }) => ({
            identity,
            targetIdentity: destinationId,
            name: destinationName,
            value: sourceOctetRate || 0,
            show: !checkBoxSelectedSent || checkBoxSelectedSent[identity],
        }),
    );

    const tcpConnectionsInEntriesChartData = tcpConnectionsInEntries.map(
        ({ identity, sourceId, sourceName, sourceOctetRate }) => ({
            identity,
            targetIdentity: sourceId,
            name: sourceName,
            value: sourceOctetRate || 0,
            show: !checkBoxSelectedReceived || checkBoxSelectedReceived[identity],
        }),
    );

    function handleSelectedSent(status: Record<string, boolean>) {
        setCheckBoxSelectedStatusSent(status);
    }

    function handleSelectedReceived(status: Record<string, boolean>) {
        setCheckBoxSelectedStatusReceived(status);
    }

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
                                <TrafficTable
                                    link={link}
                                    data={tcpConnectionsOutEntriesChartData}
                                    onSelected={handleSelectedSent}
                                />
                            </>
                        )}
                        {!!tcpConnectionsInEntries.length && (
                            <>
                                <Label color="purple">{ConnectionsLabels.TCPConnectionsIn}</Label>
                                <TrafficChart data={tcpConnectionsInEntriesChartData} />
                                <TrafficTable
                                    link={link}
                                    data={tcpConnectionsInEntriesChartData}
                                    onSelected={handleSelectedReceived}
                                />
                            </>
                        )}
                    </>
                )}
            </TextContent>
        </Panel>
    );
};

export default TopologyDetails;

const TrafficChart: FC<TrafficProps> = function ({ data }) {
    return (
        <RealTimeLineChart
            data={data}
            options={{
                formatter: formatBytes,
                colorScale: data.map(({ show }, index) =>
                    show ? colors[index % data.length] : 'transparent',
                ),
                height: 200,
                padding: {
                    left: 75,
                    right: 20,
                    top: 20,
                    bottom: 40,
                },
            }}
        />
    );
};

const TrafficTable: FC<TrafficProps> = function ({ data, onSelected, link }) {
    const [status, setIsChecked] = useState<Record<string, boolean>>(
        data.reduce((acc, row) => {
            acc[row.identity] = true;

            return acc;
        }, {} as Record<string, boolean>),
    );

    const handleChange = (checked: boolean, event: React.FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const newStatus = { ...status, [target.id]: checked };

        setIsChecked(newStatus);

        if (onSelected) {
            onSelected(newStatus);
        }
    };

    return (
        <TableComposable variant="compact" isStickyHeader borders={false}>
            <Thead>
                <Tr>
                    <Th />
                    <Th>{ConnectionsColumns.Name}</Th>
                    <Th>{ConnectionsColumns.BytesOut}</Th>
                </Tr>
            </Thead>
            <Tbody>
                {data.map(({ identity, targetIdentity, name, value }) => (
                    <Tr key={identity}>
                        <Td width={10}>
                            <Checkbox
                                isChecked={status[identity]}
                                onChange={handleChange}
                                id={identity}
                            />
                        </Td>
                        <Td>
                            <Link to={`${link}/${targetIdentity}`}>
                                <TableText wrapModifier="truncate">{name} </TableText>
                            </Link>
                        </Td>
                        <Td width={30}>{`${formatBytes(value)}`}</Td>
                    </Tr>
                ))}
            </Tbody>
        </TableComposable>
    );
};
