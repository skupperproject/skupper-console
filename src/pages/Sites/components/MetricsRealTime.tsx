import React, { FC } from 'react';

import { Card, CardTitle, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import TrafficChart from '@core/components/TrafficChart';
import { ChartThemeColors } from '@core/components/TrafficChart/TrafficChart.enum';

import { MetricsRealTimeLabels } from './MetricsRealTime.enum';
import { SitesMetricsRealTimeProps } from './MetricsRealTime.interfaces';

const MetricsRealTime: FC<SitesMetricsRealTimeProps> = function ({
    siteName: name,
    timestamp,
    httpRequestsReceived,
    httpRequestsSent,
    tcpConnectionsIn,
    tcpConnectionsOut,
}) {
    const httpRequestsReceivedChartData = Object.entries(httpRequestsReceived)
        .map(([siteName, { bytes_out }]) => ({
            name: siteName,
            totalBytes: bytes_out,
        }))
        .filter(({ name: sName }) => sName !== name);

    const httpRequestsSentChartData = Object.entries(httpRequestsSent)
        .map(([siteName, { bytes_out }]) => ({
            name: siteName,
            totalBytes: bytes_out,
        }))
        .filter(({ name: sName }) => sName !== name);

    const tcpConnectionsInChartData = Object.entries(tcpConnectionsIn)
        .map(([siteName, { bytes_out }]) => ({
            name: siteName,
            totalBytes: bytes_out,
        }))
        .filter(({ name: sName }) => sName !== name);

    const tcpConnectionsOutChartData = Object.entries(tcpConnectionsOut)
        .map(([siteName, { bytes_out }]) => ({
            name: siteName,
            totalBytes: bytes_out,
        }))
        .filter(({ name: sName }) => sName !== name);

    return (
        <Stack>
            <StackItem>
                <Split hasGutter>
                    {!!tcpConnectionsOutChartData.length && (
                        <SplitItem className="pf-u-w-50vw">
                            <Card>
                                <CardTitle>{MetricsRealTimeLabels.TCPconnectionsIn}</CardTitle>
                                <TrafficChart
                                    timestamp={timestamp}
                                    totalBytesProps={[...tcpConnectionsInChartData]}
                                />
                            </Card>
                        </SplitItem>
                    )}

                    {!!tcpConnectionsInChartData.length && (
                        <SplitItem className="pf-u-w-50vw">
                            <Card>
                                <CardTitle>{MetricsRealTimeLabels.TCPconnectionsOut}</CardTitle>
                                <TrafficChart
                                    timestamp={timestamp}
                                    options={{
                                        chartColor: ChartThemeColors.Orange,
                                    }}
                                    totalBytesProps={[...tcpConnectionsOutChartData]}
                                />
                            </Card>
                        </SplitItem>
                    )}
                </Split>
            </StackItem>

            <StackItem>
                <Split hasGutter>
                    {!!httpRequestsReceivedChartData.length && (
                        <SplitItem className="pf-u-w-50vw">
                            <Card>
                                <CardTitle>{MetricsRealTimeLabels.HTTPrequestsIn}</CardTitle>
                                <TrafficChart
                                    timestamp={timestamp}
                                    options={{
                                        chartColor: ChartThemeColors.Blue,
                                    }}
                                    totalBytesProps={[...httpRequestsReceivedChartData]}
                                />
                            </Card>
                        </SplitItem>
                    )}

                    {!!httpRequestsSentChartData.length && (
                        <SplitItem className="pf-u-w-50vw">
                            <Card>
                                <CardTitle>{MetricsRealTimeLabels.HTTPrequestsOut}</CardTitle>
                                <TrafficChart
                                    timestamp={timestamp}
                                    options={{
                                        chartColor: ChartThemeColors.Green,
                                    }}
                                    totalBytesProps={[...httpRequestsSentChartData]}
                                />
                            </Card>
                        </SplitItem>
                    )}
                </Split>
            </StackItem>
        </Stack>
    );
};

export default MetricsRealTime;
