import React, { FC } from 'react';

import { Card, CardTitle, Split, SplitItem } from '@patternfly/react-core';

import EmptyData from '@core/components/EmptyData';
import RealTimeLineChart from '@core/components/RealTimeLineChart';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { formatBytes } from '@core/utils/formatBytes';

import { RealTimeMetricsLabels } from './RealTimeMetrics.enum';
import { RealTimeMetricChartProps, RealTimeMetricsProps } from './RealTimeMetrics.interfaces';

const CARD_HEIGHT = '450px';

const RealTimeMetrics: FC<RealTimeMetricsProps> = function ({
    siteName: name,
    timestamp,
    httpRequestsReceived,
    httpRequestsSent,
    tcpConnectionsIn,
    tcpConnectionsOut,
}) {
    const httpBytesReceivedChartData = Object.entries(httpRequestsReceived)
        .map(([siteName, { bytes_out }]) => ({
            name: siteName,
            value: bytes_out,
        }))
        .filter(({ name: sName }) => sName !== name);

    const httpBytesSentChartData = Object.entries(httpRequestsSent)
        .map(([siteName, { bytes_out }]) => ({
            name: siteName,
            value: bytes_out,
        }))
        .filter(({ name: sName }) => sName !== name);

    const tcpBytesInChartData = Object.entries(tcpConnectionsIn)
        .map(([siteName, { bytes_out }]) => ({
            name: siteName,
            value: bytes_out,
        }))
        .filter(({ name: sName }) => sName !== name);

    const tcpBytesOutChartData = Object.entries(tcpConnectionsOut)
        .map(([siteName, { bytes_out }]) => ({
            name: siteName,
            value: bytes_out,
        }))
        .filter(({ name: sName }) => sName !== name);

    const httpRequestsReceivedChartData = Object.entries(httpRequestsReceived)
        .map(([siteName, { requests }]) => ({
            name: siteName,
            value: requests || 0,
        }))
        .filter(({ name: sName }) => sName !== name);

    const httpRequestsSentChartData = Object.entries(httpRequestsSent)
        .map(([siteName, { requests }]) => ({
            name: siteName,
            value: requests || 0,
        }))
        .filter(({ name: sName }) => sName !== name);

    return (
        <div className="pf-u-py-md">
            {!!(tcpBytesInChartData.length || tcpBytesOutChartData.length) && (
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50vw">
                        <RealTimeMetricChart
                            data={tcpBytesInChartData}
                            title={RealTimeMetricsLabels.TCPbytesIn}
                            timestamp={timestamp}
                            formatter={formatBytes}
                        />
                    </SplitItem>

                    <SplitItem className="pf-u-w-50vw">
                        <RealTimeMetricChart
                            data={tcpBytesOutChartData}
                            title={RealTimeMetricsLabels.TCPbytesOut}
                            color={ChartThemeColors.Orange}
                            timestamp={timestamp}
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
                            timestamp={timestamp}
                            formatter={formatBytes}
                        />
                    </SplitItem>

                    <SplitItem className="pf-u-w-50vw">
                        <RealTimeMetricChart
                            data={httpBytesSentChartData}
                            title={RealTimeMetricsLabels.HTTbytesOut}
                            color={ChartThemeColors.Green}
                            timestamp={timestamp}
                            formatter={formatBytes}
                        />
                    </SplitItem>
                </Split>
            )}

            {!!(httpRequestsReceivedChartData.length || httpRequestsSentChartData.length) && (
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50vw">
                        <RealTimeMetricChart
                            data={httpRequestsReceivedChartData}
                            title={RealTimeMetricsLabels.HTTPrequestsIn}
                            color={ChartThemeColors.Cyan}
                            timestamp={timestamp}
                        />
                    </SplitItem>

                    <SplitItem className="pf-u-w-50vw">
                        <RealTimeMetricChart
                            data={httpRequestsSentChartData}
                            title={RealTimeMetricsLabels.HTTPrequestsOut}
                            color={ChartThemeColors.Gray}
                            timestamp={timestamp}
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
    timestamp = 0,
}) {
    const dataLegend = data.map(({ name }) => ({ name }));

    return (
        <Card style={{ height: CARD_HEIGHT }}>
            <CardTitle>{title}</CardTitle>
            {data.length ? (
                <RealTimeLineChart
                    timestamp={timestamp}
                    options={{
                        chartColor: color,
                        formatter,
                        dataLegend,
                    }}
                    data={data}
                />
            ) : (
                <EmptyData />
            )}
        </Card>
    );
};
