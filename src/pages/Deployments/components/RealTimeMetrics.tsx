import React, { FC } from 'react';

import { Card, CardTitle, Split, SplitItem } from '@patternfly/react-core';

import EmptyData from '@core/components/EmptyData';
import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { formatBytes } from '@core/utils/formatBytes';

import { RealTimeMetricsLabels } from './RealTimeMetrics.enum';
import { RealTimeMetricChartProps, RealTimeMetricsProps } from './RealTimeMetrics.interfaces';

const CARD_HEIGHT = 350;
const CARD_WIDTH = 700;

const RealTimeMetrics: FC<RealTimeMetricsProps> = function ({
    deploymentName: name,
    httpRequestsReceived,
    httpRequestsSent,
    tcpConnectionsIn,
    tcpConnectionsOut,
}) {
    const httpBytesReceivedChartData = Object.values(httpRequestsReceived)
        .map(({ client, bytes_out }) => ({
            name: client,
            value: bytes_out,
        }))
        .filter(({ name: NameItem }) => NameItem !== name);

    const httpBytesSentChartData = Object.values(httpRequestsSent)
        .map(({ client, bytes_out }) => ({
            name: client,
            value: bytes_out,
        }))
        .filter(({ name: NameItem }) => NameItem !== name);

    const tcpBytesInChartData = Object.values(tcpConnectionsIn)
        .map(({ client, bytes_out }) => ({
            name: client,
            value: bytes_out,
        }))
        .filter(({ name: NameItem }) => NameItem !== name);

    const tcpBytesOutChartData = Object.values(tcpConnectionsOut)
        .map(({ client, bytes_out }) => ({
            name: client,
            value: bytes_out,
        }))
        .filter(({ name: NameItem }) => NameItem !== name);

    return (
        <div className="pf-u-py-md">
            {!!(tcpBytesInChartData.length || tcpBytesOutChartData.length) && (
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50vw">
                        <RealTimeMetricChart
                            data={tcpBytesInChartData}
                            title={RealTimeMetricsLabels.TCPbytesIn}
                            formatter={formatBytes}
                        />
                    </SplitItem>

                    <SplitItem className="pf-u-w-50vw">
                        <RealTimeMetricChart
                            data={tcpBytesOutChartData}
                            title={RealTimeMetricsLabels.TCPbytesOut}
                            color={ChartThemeColors.Orange}
                            formatter={formatBytes}
                        />
                    </SplitItem>
                </Split>
            )}

            {!!(httpBytesReceivedChartData.length || httpBytesSentChartData.length) && (
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50vw">
                        <RealTimeMetricChart
                            data={httpBytesReceivedChartData}
                            title={RealTimeMetricsLabels.HTTPbytesIn}
                            color={ChartThemeColors.Blue}
                            formatter={formatBytes}
                        />
                    </SplitItem>

                    <SplitItem className="pf-u-w-50vw">
                        <RealTimeMetricChart
                            data={httpBytesSentChartData}
                            title={RealTimeMetricsLabels.HTTbytesOut}
                            color={ChartThemeColors.Green}
                            formatter={formatBytes}
                        />
                    </SplitItem>
                </Split>
            )}
        </div>
    );
};

export default RealTimeMetrics;

const RealTimeMetricChart: FC<RealTimeMetricChartProps> = function ({
    data,
    title,
    color = ChartThemeColors.Purple,
    formatter,
}) {
    const dataLegend = data.map(({ name }) => ({ name }));

    return (
        <Card style={{ height: `${CARD_HEIGHT}px` }}>
            <CardTitle>{title}</CardTitle>
            {data.length ? (
                <RealTimeLineChart
                    options={{
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        chartColor: color,
                        formatter,
                        dataLegend,
                        padding: {
                            top: 10,
                            bottom: 180,
                            left: 100,
                            right: 20,
                        },
                    }}
                    data={data}
                />
            ) : (
                <EmptyData />
            )}
        </Card>
    );
};
