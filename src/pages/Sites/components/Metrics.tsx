import React, { FC } from 'react';

import {
    Chart,
    ChartAxis,
    ChartBar,
    ChartDonut,
    ChartGroup,
    ChartThemeColor,
    ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { Card, CardTitle, Split, SplitItem } from '@patternfly/react-core';

import EmptyData from '@core/components/EmptyData';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';

import { MetricsLabels } from './Metrics.enum';
import { BytesChartProps, MetricsProps } from './Metrics.interfaces';

const CARD_HEIGHT = '350px';

const Metrics: FC<MetricsProps> = function ({
    siteName: name,
    httpRequestsReceived,
    httpRequestsSent,
    tcpConnectionsIn,
    tcpConnectionsOut,
}) {
    const httpBytesReceivedChartData = Object.entries(httpRequestsReceived)
        .map(([siteName, { bytes_out }]) => ({
            x: siteName,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== name);

    const httpBytesSentChartData = Object.entries(httpRequestsSent)
        .map(([siteName, { bytes_out }]) => ({
            x: siteName,
            y: bytes_out,
        }))
        .filter(({ x }) => x !== name);

    const httpLatencyReceivedChartData = Object.entries(httpRequestsReceived)
        .map(([siteName, { latency_max }]) => ({
            x: siteName,
            y: latency_max,
        }))
        .filter(({ x }) => x !== name);

    const httpLatencySentChartData = Object.entries(httpRequestsSent)
        .map(([siteName, { latency_max }]) => ({
            x: siteName,
            y: latency_max,
        }))
        .filter(({ x }) => x !== name);

    const httpRequestsReceivedChartData = Object.entries(httpRequestsReceived)
        .map(([siteName, { requests }]) => ({
            x: siteName,
            y: requests || 0,
        }))
        .filter(({ x }) => x !== name);

    const httpRequestsSentChartData = Object.entries(httpRequestsSent)
        .map(([siteName, { requests }]) => ({
            x: siteName,
            y: requests || 0,
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
        <>
            <div className="pf-u-mb-md">
                {!!(tcpConnectionsInChartData.length || tcpConnectionsOutChartData.length) && (
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <BytesChart
                                data={tcpConnectionsInChartData}
                                title={MetricsLabels.TCPconnectionsIn}
                                options={{ showTitle: true }}
                            />
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <BytesChart
                                data={tcpConnectionsOutChartData}
                                title={MetricsLabels.TCPconnectionsOut}
                                color={ChartThemeColors.Orange}
                                options={{ showTitle: true }}
                            />
                        </SplitItem>
                    </Split>
                )}

                {!!(httpBytesReceivedChartData.length || httpBytesSentChartData.length) && (
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <BytesChart
                                data={httpBytesReceivedChartData}
                                title={MetricsLabels.HTTPbytesIn}
                                color={ChartThemeColors.Green}
                                options={{ showTitle: true }}
                            />
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <BytesChart
                                data={httpBytesSentChartData}
                                title={MetricsLabels.HTTbytesOut}
                                color={ChartThemeColors.Blue}
                                options={{ showTitle: true }}
                            />
                        </SplitItem>
                    </Split>
                )}
            </div>

            <div className="pf-u-mb-md">
                {!!(httpRequestsReceivedChartData.length || httpRequestsSentChartData.length) && (
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <RequestsLatenciesChart
                                data={httpRequestsReceivedChartData}
                                title={MetricsLabels.HTTPrequestsReceived}
                                color={ChartThemeColors.Purple}
                            />
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <RequestsLatenciesChart
                                data={httpRequestsSentChartData}
                                title={MetricsLabels.HTTPrequestsSent}
                                color={ChartThemeColors.Orange}
                            />
                        </SplitItem>
                    </Split>
                )}
            </div>

            <div className="pf-u-mb-md">
                {!!(httpLatencyReceivedChartData.length || httpLatencySentChartData.length) && (
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <RequestsLatenciesChart
                                data={httpLatencyReceivedChartData}
                                title={MetricsLabels.HTTPMaxLatencyIn}
                                color={ChartThemeColors.Cyan}
                                options={{ formatter: formatTime }}
                            />
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <RequestsLatenciesChart
                                data={httpLatencySentChartData}
                                title={MetricsLabels.HTTPMaxLatencyOut}
                                color={ChartThemeColors.Gray}
                                options={{ formatter: formatTime }}
                            />
                        </SplitItem>
                    </Split>
                )}
            </div>
        </>
    );
};

export default Metrics;

const BytesChart: FC<BytesChartProps> = function ({
    data,
    title,
    color = ChartThemeColors.Purple,
    options,
}) {
    const legend = data.map(({ x }) => ({ name: x }));
    const total = data.reduce((acc, { y }) => acc + y, 0);

    return (
        <Card style={{ height: CARD_HEIGHT }}>
            <CardTitle>{title}</CardTitle>
            {data.length ? (
                <ChartDonut
                    height={350}
                    width={700}
                    data={data}
                    labels={({ datum }) =>
                        `${datum.x}: ${
                            options?.formatter ? options?.formatter(datum.y) : formatBytes(datum.y)
                        }`
                    }
                    legendOrientation="horizontal"
                    legendData={legend || []}
                    legendPosition="bottom"
                    legendAllowWrap={true}
                    padding={{
                        bottom: 160,
                        left: 0,
                        right: 0, // Adjusted to accommodate legend
                        top: 0,
                    }}
                    themeColor={color}
                    title={
                        options?.showTitle
                            ? options?.formatter
                                ? options?.formatter(total)
                                : formatBytes(total)
                            : ''
                    }
                />
            ) : (
                <EmptyData />
            )}
        </Card>
    );
};

const RequestsLatenciesChart: FC<BytesChartProps> = function ({
    data,
    title,
    color = ChartThemeColor.multiOrdered,
    options,
}) {
    const legend = data.map(({ x }) => ({ name: x }));

    return (
        <Card style={{ height: CARD_HEIGHT }}>
            <CardTitle>{title}</CardTitle>
            <Chart
                containerComponent={
                    <ChartVoronoiContainer
                        labels={({ datum }) =>
                            `${datum.x}: ${
                                options?.formatter
                                    ? options?.formatter(datum.y, { startSize: 'ms' })
                                    : datum.y
                            }`
                        }
                        constrainToVisibleArea
                    />
                }
                domainPadding={{ x: [10, 15] }}
                legendData={legend}
                legendPosition="bottom-left"
                padding={{
                    bottom: 160,
                    left: 10,
                    right: 10,
                    top: 0,
                }}
                themeColor={color}
                height={350}
            >
                <ChartAxis
                    style={{
                        tickLabels: { fontSize: 12 },
                    }}
                />
                <ChartAxis
                    dependentAxis
                    showGrid
                    fixLabelOverlap={true}
                    style={{
                        tickLabels: { fontSize: 12 },
                    }}
                    tickFormat={(tick) =>
                        options?.formatter
                            ? options?.formatter(tick, { startSize: 'ms' })
                            : Math.ceil(tick)
                    }
                />
                <ChartGroup horizontal>
                    <ChartBar data={data} />
                </ChartGroup>
            </Chart>
        </Card>
    );
};
