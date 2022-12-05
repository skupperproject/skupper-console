import React, { FC, useState } from 'react';

import {
    Checkbox,
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Panel,
    Title,
    TitleSizes,
    Tooltip,
} from '@patternfly/react-core';

import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import RealTimeLineChart from '@core/components/RealTimeLineChart';
import SkTable from '@core/components/SkTable';
import { formatByteRate } from '@core/utils/formatBytes';

import { colors } from '../Topology.constant';
import { ConnectionsColumns, ConnectionsLabels } from '../Topology.enum';
import { TopologyDetailsProps, TrafficData, TrafficProps } from '../Topology.interfaces';

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

    const columnsTCPConnectionsOut = [
        {
            name: '',
            prop: '' as keyof TrafficData,
            callback: handleSelectedSent,
            component: 'checkboxCell',
            with: 10,
        },
        {
            name: ConnectionsColumns.Name,
            prop: 'name' as keyof TrafficData,
            component: 'nameLinkCell',
        },
        {
            name: ConnectionsColumns.ByteRate,
            prop: 'value' as keyof TrafficData,
            format: formatByteRate,
            width: 30,
        },
    ];

    const columnsTCPConnectionsIn = [
        {
            name: '',
            prop: '' as keyof TrafficData,
            callback: handleSelectedReceived,
            component: 'checkboxCell',
            width: 10,
        },
        {
            name: ConnectionsColumns.Name,
            prop: 'name' as keyof TrafficData,
            component: 'nameLinkCell',
        },
        {
            name: ConnectionsColumns.ByteRate,
            prop: 'value' as keyof TrafficData,
            format: formatByteRate,
            width: 30,
        },
    ];

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
            {(!!tcpConnectionsOutEntries.length || !!tcpConnectionsInEntries.length) && (
                <DescriptionList>
                    {!!tcpConnectionsOutEntries.length && (
                        <DescriptionListGroup>
                            <DescriptionListTerm>
                                {ConnectionsLabels.TCPConnectionsOut}
                            </DescriptionListTerm>
                            <DescriptionListDescription>
                                <TrafficChart data={tcpConnectionsOutEntriesChartData} />
                                <SkTable
                                    borders={false}
                                    isStriped={false}
                                    isPlain={true}
                                    columns={columnsTCPConnectionsOut}
                                    shouldSort={false}
                                    rows={tcpConnectionsOutEntriesChartData}
                                    components={{
                                        checkboxCell: TopologyCheckBoxCell,
                                        nameLinkCell: (props: LinkCellProps<TrafficData>) =>
                                            LinkCell({
                                                ...props,
                                                type: 'process',
                                                link: `${link}/${props.data.targetIdentity}`,
                                            }),
                                    }}
                                />
                            </DescriptionListDescription>
                        </DescriptionListGroup>
                    )}
                    {!!tcpConnectionsInEntries.length && (
                        <DescriptionListGroup>
                            <DescriptionListTerm>
                                {ConnectionsLabels.TCPConnectionsIn}
                            </DescriptionListTerm>
                            <DescriptionListDescription>
                                <TrafficChart data={tcpConnectionsInEntriesChartData} />
                                <SkTable
                                    borders={false}
                                    isStriped={false}
                                    isPlain={true}
                                    shouldSort={false}
                                    columns={columnsTCPConnectionsIn}
                                    rows={tcpConnectionsInEntriesChartData}
                                    components={{
                                        checkboxCell: TopologyCheckBoxCell,
                                        nameLinkCell: (props: LinkCellProps<TrafficData>) =>
                                            LinkCell({
                                                ...props,
                                                link: `${link}/${props.data.targetIdentity}`,
                                            }),
                                    }}
                                />
                            </DescriptionListDescription>
                        </DescriptionListGroup>
                    )}
                </DescriptionList>
            )}
        </Panel>
    );
};

export default TopologyDetails;

const TrafficChart: FC<TrafficProps> = function ({ data }) {
    return (
        <RealTimeLineChart
            data={data}
            options={{
                formatter: formatByteRate,
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

interface TopologyCheckBoxCellProps {
    data: TrafficData;
    value: TrafficData[keyof TrafficData];
    callback: Function;
}

const TopologyCheckBoxCell: FC<TopologyCheckBoxCellProps> = function ({ data, callback }) {
    const [status, setIsChecked] = useState<boolean>(true);

    const handleChange = (checked: boolean) => {
        setIsChecked(checked);

        if (callback) {
            callback(!checked);
        }
    };

    return <Checkbox isChecked={status} onChange={handleChange} id={data.identity as string} />;
};
