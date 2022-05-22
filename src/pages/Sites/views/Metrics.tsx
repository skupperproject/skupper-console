import React, { FC } from 'react';

import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardTitle, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import EmptyData from '@core/components/EmptyData';
import { ChartThemeColors } from '@core/components/TrafficChart/TrafficChart.enum';
import { formatBytes } from '@core/utils/formatBytes';

import { SitesMetricsLabels } from './Metrics.enum';
import { SitesConnectionsDonutChartProps, SitesMetricsProps } from './Metrics.interfaces';

const CARD_HEIGHT = '250px';

const SitesConnectionsDonutChart: FC<SitesConnectionsDonutChartProps> = function ({
    data,
    legend,
    legendOrientation = 'horizontal',
    legendPosition = 'bottom',
    color = 'purple',
}) {
    const totalBytes = data.reduce((acc, { y }) => (acc = acc + y), 0);

    return (
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
    );
};

const SitesMetrics: FC<SitesMetricsProps> = function ({
    siteName: name,
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
        .filter(({ x }) => x !== name);

    const httpRequestsSentChartData = Object.entries(httpRequestsSent)
        .map(([siteName, { bytes_out }]) => ({
            x: siteName,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== name);

    const tcpConnectionsInChartData = Object.entries(tcpConnectionsIn)
        .map(([siteName, { bytes_out }]) => ({
            x: siteName,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== name);

    const tcpConnectionsOutChartData = Object.entries(tcpConnectionsOut)
        .map(([siteName, { bytes_out }]) => ({
            x: siteName,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== name);

    return (
        <Stack hasGutter>
            <StackItem>
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50vw">
                        <Card style={{ height: CARD_HEIGHT }}>
                            <CardTitle>{SitesMetricsLabels.TCPconnectionsIn}</CardTitle>
                            {tcpConnectionsInChartData.length ? (
                                <SitesConnectionsDonutChart data={tcpConnectionsInChartData} />
                            ) : (
                                <EmptyData />
                            )}
                        </Card>
                    </SplitItem>

                    <SplitItem className="pf-u-w-50vw">
                        <Card style={{ height: CARD_HEIGHT }}>
                            <CardTitle>{SitesMetricsLabels.TCPconnectionsOut}</CardTitle>
                            {tcpConnectionsOutChartData.length ? (
                                <SitesConnectionsDonutChart
                                    data={tcpConnectionsOutChartData}
                                    color={ChartThemeColors.Orange}
                                />
                            ) : (
                                <EmptyData />
                            )}
                        </Card>
                    </SplitItem>
                </Split>
            </StackItem>

            <StackItem>
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50vw">
                        <Card style={{ height: CARD_HEIGHT }}>
                            <CardTitle>{SitesMetricsLabels.HTTPrequestsIn}</CardTitle>
                            {httpRequestsReceivedChartData.length ? (
                                <SitesConnectionsDonutChart
                                    data={httpRequestsReceivedChartData}
                                    color={ChartThemeColors.Green}
                                />
                            ) : (
                                <EmptyData />
                            )}
                        </Card>
                    </SplitItem>

                    <SplitItem className="pf-u-w-50vw">
                        <Card style={{ height: CARD_HEIGHT }}>
                            <CardTitle>{SitesMetricsLabels.HTTPrequestsOut}</CardTitle>
                            {httpRequestsSentChartData.length ? (
                                <SitesConnectionsDonutChart
                                    data={httpRequestsSentChartData}
                                    color={ChartThemeColors.Blue}
                                />
                            ) : (
                                <EmptyData />
                            )}
                        </Card>
                    </SplitItem>
                </Split>
            </StackItem>
        </Stack>
    );
};

export default SitesMetrics;
