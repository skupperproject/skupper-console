import React, { FC, useEffect, useState } from 'react';

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
        ({ identity, destinationId, sourceOctets }) => ({
            identity,
            name: destinationId,
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
                                <TrafficChart
                                    data={tcpConnectionsOutEntriesChartData.map((data) => {
                                        if (!checkBoxSelectedSent) {
                                            return data;
                                        }
                                        if (checkBoxSelectedSent[data.identity]) {
                                            return data;
                                        }

                                        return { ...data, value: 0 };
                                    })}
                                />
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
                                <TrafficChart
                                    data={tcpConnectionsInEntriesChartData.map((data) => {
                                        if (!checkBoxSelectedReceived) {
                                            return data;
                                        }
                                        if (checkBoxSelectedReceived[data.identity]) {
                                            return data;
                                        }

                                        return { ...data, value: 0 };
                                    })}
                                />
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
                colorScale: colors,
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
    const [status, setIsChecked] = useState<Record<string, boolean>>({});

    const handleChange = (checked: boolean, event: React.FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const newStatus = { ...status, [target.id]: checked };

        setIsChecked(newStatus);

        if (onSelected) {
            onSelected(newStatus);
        }
    };

    useEffect(() => {
        const newStatus = data.reduce((acc, row) => {
            acc[row.identity] = true;

            return acc;
        }, {} as Record<string, boolean>);

        setIsChecked(newStatus);

        if (onSelected) {
            onSelected(newStatus);
        }
    }, []);

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
                {data.map(({ identity, name, value }) => (
                    <Tr key={identity}>
                        <Td width={10}>
                            <Checkbox
                                isChecked={status[identity]}
                                onChange={handleChange}
                                id={identity}
                            />
                        </Td>
                        <Td>
                            <Link to={`${link}/${name}`}>
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
