import React, { FC } from 'react';

import { ChartDonut } from '@patternfly/react-charts';
import { Card, CardTitle, Split, SplitItem } from '@patternfly/react-core';

import EmptyData from '@core/components/EmptyData';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { formatBytes } from '@core/utils/formatBytes';

import { MetricsLabels } from './Metrics.enum';
import { MetricChartProps, MetricsChartProps, MetricsProps } from './Metrics.interfaces';

const CARD_HEIGHT = '350px';

const Metrics: FC<MetricsProps> = function ({
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
        <div className="pf-u-py-md">
            {!!(tcpConnectionsInChartData.length || tcpConnectionsOutChartData.length) && (
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50vw">
                        <MetricChart
                            data={tcpConnectionsInChartData}
                            title={MetricsLabels.TCPconnectionsIn}
                        />
                    </SplitItem>

                    <SplitItem className="pf-u-w-50vw">
                        <MetricChart
                            data={tcpConnectionsOutChartData}
                            title={MetricsLabels.TCPconnectionsOut}
                            color={ChartThemeColors.Orange}
                        />
                    </SplitItem>
                </Split>
            )}

            {!!(httpRequestsReceivedChartData.length || httpRequestsSentChartData.length) && (
                <Split hasGutter>
                    <SplitItem className="pf-u-w-50vw">
                        <MetricChart
                            data={httpRequestsReceivedChartData}
                            title={MetricsLabels.HTTPbytesIn}
                            color={ChartThemeColors.Green}
                        />
                    </SplitItem>

                    <SplitItem className="pf-u-w-50vw">
                        <MetricChart
                            data={httpRequestsSentChartData}
                            title={MetricsLabels.HTTbytesOut}
                            color={ChartThemeColors.Blue}
                        />
                    </SplitItem>
                </Split>
            )}
        </div>
    );
};

export default Metrics;

const MetricChart: FC<MetricChartProps> = function ({
    data,
    title,
    color = ChartThemeColors.Purple,
}) {
    const legend = data.map(({ x }) => ({ name: x }));

    return (
        <Card style={{ height: CARD_HEIGHT }}>
            <CardTitle>{title}</CardTitle>
            {data.length ? (
                <MetricsChart data={data} color={color} legend={legend} />
            ) : (
                <EmptyData />
            )}
        </Card>
    );
};

const MetricsChart: FC<MetricsChartProps> = function ({
    data,
    legend,
    legendOrientation = 'horizontal',
    legendPosition = 'bottom',
    color = ChartThemeColors.Purple,
}) {
    const totalBytes = data.reduce((acc, { y }) => (acc = acc + y), 0);

    return (
        <ChartDonut
            height={350}
            width={700}
            data={data}
            labels={({ datum }) => `${datum.x}: ${formatBytes(datum.y)}`}
            legendOrientation={legendOrientation}
            legendData={legend || []}
            legendPosition={legendPosition}
            legendAllowWrap={true}
            padding={{
                bottom: 120,
                left: 0,
                right: 0, // Adjusted to accommodate legend
                top: 0,
            }}
            themeColor={color}
            title={formatBytes(totalBytes)}
        />
    );
};
