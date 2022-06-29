import React, { FC } from 'react';

import { ChartDonut } from '@patternfly/react-charts';
import { Card, CardTitle, Split, SplitItem } from '@patternfly/react-core';

import EmptyData from '@core/components/EmptyData';
import { ChartThemeColors } from '@core/components/RealTimeLineChart/RealTimeLineChart.enum';
import { formatBytes } from '@core/utils/formatBytes';

import { MetricsLabels } from './Metrics.enum';
import { DeploymentsMetricsProps, BytesChartProps } from './Metrics.interfaces';

const CARD_HEIGHT = '350px';

const Metrics: FC<DeploymentsMetricsProps> = function ({
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
                                options={{ showTitle: true }}
                                color={ChartThemeColors.Orange}
                            />
                        </SplitItem>
                    </Split>
                )}
            </div>

            <div className="pf-u-mb-md">
                {!!(httpRequestsReceivedChartData.length || httpRequestsSentChartData.length) && (
                    <Split hasGutter>
                        <SplitItem className="pf-u-w-50vw">
                            <BytesChart
                                data={httpRequestsReceivedChartData}
                                title={MetricsLabels.HTTPrequestsReceived}
                                options={{ showTitle: true }}
                                color={ChartThemeColors.Green}
                            />
                        </SplitItem>

                        <SplitItem className="pf-u-w-50vw">
                            <BytesChart
                                data={httpRequestsSentChartData}
                                title={MetricsLabels.HTTPrequestsSent}
                                options={{ showTitle: true }}
                                color={ChartThemeColors.Blue}
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
    const total = data.reduce((acc, { y }) => (acc = acc + y), 0);

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
