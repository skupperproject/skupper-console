import React, { FC } from 'react';

import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardTitle, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import { formatBytes } from '@core/utils/formatBytes';

import { SitesMetricsLabels } from './Metrics.enum';
import { SitesMetricsProps } from './Metrics.interfaces';

export interface SitesConnectionsDonutChartProps {
    title: string;
    legend?: { name: string }[];
    legendOrientation?: 'horizontal' | 'vertical';
    legendPosition?: 'bottom' | 'right';
    data: { x: string; y: number }[];
    color?: 'orange' | 'purple' | 'blue' | 'green';
}

const SitesConnectionsDonutChart: FC<SitesConnectionsDonutChartProps> = function ({
    title,
    data,
    legend,
    legendOrientation = 'horizontal',
    legendPosition = 'bottom',
    color = 'purple',
}) {
    const totalBytes = data.reduce((acc, { y }) => (acc = acc + y), 0);

    return (
        <Card style={{ height: '250px', width: '100%' }}>
            <CardTitle>{title}</CardTitle>
            <ChartDonut
                constrainToVisibleArea={true}
                data={data}
                labels={({ datum }) => `${datum.x}: ${formatBytes(datum.y)}`}
                legendOrientation={legendOrientation}
                legendData={legend || []}
                legendPosition={legendPosition}
                legendAllowWrap={true}
                padding={{
                    bottom: 80,
                    left: 0,
                    right: 0, // Adjusted to accommodate legend
                    top: 0,
                }}
                themeColor={ChartThemeColor[color]}
                title={formatBytes(totalBytes)}
            />
        </Card>
    );
};

const SitesMetrics: FC<SitesMetricsProps> = function ({
    site,
    httpRequestsReceived,
    httpRequestsSent,
    tcpConnectionsIn,
    tcpConnectionsOut,
}) {
    const httpRequestsReceivedChartData = Object.entries(httpRequestsReceived)
        .map(([siteName, { bytes_out }]) => ({
            x: siteName,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== site.siteName);

    const httpRequestsSentChartData = Object.entries(httpRequestsSent)
        .map(([siteName, { bytes_out }]) => ({
            x: siteName,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== site.siteName);

    const tcpConnectionsInChartData = Object.entries(tcpConnectionsIn).map(
        ([siteName, { bytes_out }]) => ({
            x: siteName,
            y: bytes_out,
        }),
    );

    const tcpConnectionsOutChartData = Object.entries(tcpConnectionsOut).map(
        ([siteName, { bytes_out }]) => ({
            x: siteName,
            y: bytes_out,
        }),
    );

    return (
        <Stack hasGutter>
            <StackItem>
                <Split hasGutter>
                    {!!tcpConnectionsInChartData.length && (
                        <SplitItem isFilled>
                            <SitesConnectionsDonutChart
                                title={SitesMetricsLabels.TCPconnectionsIn}
                                data={tcpConnectionsInChartData}
                            />
                        </SplitItem>
                    )}
                    {!!tcpConnectionsOutChartData.length && (
                        <SplitItem isFilled>
                            <SitesConnectionsDonutChart
                                title={SitesMetricsLabels.TCPconnectionsOut}
                                data={tcpConnectionsOutChartData}
                                color="orange"
                            />
                        </SplitItem>
                    )}
                </Split>
            </StackItem>
            <StackItem>
                <Split hasGutter>
                    {!!httpRequestsReceivedChartData.length && (
                        <SplitItem isFilled>
                            <SitesConnectionsDonutChart
                                title={SitesMetricsLabels.HTTPrequestsIn}
                                data={httpRequestsReceivedChartData}
                                color="green"
                            />
                        </SplitItem>
                    )}
                    {!!httpRequestsSentChartData.length && (
                        <SplitItem isFilled>
                            <SitesConnectionsDonutChart
                                title={SitesMetricsLabels.HTTPrequestsOut}
                                data={httpRequestsSentChartData}
                                color="blue"
                            />
                        </SplitItem>
                    )}
                </Split>
            </StackItem>
        </Stack>
    );
};

export default SitesMetrics;
