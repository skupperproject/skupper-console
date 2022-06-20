import React, { FC } from 'react';

import { ChartDonut } from '@patternfly/react-charts';
import { Card, CardTitle, Split, SplitItem } from '@patternfly/react-core';

import EmptyData from '@core/components/EmptyData';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';

import { MetricsLabels } from './Metrics.enum';
import { CustomDonutProps, CustomDonutChartProps, MetricsProps } from './Metrics.interfaces';

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
                {!!(
                    httpRequestsReceivedChartData.length ||
                    httpRequestsSentChartData.length ||
                    httpLatencyReceivedChartData.length ||
                    httpLatencySentChartData.length
                ) && (
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <BytesChart
                                data={httpRequestsReceivedChartData}
                                title={MetricsLabels.HTTPMaxLatencyOut}
                                color={ChartThemeColors.Purple}
                                options={{ formatter: formatTime }}
                            />
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <BytesChart
                                data={httpRequestsSentChartData}
                                title={MetricsLabels.HTTPrequestsSent}
                                color={ChartThemeColors.Orange}
                                options={{ formatter: formatTime }}
                            />
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <BytesChart
                                data={httpLatencyReceivedChartData}
                                title={MetricsLabels.HTTPrequestsReceived}
                                color={ChartThemeColors.Cyan}
                                options={{ formatter: formatTime }}
                            />
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <BytesChart
                                data={httpLatencySentChartData}
                                title={MetricsLabels.HTTPMaxLatencyIn}
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

const BytesChart: FC<CustomDonutProps> = function ({
    data,
    title,
    color = ChartThemeColors.Purple,
    options,
}) {
    const legend = data.map(({ x }) => ({ name: x }));

    return (
        <Card style={{ height: CARD_HEIGHT }}>
            <CardTitle>{title}</CardTitle>
            {data.length ? (
                <CustomDonutChart data={data} color={color} legend={legend} options={options} />
            ) : (
                <EmptyData />
            )}
        </Card>
    );
};

const CustomDonutChart: FC<CustomDonutChartProps> = function ({
    data,
    legend,
    legendOrientation = 'horizontal',
    legendPosition = 'bottom',
    color = ChartThemeColors.Purple,
    options,
}) {
    const total = data.reduce((acc, { y }) => (acc = acc + y), 0);

    return (
        <ChartDonut
            height={350}
            width={700}
            data={data}
            labels={({ datum }) =>
                `${datum.x}: ${
                    options?.formatter ? options?.formatter(datum.y) : formatBytes(datum.y)
                }`
            }
            legendOrientation={legendOrientation}
            legendData={legend || []}
            legendPosition={legendPosition}
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
    );
};
