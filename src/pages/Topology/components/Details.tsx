import React, { FC, useState } from 'react';

import {
    Checkbox,
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Divider,
    Panel,
    PanelHeader,
    PanelMainBody,
    Title,
    TitleSizes,
    Tooltip,
    Truncate,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import LinkCell from '@core/components/LinkCell';
import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import RealTimeLineChart from '@core/components/RealTimeLineChart';
import SkTable from '@core/components/SkTable';
import { formatByteRate } from '@core/utils/formatBytes';

import { colors } from '../Topology.constant';
import { ConnectionsColumns, ConnectionsLabels } from '../Topology.enum';
import { TopologyDetailsProps, TrafficData, TrafficProps } from '../Topology.interfaces';

const TopologyDetails: FC<TopologyDetailsProps> = function ({
    identity: nodeIdentity,
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
        ({ identity, processId, processName, octetRate, recordCount }) => ({
            identity,
            targetIdentity: processId,
            recordCount,
            name: processName,
            value: octetRate || 0,
            show: !checkBoxSelectedSent || checkBoxSelectedSent[identity],
        }),
    );

    const tcpConnectionsInEntriesChartData = tcpConnectionsInEntries.map(
        ({ identity, processId, processName, octetRate, recordCount }) => ({
            identity,
            targetIdentity: processId,
            recordCount,
            name: processName,
            value: octetRate || 0,
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
            width: 10,
        },
        {
            name: ConnectionsColumns.Name,
            prop: 'name' as keyof TrafficData,
            component: 'nameLinkCell',
            width: 60,
        },
        {
            name: ConnectionsColumns.FlowPairs,
            prop: 'recordCount' as keyof TrafficData,
        },
        {
            name: ConnectionsColumns.ByteRate,
            prop: 'value' as keyof TrafficData,
            format: formatByteRate,
            width: 15,
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
            width: 60,
        },
        {
            name: ConnectionsColumns.FlowPairs,
            prop: 'recordCount' as keyof TrafficData,
        },
        {
            name: ConnectionsColumns.ByteRate,
            prop: 'value' as keyof TrafficData,
            format: formatByteRate,
            width: 15,
        },
    ];

    return (
        <Panel>
            <PanelHeader>
                <Title headingLevel="h1" size={TitleSizes['2xl']}>
                    <Link to={`${link}/${nodeIdentity}`}>
                        <Tooltip content={name}>
                            <Truncate content={name} />
                        </Tooltip>
                    </Link>
                </Title>
            </PanelHeader>
            <Divider />
            <PanelMainBody>
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
                                                    type: 'process',
                                                    link: `${link}/${props.data.targetIdentity}`,
                                                }),
                                        }}
                                    />
                                </DescriptionListDescription>
                            </DescriptionListGroup>
                        )}
                    </DescriptionList>
                )}
            </PanelMainBody>
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
