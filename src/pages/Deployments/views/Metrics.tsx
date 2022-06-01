import React, { FC } from 'react';

import { ChartDonut, ChartThemeColor } from '@patternfly/react-charts';
import { Card, CardTitle, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import EmptyData from '@core/components/EmptyData';
import { formatBytes } from '@core/utils/formatBytes';

import { SitesMetricsLabels } from './Metrics.enum';
import { SitesConnectionsDonutChartProps, DeploymentsMetricsProps } from './Metrics.interfaces';

const CARD_HEIGHT = '250px';

const DeploymentsConnectionsDonutChart: FC<SitesConnectionsDonutChartProps> = function ({
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

const DeploymentsMetrics: FC<DeploymentsMetricsProps> = function ({
    deploymentName: name,
    httpRequestsReceived,
    httpRequestsSent,
    tcpConnectionsIn,
    tcpConnectionsOut,
}) {
    const httpRequestsReceivedChartData = Object.values(httpRequestsReceived)
        .map(({ client, bytes_out }) => ({
            x: client,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== name);

    const httpRequestsSentChartData = Object.values(httpRequestsSent)
        .map(({ client, bytes_out }) => ({
            x: client,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== name);

    const tcpConnectionsInChartData = Object.values(tcpConnectionsIn)
        .map(({ client, bytes_out }) => ({
            x: client,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== name);

    const tcpConnectionsOutChartData = Object.values(tcpConnectionsOut)
        .map(({ client, bytes_out }) => ({
            x: client,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== name);

    return (
        <Stack hasGutter>
            {!!(tcpConnectionsInChartData.length || tcpConnectionsOutChartData.length) && (
                <StackItem>
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <Card style={{ height: CARD_HEIGHT }}>
                                <CardTitle>{SitesMetricsLabels.TCPconnectionsIn}</CardTitle>
                                {tcpConnectionsInChartData.length ? (
                                    <DeploymentsConnectionsDonutChart
                                        data={tcpConnectionsInChartData}
                                    />
                                ) : (
                                    <EmptyData />
                                )}
                            </Card>
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <Card style={{ height: CARD_HEIGHT }}>
                                <CardTitle>{SitesMetricsLabels.TCPconnectionsOut}</CardTitle>
                                {tcpConnectionsOutChartData.length ? (
                                    <DeploymentsConnectionsDonutChart
                                        data={tcpConnectionsOutChartData}
                                        color="orange"
                                    />
                                ) : (
                                    <EmptyData />
                                )}
                            </Card>
                        </SplitItem>
                    </Split>
                </StackItem>
            )}

            {!!(httpRequestsReceivedChartData.length || httpRequestsSentChartData.length) && (
                <StackItem>
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <Card style={{ height: CARD_HEIGHT }}>
                                <CardTitle>{SitesMetricsLabels.HTTbytesIn}</CardTitle>
                                {httpRequestsReceivedChartData.length ? (
                                    <DeploymentsConnectionsDonutChart
                                        data={httpRequestsReceivedChartData}
                                        color="green"
                                    />
                                ) : (
                                    <EmptyData />
                                )}
                            </Card>
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <Card style={{ height: CARD_HEIGHT }}>
                                <CardTitle>{SitesMetricsLabels.HTTbytesOut}</CardTitle>
                                {httpRequestsSentChartData.length ? (
                                    <DeploymentsConnectionsDonutChart
                                        data={httpRequestsSentChartData}
                                        color="blue"
                                    />
                                ) : (
                                    <EmptyData />
                                )}
                            </Card>
                        </SplitItem>
                    </Split>
                </StackItem>
            )}
        </Stack>
    );
};

export default DeploymentsMetrics;
